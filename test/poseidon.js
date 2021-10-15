const Poseidon = artifacts.require("Poseidon.sol");
const expectedExceptionPromise = require("./util/expected-exception-promise.js");
const { toWei, toBN } = web3.utils;
const zeroAddress = "0x0000000000000000000000000000000000000000";

contract('Poseidon', accounts => {
    const [ owner, alice, bob, carol ] = accounts;
    let instance;
    let fishPrice;

    before("check if the setup is correct to pass the tests", async function() {
        let aliceBalanceBN = toBN(await web3.eth.getBalance(alice));
        let minimum = toBN(toWei('10', 'ether'));
        assert.isTrue(aliceBalanceBN.gte(minimum));
    });

    beforeEach("deploy poseidon", async function() {
        instance = await Poseidon.new(zeroAddress, {from: owner});
        fishPrice = await instance.FISH_PRICE({from: owner});
    });

    describe("verify deployment", function() {
        it("should have nothing minted", async function() {
            await expectedExceptionPromise(function() {
                return instance.ownerOf(1, {from: alice});
            });
        });
        it("should be named correctly", async function() {
            let name = await instance.name({from: alice});
            assert.strictEqual(name, "Poseidon", "Token should be called correctly");
        });
        it("should have the correct symbol", async function() {
            let name = await instance.symbol({from: alice});
            assert.strictEqual(name, "FISH", "Token should be the correct symbol");
        });
    });

    describe("mint fish", function() {
        it("should should be fish price of 0.08 ether", async function() {
            assert.strictEqual(fishPrice.toString(), toWei("0.08", "ether").toString(), "Price should be 0.08");
        });
        it("should mint to alice", async function() {
            let txObj = await instance.mintFish({from: alice, value: fishPrice});
            assert.strictEqual(txObj.logs.length, 1, "1 event should be emitted");
            let args = txObj.logs[0].args;
            assert.strictEqual(args["from"], zeroAddress, "Token should come from zeroAddress");
            assert.strictEqual(args["to"], alice, "Token should go to alice");
            assert.strictEqual(args["tokenId"].toString(), "1", "First token minted should be tokenId 1");
            // check token 1 owner
            let ownerOfToken1 = await instance.ownerOf(1, {from: owner});
            assert.strictEqual(ownerOfToken1, alice, "Owner of token 1 should be alice");
            // check token 1 power
            let tokenPower = await instance.tokenPower(1, {from: owner});
            assert.strictEqual(tokenPower.toString(), "1", "Token 1 should have power 2");
        });
        it("should not let alice mint for free", async function() {
            await expectedExceptionPromise(function() {
                return instance.mintFish({from: alice});
            });
        });
        it("should not let alice mint with one less wei", async function() {
            await expectedExceptionPromise(function() {
                return instance.mintFish({from: alice, value: fishPrice.sub(1)});
            });
        });
        it("should not let alice mint with one more wei", async function() {
            await expectedExceptionPromise(function() {
                return instance.mintFish({from: alice, value: fishPrice.add(1)});
            });
        });

        /*
        it("should mint 10 fishes, then fail", async function() {
            for (let i = 0; i < 10; i++) {
                await instance.mintFish({from: alice, value: fishPrice});
            }
            await expectedExceptionPromise(function() {
                // should revert when minting the 11
                return instance.mintFish(alice, {from: owner});
            });
        });
        */
    });

    describe("mint private fish", function() {
        it("should not let alice mint", async function() {
            await expectedExceptionPromise(function() {
                return instance.mintFishPrivate(alice, {from: alice});
            });
        });
    });

    describe("withdraw", function() {

    });

    describe("token uri", function() {
        it("should return the correct token uri for tokens 1 and 2", async function() {
            let r1 = await instance.tokenURI(1, {from: owner});
            let r2 = await instance.tokenURI(2, {from: owner});
            assert.strictEqual(r1, "https://poseidonnft.eth.link/api/token/1", "TokenURI for token 1 is not correct");
            assert.strictEqual(r2, "https://poseidonnft.eth.link/api/token/2", "TokenURI for token 2 is not correct");
        });
    });

    describe("hunt", function() {
        it("should mint two fishes and let alice hunt them", async function() {
            await instance.mintFish({from: alice, value: fishPrice});
            await instance.mintFish({from: alice, value: fishPrice});
            let txObj = await instance.hunt(1, 2, {from: alice});
            assert.strictEqual(txObj.logs.length, 3, "3 events should be emitted");
            let args = txObj.logs[2].args;
            assert.strictEqual(args["from"], alice, "Token should come from alice");
            assert.strictEqual(args["predator"].toString(), "1", "Predator should be 1");
            assert.strictEqual(args["prey"].toString(), "2", "Prey should be 2");
            assert.strictEqual(args["power"].toString(), "2", "New power should be 2");
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
        it("should mint five fish and hunt between them", async function() {
            await instance.mintFish({from: alice, value: fishPrice});
            await instance.mintFish({from: alice, value: fishPrice});
            await instance.mintFish({from: alice, value: fishPrice});
            await instance.mintFish({from: alice, value: fishPrice});
            await instance.mintFish({from: alice, value: fishPrice});
            await instance.hunt(3, 4, {from: alice});
            await instance.hunt(3, 5, {from: alice});
            // check token 3 power
            let tokenPower1 = await instance.tokenPower(3, {from: bob});
            assert.strictEqual(tokenPower1.toString(), "3", "Token 3 should have power 3");
            // last hunt and check token 1 power
            await instance.hunt(1, 2, {from: alice});
            await instance.hunt(3, 1, {from: alice});
            let tokenPower2 = await instance.tokenPower(3, {from: bob});
            assert.strictEqual(tokenPower2.toString(), "5", "Token 3 should have power 5");
        });
        it("should not hunt bigger fish", async function() {
            await instance.mintFish({from: alice, value: fishPrice});
            await instance.mintFish({from: alice, value: fishPrice});
            await instance.mintFish({from: alice, value: fishPrice});
            await instance.hunt(2, 3, {from: alice});
            await expectedExceptionPromise(function() {
                // cannot hunt a bigger fish
                return instance.hunt(1, 2, {from: alice});
            });
        });
        it("should not hunt other people fish", async function() {
            await instance.mintFish({from: alice, value: fishPrice});
            await instance.mintFish({from: bob, value: fishPrice});
            await expectedExceptionPromise(function() {
                // cannot hunt other people fish
                return instance.hunt(1, 2, {from: alice});
            });
            await expectedExceptionPromise(function() {
                // cannot hunt other people fish
                return instance.hunt(2, 1, {from: bob});
            });
        });
        it("should not hunt if not owner of the fish", async function() {
            await instance.mintFish({from: alice, value: fishPrice});
            await instance.mintFish({from: bob, value: fishPrice});
            await expectedExceptionPromise(function() {
                // cannot hunt if not owner of the fish
                return instance.hunt(1, 2, {from: bob});
            });
            await expectedExceptionPromise(function() {
                // cannot hunt if not owner of the fish
                return instance.hunt(2, 1, {from: alice});
            });
            await expectedExceptionPromise(function() {
                // cannot hunt if not owner of the fish
                return instance.hunt(1, 2, {from: carol});
            });
        });
        it("should not hunt unexisting tokens", async function() {
            await instance.mintFish({from: alice, value: fishPrice});
            await expectedExceptionPromise(function() {
                // cannot hunt unexisting tokens
                return instance.hunt(1, 2, {from: alice});
            });
            await expectedExceptionPromise(function() {
                // cannot hunt unexisting tokens
                return instance.hunt(2, 1, {from: alice});
            });
            await expectedExceptionPromise(function() {
                // cannot hunt unexisting tokens
                return instance.hunt(2, 3, {from: alice});
            });
        });
    });
});
