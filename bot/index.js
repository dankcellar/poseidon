const Web3 = require("web3");
const PoseidonAbi = require("./abi/Poseidon.json");
const Discord = require("discord.js");
const ethers = require("ethers");
const fetch = require("node-fetch");
require("dotenv").config();


// Returns the image url for a certain tokenId and power
function tokenImage(tokenId, power) {
    const type = (power >= 1000) ? "kraken" : ((power >= 100) ? "whale" : (power >= 10) ? "shark" : "fish");
    return process.env.API_IMAGE_URL + tokenId + "-" + type + ".png";
}


// Infura connection
let infuraWsURL = "wss://mainnet.infura.io/ws/v3/" + process.env.INFURA_ID;
let openseaURL = "https://api.opensea.io/api/v1/";
if (process.env.LIVE_MODE !== "1") {
    infuraWsURL = "wss://rinkeby.infura.io/ws/v3/" + process.env.INFURA_ID;
    openseaURL = "https://rinkeby-api.opensea.io/api/v1/";
}
const web3 = new Web3(new Web3.providers.WebsocketProvider(infuraWsURL));
const poseidon = new web3.eth.Contract(PoseidonAbi, process.env.CONTRACT_ADDRESS);


// Discord init
let lastHuntsChannel = null;
let lastSalesChannel = null;
const client = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
});
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.channels.fetch(process.env.LAST_HUNTS_CHANNEL_ID).then(function (c) {
        lastHuntsChannel = c;
    });
    client.channels.fetch(process.env.LAST_SALES_CHANNEL_ID).then(function (c) {
        lastSalesChannel = c;
    });
});
// Command for showing fish data
client.on("messageCreate", (message) => {
    if (message.content.startsWith("#")) {
        const tokenId = parseInt(message.content.substr(1));
        if (tokenId <= 0 || tokenId > 10000) {
            return;
        }
        poseidon.methods.power(tokenId).call().then(function (power) {
            if (power === 0) {
                message.reply("Fish #" + tokenId + " has been hunted");
            }
            const buildMessage = new Discord.MessageEmbed()
                .setTitle("Fish #" + power)
                .setThumbnail(tokenImage(tokenId, power))
                .addFields({name: "Power:", value: power})
            message.reply({embeds: [buildMessage]});
        });
    }
});
// Login
client.login(process.env.DISCORD_TOKEN);


// Hunting event
poseidon.events.Hunt({fromBlock: 0})
    .on("data", e => {
        try {
            if (lastHuntsChannel === null) return;
            const from = e.returnValues["from"];
            const predator = e.returnValues["predator"];
            const prey = e.returnValues["prey"];
            const power = e.returnValues["power"];
            const buildMessage = new Discord.MessageEmbed()
                .setTitle("Hunt!")
                .setDescription("Fish #" + predator + " hunted fish #" + prey)
                .setThumbnail(tokenImage(predator, power))
                .addFields({name: "Power:", value: power}, {name: "Owner:", value: from})
            lastHuntsChannel.send({embeds: [buildMessage]});
        } catch (e) {
            console.log("Error while processing hunt event: " + e);
        }
    })
    .on("error", e => {
        console.log("Error on hunt event: " + e);
    });


// Opensea sales
let lastSaleDate = Math.floor(new Date().getTime() / 1000);
async function openseaSales() {
    try {
        if (lastSalesChannel === null) return;
        // console.log(lastSaleDate.toString());
        const params = new URLSearchParams({
            asset_contract_address: process.env.CONTRACT_ADDRESS,
            event_type: "successful",
            only_opensea: "false",
            offset: "0",
            limit: "20",
            occurred_after: lastSaleDate.toString(),
        });
        const resp = await fetch(openseaURL + "events?" + params);
        const openSeaResponse = await resp.json();
        if (typeof openSeaResponse.asset_events !== "undefined") {
            openSeaResponse.asset_events.forEach(function (sale) {
                const price = ethers.utils.formatEther(sale.total_price || "0");
                const buildMessage = new Discord.MessageEmbed()
                    .setTitle(sale.asset.name + " sold!")
                    .setURL(sale.asset.permalink)
                    .addFields({name: "Price:", value: price + " eth"})
                    .setThumbnail(sale.asset.image_url)
                lastSalesChannel.send({embeds: [buildMessage]});
                // update date to always fetch only the new ones
                const saleDate = Math.floor(new Date(sale.created_date + "Z").getTime() / 1000);
                if (saleDate > lastSaleDate) {
                    lastSaleDate = saleDate + 1;
                }
            });
        }
    } catch (e) {
        console.log("Error while processing OpenSea sales: " + e);
    }
}
setInterval(openseaSales, 15*1000); // every 15 seconds
