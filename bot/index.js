const Web3 = require('web3');
const PoseidonAbi = require('./abi/Poseidon.json');
const Discord = require('discord.js');
require('dotenv').config();


// Returns the image url for a certain tokenId and power
function tokenImage(tokenId, power) {
    const type = (power >= 1000) ? "kraken" : ((power >= 100) ? "whale" : (power >= 10) ? "shark" : "fish");
    return process.env.API_IMAGE_URL + tokenId + "-" + type + ".png";
}


// Infura connection
let infuraWsURL = "wss://mainnet.infura.io/ws/v3/" + process.env.INFURA_ID;
if (process.env.LIVE_MODE !== "1") {
    infuraWsURL = "wss://rinkeby.infura.io/ws/v3/" + process.env.INFURA_ID;
}
const web3 = new Web3(new Web3.providers.WebsocketProvider(infuraWsURL));
const poseidon = new web3.eth.Contract(PoseidonAbi, process.env.CONTRACT_ADDRESS);


// Discord init
let lastHuntsChannel = null;
const client = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
});
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.channels.fetch(process.env.LAST_HUNTS_CHANNEL_ID).then(function (c) {
        lastHuntsChannel = c;
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
                .addFields({name: "Current power", value: power})
            message.reply({embeds: [buildMessage]});

            // message.reply(tokenId + "###" + power);
            // message.channelId
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
                .addFields({name: "Current power", value: power}, {name: "Address", value: from})
            lastHuntsChannel.send({embeds: [buildMessage]});
        } catch (e) {
            console.log("Error while processing hunt event: " + e);
        }
    })
    .on("error", e => {
        console.log("Error on hunt event: " + e);
    });
