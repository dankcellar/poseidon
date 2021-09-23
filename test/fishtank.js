const Fishtank = artifacts.require("Fishtank.sol");
const expectedExceptionPromise = require("./util/expected-exception-promise.js");
const getTransactionCost = require("./util/get-transaction-cost.js");
const { toWei, toBN, fromAscii } = web3.utils;
const zeroAddress = "0x0000000000000000000000000000000000000000";

contract('Fishtank', accounts => {
    const [ owner, alice, bob, carol ] = accounts;
    let instance;

    before("check if the setup is correct to pass the tests", async function() {
        let aliceBalanceBN = toBN(await web3.eth.getBalance(alice));
        let minimum = toBN(toWei('10', 'ether'));
        assert.isTrue(aliceBalanceBN.gte(minimum));
    });

    beforeEach("deploy fishtank", async function() {
        instance = await Fishtank.new({from: owner});
    });

    describe("verify deployment", function() {
        it("should mint to alice", async function() {
            let txObj = await instance.mintFish(alice);
            assert.strictEqual(txObj.logs.length, 1, "One event is emitted");
            let args = txObj.logs[0].args;
            assert.strictEqual(args["from"], zeroAddress, "Token comes from address 0");
            assert.strictEqual(args["to"], alice, "Token goes to alice");
            assert.strictEqual(args["tokenId"].toString(), "0", "First token minted is tokenId 0");
            let ownerOfToken0 = await instance.ownerOf(0, {from: owner});
            assert.strictEqual(ownerOfToken0, alice, "Owner of token 0 is alice");
        });
        // it("should mint to 10000", async function() {
        //     for (let i = 1; i < 10000; i++) {
        //         await instance.mintFish(alice, {from: owner});
        //         console.log(i);
        //     }
        // });
        // it("should not mint 10001", async function() {
        //     await expectedExceptionPromise(function() {
        //         return instance.mintFish(alice, {from: owner});
        //     });
        // });
    });
});