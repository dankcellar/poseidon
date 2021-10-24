const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const hashIPFS = require('ipfs-only-hash')
const crypto = require('crypto');

const sourceData = require("./source-data");
const contract = require("./contract");
const tokenAmount = 10;
const tokenName = "Poseidon";
const tokenExternalBaseUrl = "http://placeholder.eth.link/token/";
const dataTypes = ["Background", "Body", "Eyes", "Mouth", "Hat", "Misc"];
const tokenTypes = ["Fish", "Shark", "Whale", "Kraken"];
const imageSize = 350;

function prepareDirs() {
    fs.rmdirSync("images", {recursive: true});
    fs.mkdirSync("images");
    fs.rmdirSync("ipfs", {recursive: true});
    fs.mkdirSync("ipfs");
    fs.mkdirSync("ipfs/tokens");
    for (let i = 1; i <= tokenAmount; i++) {
        fs.mkdirSync("ipfs/tokens/" + i);
    }
    console.log("IPFS directories prepared");
}

function generateContractJson(_contract) {
    const contractJSON = JSON.stringify(_contract)
    fs.writeFileSync("ipfs/contract.json", contractJSON);
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
        imagesArray.sort(compareByOrder);
        const canvas = createCanvas(350, 350);
        const ctx = canvas.getContext('2d');
        for (let i = 0; i < imagesArray.length; i++) {
            const img = await loadImage("source/" + imagesArray[i].image);
            ctx.drawImage(img, 0, 0, imageSize, imageSize);
        }
        return canvas.toBuffer("image/png", {compressionLevel: 9, filters: canvas.PNG_ALL_FILTERS });
    }

    let allHash256 = [];
    let allMetadata = {};
    // find max p for each type
    let maxP = {};
    dataTypes.forEach(e => {maxP[e] = findMaxP(data[e])});
    // generate each token
    for (let tokenId = 1; tokenId <= tokenAmount; tokenId++) {
        // pick the random attributes
        let randomPicks = {};
        dataTypes.forEach(e => {randomPicks[e] = randomPick(e, data, maxP)});
        // generate an image for each tokenTypes
        allMetadata[tokenId] = {};
        for (let i = 0; i < tokenTypes.length; i++) {
            // create an image array
            let imagesArray = [];
            dataTypes.forEach(e => {
                randomPicks[e].source[tokenTypes[i]].forEach(m => imagesArray.push(m))
            });
            // generate images
            const imgBuffer = await generateImage(imagesArray);
            const hashCID = await hashIPFS.of(imgBuffer);
            const hash256 = crypto.createHash("md5").update(imgBuffer).digest('hex');
            allHash256.push(hash256);
            const filename = "ipfs/tokens/" + tokenId +  "/" + tokenTypes[i].toLowerCase() + ".png";
            fs.writeFileSync(filename, imgBuffer);
            fs.writeFileSync("images/" + hashCID +  ".png", imgBuffer);
            // generate metadata
            let metadata = {
                name: tokenName + " #" + tokenId,  // ~1
                description: tokenName + " #" + tokenId,
                image: "ipfs://" + hashCID,
                external_url: tokenExternalBaseUrl + tokenId,
                attributes: [],
            };
            metadata.attributes.push({"trait_type": "Type", "value": tokenTypes[i]});
            dataTypes.forEach(e => {
                if (randomPicks[e].value !== "") {
                    metadata.attributes.push({"trait_type": e, "value": randomPicks[e].value});
                }
            });
            const metadataJSON = JSON.stringify(metadata);
            fs.writeFileSync("ipfs/tokens/" + tokenId +  "/" + tokenTypes[i].toLowerCase(), metadataJSON);
            allMetadata[tokenId][tokenTypes[i]] = metadata;
        }
        console.log("Token " + tokenId + " generated");
    }
    // all metadata JSON
    const metadataJSON = JSON.stringify(allMetadata);
    fs.writeFileSync("ipfs/all.json", metadataJSON);
    // final md5sum
    const hash256 = crypto.createHash("md5").update(allHash256.join("")).digest('hex');
    fs.writeFileSync("ipfs/provenance.md5", hash256);
}

prepareDirs();
generateContractJson(contract);
generateAllTokens(sourceData).then();
