const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

const sourceData = require("./source-data");
const contract = require("./contract");
const tokenAmount = 10;
const tokenName = "Poseidon";
const tokenExternalBaseUrl = "http://placeholder.eth.link/token/";
const dataTypes = ["Background", "Body", "Eyes", "Mouth", "Hat", "Misc"];
const tokenTypes = ["fish", "shark", "whale", "kraken"];
const imageSize = 350;

function prepareDirs() {
    fs.rmdirSync("ipfs/metadata", {recursive: true});
    fs.rmdirSync("ipfs/images", {recursive: true});
    fs.rmdirSync("ipfs/documents", {recursive: true});
    fs.mkdirSync("ipfs/metadata");
    fs.mkdirSync("ipfs/images");
    fs.mkdirSync("ipfs/documents");
    for (let i = 1; i <= tokenAmount; i++) {
        fs.mkdirSync("ipfs/metadata/" + i);
    }
    console.log("IPFS directories prepared");
}

function generateContractJson(_contract) {
    const contractJSON = JSON.stringify(_contract)
    fs.writeFileSync("ipfs/documents/contract.json", contractJSON);
    console.log("Contract JSON created, upload the single file at ipfs/documents/contract.json");
}

async function generateAllTokens(data) {
    function findMaxP(typeArray) {
        let pSum = 0;
        for (let i = 0; i < typeArray.length; i++) {
            pSum += typeArray[i].p;
        }
        return pSum;
    }
    function randomPick(_type, _data, _maxP) {
        const dataType = _data[_type];
        const randomPick = Math.floor(Math.random() * _maxP[_type]) + 1;
        let currentPick = 0;
        for (let i = 0; i < dataType.length; i++) {
            currentPick += dataType[i].p;
            if (randomPick <= currentPick) {
                return dataType[i];
            }
        }
        console.log("randomPick: should never reach this point");
    }
    function compareByOrder(a, b) {
        if (a.order < b.order) {
            return -1;
        }
        if (a.order > b.order ) {
            return 1;
        }
        return 0;
    }
    async function generateImage(imagesArray) {
        const canvas = createCanvas(350, 350);
        const ctx = canvas.getContext('2d');
        for (let i = 0; i < imagesArray.length; i++) {
            const img = await loadImage("source/" + imagesArray[i].image);
            ctx.drawImage(img, 0, 0, imageSize, imageSize);
        }
        return canvas.toBuffer('image/png', {compressionLevel: 9, filters: canvas.PNG_FILTER_NONE });
    }

    // find max p for each type
    let maxP = {};
    dataTypes.forEach(e => {maxP[e] = findMaxP(data[e])});
    // generate each token
    for (let tokenId = 1; tokenId <= tokenAmount; tokenId++) {
        // pick the random attributes
        let randomPicks = {};
        dataTypes.forEach(e => {randomPicks[e] = randomPick(e, data, maxP)});
        // create an image array and order it
        let imagesArray = [];
        dataTypes.forEach(e => {randomPicks[e].source.forEach(m => imagesArray.push(m))});
        imagesArray.sort(compareByOrder);
        // generate images
        const imgBuffer = await generateImage(imagesArray);
        fs.writeFileSync("ipfs/images/" + tokenId + ".png", imgBuffer);
        // lossless compression
        // generate image sha256 and ipfs cid
        // generate metadata
        let metaData = {
            name: tokenName + " #" + tokenId,
            description: "Placeholder",
            image: "",
            external_url: tokenExternalBaseUrl + tokenId,
            attributes: [],
        };
    }
    // create a file with data.json with the md5 and other output
}

prepareDirs();
generateContractJson(contract);
generateAllTokens(sourceData).then();
