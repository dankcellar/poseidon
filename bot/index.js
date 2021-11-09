const Web3 = require("web3");
const PoseidonAbi = require("./abi/Poseidon.json");
const Discord = require("discord.js");
const ethers = require("ethers");
const fetch = require("node-fetch");
const oauth = require('oauth');
require("dotenv").config();


// Returns the image url for a certain tokenId and power
function tokenImage(tokenId, power) {
    const type = (power >= 1000) ? "kraken" : ((power >= 100) ? "whale" : (power >= 10) ? "shark" : "fish");
    return process.env.API_IMAGE_URL + tokenId + "-" + type + ".png";
}


// Infura init
let infuraWsURL = "wss://mainnet.infura.io/ws/v3/" + process.env.INFURA_ID;
let openseaApiURL = "https://api.opensea.io/api/v1/";
let openseaTokenURL = "https://opensea.io/assets/" + process.env.CONTRACT_ADDRESS + "/";
if (process.env.LIVE_MODE !== "1") {
    infuraWsURL = "wss://rinkeby.infura.io/ws/v3/" + process.env.INFURA_ID;
    openseaApiURL = "https://rinkeby-api.opensea.io/api/v1/";
    openseaTokenURL = "https://testnets.opensea.io/assets/" + process.env.CONTRACT_ADDRESS + "/";
}
const web3 = new Web3(new Web3.providers.WebsocketProvider(infuraWsURL));
const poseidon = new web3.eth.Contract(PoseidonAbi, process.env.CONTRACT_ADDRESS);


// Twitter init
const twitter_oauth = new oauth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    process.env.TWITTER_APP_CONSUMER_KEY,
    process.env.TWITTER_APP_SECRET,
    '1.0A',
    null,
    'HMAC-SHA1'
);
function sentTweet(status) {
    const postBody = {"status": status};
    twitter_oauth.post('https://api.twitter.com/1.1/statuses/update.json',
        process.env.TWITTER_USER_TOKEN,
        process.env.TWITTER_USER_SECRET,
        postBody,
        "",
        function(e, data, res) { if (e) { console.log(e); }}
    );
}


// Discord init
let lastHuntsChannel = null;
let lastSalesChannel = null;
const client = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
});
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.channels.fetch(process.env.OPENSEA_LAST_HUNTS_CHANNEL_ID).then(function (c) {
        lastHuntsChannel = c;
        console.log("Last hunts channel ready");
    });
    client.channels.fetch(process.env.OPENSEA_LAST_SALES_CHANNEL_ID).then(function (c) {
        lastSalesChannel = c;
        console.log("Last sales channel ready");
    });
});
// Discord command for showing fish data
client.on("messageCreate", (message) => {
    async function showFish(tokenId) {
        try {
            const power = await poseidon.methods.power(tokenId).call();
            const owner = await poseidon.methods.ownerOf(tokenId).call();
            const buildMessage = new Discord.MessageEmbed()
                .setTitle("Fish #" + tokenId + " ~" + power)
                .setURL(openseaTokenURL + tokenId)
                .setThumbnail(tokenImage(tokenId, power))
                .addFields({name: "Owner", value: owner})
            await message.channel.send({embeds: [buildMessage]});
        } catch (e) {
            await message.channel.send("Fish #" + tokenId + " has been hunted");
        }
    }
    async function verify(message) {
        await message.reply(message.author.username + ", please check DM");
        message.author.send("To verify your account please click on the following link: " + process.env.FRONTEND + "verify/" + message.author.id);
    }
    try {
        if (message.content === "!join") {
            verify(message).then();
        }
    } catch (e) {
        console.log("Error while verifying: " + e);
    }
});
// Login
client.login(process.env.DISCORD_TOKEN);


// Ethereum hunting event
poseidon.events.Hunt({fromBlock: 0})
    .on("data", e => {
        try {
            const from = e.returnValues["from"];
            const predator = e.returnValues["predator"];
            const prey = e.returnValues["prey"];
            const power = e.returnValues["power"];
            sentTweet("Fish #" + predator + " hunted fish #" + prey + " and obtained power ~" + power + " " + openseaTokenURL + predator)
            if (lastHuntsChannel !== null) {
                const buildMessage = new Discord.MessageEmbed()
                    .setTitle("Hunt!")
                    .setURL(openseaTokenURL + predator)
                    .setDescription("Fish #" + predator + " hunted fish #" + prey)
                    .setThumbnail(tokenImage(predator, power))
                    .addFields({name: "Power:", value: power}, {name: "Owner:", value: from})
                lastHuntsChannel.send({embeds: [buildMessage]});
            }
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
        const params = new URLSearchParams({
            asset_contract_address: process.env.CONTRACT_ADDRESS,
            event_type: "successful",
            only_opensea: "false",
            offset: "0",
            limit: "20",
            occurred_after: lastSaleDate.toString(),
        });
        const resp = await fetch(openseaApiURL + "events?" + params);
        const openSeaResponse = await resp.json();
        if (typeof openSeaResponse.asset_events !== "undefined") {
            openSeaResponse.asset_events.forEach(function (sale) {
                const price = ethers.utils.formatEther(sale.total_price || "0");
                sentTweet(sale.asset.name + " sold for " + price + " eth! " + sale.asset.permalink)
                if (lastSalesChannel !== null) {
                    const buildMessage = new Discord.MessageEmbed()
                        .setTitle(sale.asset.name + " sold!")
                        .setURL(sale.asset.permalink)
                        .addFields({name: "Price:", value: price + " eth"})
                        .setThumbnail(sale.asset.image_url)
                    lastSalesChannel.send({embeds: [buildMessage]});
                }
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
