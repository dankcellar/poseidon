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
        it("should mint to alice", async function() {
            let txObj = await instance.mintFish(alice);
            assert.strictEqual(txObj.logs.length, 1, "One event is emitted");
            let args = txObj.logs[0].args;
            assert.strictEqual(args["from"], zeroAddress, "Token comes from address 0");
            assert.strictEqual(args["to"], alice, "Token goes to alice");
            assert.strictEqual(args["tokenId"].toString(), "1", "First token minted is tokenId 0");
            let ownerOfToken0 = await instance.ownerOf(1, {from: owner});
            assert.strictEqual(ownerOfToken0, alice, "Owner of token 1 is alice");
        });
    });

    describe("should mint only 10 fishes", function() {
        it("should mint 10, then fail", async function() {
            for (let i = 0; i < 10; i++) {
                await instance.mintFish(alice, {from: owner});
            }
            await expectedExceptionPromise(function() {
                return instance.mintFish(alice, {from: owner});
            });
        });
    });
});