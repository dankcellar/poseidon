const Poseidon = artifacts.require("Poseidon.sol");
const expectedExceptionPromise = require("./util/expected-exception-promise.js");
const getTransactionCost = require("./util/get-transaction-cost.js");
const { toWei, toBN, fromAscii } = web3.utils;
const zeroAddress = "0x0000000000000000000000000000000000000000";

contract('Poseidon', accounts => {
    const [ owner, alice, bob, carol ] = accounts;
    let instance;

    before("check if the setup is correct to pass the tests", async function() {
        let aliceBalanceBN = toBN(await web3.eth.getBalance(alice));
        let minimum = toBN(toWei('10', 'ether'));
        assert.isTrue(aliceBalanceBN.gte(minimum));
    });

    beforeEach("deploy poseidon", async function() {
        instance = await Poseidon.new(zeroAddress, {from: owner});
    });

    describe("verify deployment", function() {

    });

    describe("mint fish", function() {
        it("should not let alice mint", async function() {
            await expectedExceptionPromise(function() {
                return instance.mintFish(alice, {from: alice});
            });
        });
        it("should mint to alice", async function() {
            let txObj = await instance.mintFish(alice, {from: owner});
            assert.strictEqual(txObj.logs.length, 1, "1 event should be emitted");
            let args = txObj.logs[0].args;
            assert.strictEqual(args["from"], zeroAddress, "Token should come from address 0");
            assert.strictEqual(args["to"], alice, "Token should go to alice");
            assert.strictEqual(args["tokenId"].toString(), "1", "First token minted should be tokenId 1");
            // check token 1 owner
            let ownerOfToken1 = await instance.ownerOf(1, {from: owner});
            assert.strictEqual(ownerOfToken1, alice, "Owner of token 1 should be alice");
            // check token 1 power
            let tokenPower = await instance.tokenPower(1, {from: owner});
            assert.strictEqual(tokenPower.toString(), "1", "Token 1 should have power 2");
        });
        it("should mint 10 fishes, then fail", async function() {
            for (let i = 0; i < 10; i++) {
                await instance.mintFish(alice, {from: owner});
            }
            await expectedExceptionPromise(function() {
                // should revert when minting the 11
                return instance.mintFish(alice, {from: owner});
            });
        });
        // try perhaps to add some logs with more info
        // try to mint from something which is not owner
    });

    describe("token uri", function() {
        it("should return the correct token uri for tokens 1 and 2", async function() {
            let r1 = await instance.tokenURI(1, {from: owner});
            let r2 = await instance.tokenURI(2, {from: owner});
            assert.strictEqual(r1, "https://poseidon.house/api/token/1", "TokenURI for token 1 is not correct");
            assert.strictEqual(r2, "https://poseidon.house/api/token/2", "TokenURI for token 2 is not correct");
        });
    });

    describe("hunt", function() {
        it("should mint two fishes and let alice hunt them", async function() {
            await instance.mintFish(alice, {from: owner});
            await instance.mintFish(alice, {from: owner});
            let txObj = await instance.hunt(1, 2, {from: alice});
            assert.strictEqual(txObj.logs.length, 2, "2 events should be emitted");
            // check token owners
            let ownerOfToken1 = await instance.ownerOf(1, {from: owner});
            assert.strictEqual(ownerOfToken1, alice, "Owner of token 1 should be alice");
            await expectedExceptionPromise(function() {
                // second token should be burned
                return instance.ownerOf(2, {from: owner});
            });
            // check token 1 power
            let tokenPower = await instance.tokenPower(1, {from: bob});
            assert.strictEqual(tokenPower.toString(), "2", "Token 1 should have power 2");
        });
        // try hunting other people token, either prey, predator or both
        // try to keep hunting to see if it keeps working
        // try hunting unexisting tokens
        // try perhaps to add some logs
    });
});
