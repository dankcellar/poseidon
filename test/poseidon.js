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
        instance = await Poseidon.new({from: owner});
        fishPrice = await instance.MINT_PRICE({from: owner});
        await instance.setStartingBlock(0, {from: owner});
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
        it("should should be right fish price", async function() {
            assert.strictEqual(fishPrice.toString(), toWei("0.08", "ether").toString(), "Mint price should be correct");
        });
        it("should mint to alice and bob", async function() {
            let txObj1 = await instance.mint(1, {from: alice, value: fishPrice});
            assert.strictEqual(txObj1.logs.length, 1, "1 event should be emitted");
            let args = txObj1.logs[0].args;
            assert.strictEqual(args["from"], zeroAddress, "Token should come from zeroAddress");
            assert.strictEqual(args["to"], alice, "Token should go to alice");
            assert.strictEqual(args["tokenId"].toString(), "1", "First token minted should be tokenId 1");
            // check token 1 owner
            let ownerOfToken1 = await instance.ownerOf(1, {from: owner});
            assert.strictEqual(ownerOfToken1, alice, "Owner of token 1 should be alice");
            // check token 1 power
            let power = await instance.power(1, {from: owner});
            assert.strictEqual(power.toString(), "1", "Token 1 should have power 1");
            // mint to bob
            await instance.mint(1, {from: bob, value: fishPrice});
            let ownerOfToken2 = await instance.ownerOf(2, {from: owner});
            assert.strictEqual(ownerOfToken2, bob, "Owner of token 2 should be bob");
            // check public minted
            const publicMint = await instance.publicMinted({from: alice});
            assert.strictEqual(publicMint.toString(), "2", "Public mint amount should be correct");
            // token 0 does not exist
            await expectedExceptionPromise(function() {
                return instance.ownerOf(0, {from: owner});
            });
            // token 3 does not exist
            await expectedExceptionPromise(function() {
                return instance.ownerOf(3, {from: owner});
            });
        });
        it("should mint many to alice", async function() {
            let txObj = await instance.mint(10, {from: alice, value: fishPrice*10});
            assert.strictEqual(txObj.logs.length, 10, "10 events should be emitted");
            // check token 1 and 10 owner
            let ownerOfToken1 = await instance.ownerOf(1, {from: owner});
            let ownerOfToken10 = await instance.ownerOf(10, {from: owner});
            assert.strictEqual(ownerOfToken1, alice, "Owner of token 1 should be alice");
            assert.strictEqual(ownerOfToken10, alice, "Owner of token 10 should be alice");
            // check token 1 power
            let power1 = await instance.power(1, {from: owner});
            let power10 = await instance.power(10, {from: owner});
            assert.strictEqual(power1.toString(), "1", "Token 1 should have power 1");
            assert.strictEqual(power10.toString(), "1", "Token 10 should have power 1");
            // check public minted
            const publicMint = await instance.publicMinted({from: alice});
            assert.strictEqual(publicMint.toString(), "10", "Public mint amount should be correct");
        });
        it("should not let mint if sale did not start", async function() {
            await instance.setStartingBlock(999999999, {from: owner});
            await expectedExceptionPromise(function() {
                return instance.mint(1, {from: alice, value: fishPrice});
            });
        });
        it("should not let alice mint more than 10", async function() {
            await expectedExceptionPromise(function() {
                return instance.mint(11, {from: alice, value: fishPrice*11});
            });
        });
        it("should not let alice mint for free", async function() {
            await expectedExceptionPromise(function() {
                return instance.mint(1, {from: alice});
            });
        });
        it("should not let alice mint for less price", async function() {
            await expectedExceptionPromise(function() {
                return instance.mint(1, {from: alice, value: "79999999999999999"});
            });
        });
        it("should not let alice mint more than one for less price", async function() {
            await expectedExceptionPromise(function() {
                return instance.mint(2, {from: alice, value: "159999999999999999"});
            });
        });
        // it("should not exceed max supply (needs mint public to be set to 10)", async function() {
        //     for (let i = 0; i < 8; i++) {
        //         await instance.mint(1, {from: alice, value: fishPrice});
        //     }
        //     await expectedExceptionPromise(function() {
        //         return instance.mint(3, {from: alice, value: fishPrice});
        //     });
        //     await instance.mint(1, {from: alice, value: fishPrice});
        //     await expectedExceptionPromise(function() {
        //         return instance.mint(2, {from: alice, value: fishPrice});
        //     });
        //     await instance.mint(1, {from: alice, value: fishPrice});
        //     await expectedExceptionPromise(function() {
        //         return instance.mint(1, {from: bob, value: fishPrice});
        //     });
        //     await expectedExceptionPromise(function() {
        //         return instance.mint(2, {from: bob, value: fishPrice});
        //     });
        // });
    });

    describe("mint private fish", function() {
        it("should mint one to owner", async function() {
            let txObj1 = await instance.mintPrivate([owner], {from: owner});
            assert.strictEqual(txObj1.logs.length, 1, "1 event should be emitted");
            let args = txObj1.logs[0].args;
            assert.strictEqual(args["from"], zeroAddress, "Token should come from zeroAddress");
            assert.strictEqual(args["to"], owner, "Token should go to owner");
            assert.strictEqual(args["tokenId"].toString(), "1", "First token minted should be tokenId 1");
            // check token 1 owner
            let ownerOfToken1 = await instance.ownerOf(1, {from: owner});
            assert.strictEqual(ownerOfToken1, owner, "Owner of token 1 should be owner");
            // check token 1 power
            let power = await instance.power(1, {from: owner});
            assert.strictEqual(power.toString(), "1", "Token 1 should have power 1");
            // check public minted
            const publicMint = await instance.publicMinted({from: alice});
            assert.strictEqual(publicMint.toString(), "0", "Public mint amount should be correct");
        });
        it("should mint many to collaborators", async function() {
            let txObj1 = await instance.mintPrivate([alice, bob], {from: owner});
            assert.strictEqual(txObj1.logs.length, 2, "2 event should be emitted");
            // check tokens owner
            let ownerOfToken1 = await instance.ownerOf(1, {from: owner});
            let ownerOfToken2 = await instance.ownerOf(2, {from: owner});
            assert.strictEqual(ownerOfToken1, alice, "Owner of token 1 should be alice");
            assert.strictEqual(ownerOfToken2, bob, "Owner of token 1 should be bob");
            // check tokens power
            let power1 = await instance.power(1, {from: owner});
            let power2 = await instance.power(2, {from: owner});
            assert.strictEqual(power1.toString(), "1", "Token 1 should have power 1");
            assert.strictEqual(power2.toString(), "1", "Token 2 should have power 1");
        });
        it("should not let alice mint", async function() {
            await expectedExceptionPromise(function() {
                return instance.mintPrivate([alice], {from: alice});
            });
        });
        // it("should not exceed max supply (needs mint private to be set to 10)", async function() {
        //     await instance.mintPrivate([owner, owner, owner, owner, owner, owner, owner, owner], {from: owner});
        //     await expectedExceptionPromise(function() {
        //         return instance.mintPrivate([owner, owner, owner], {from: owner});
        //     });
        //     await instance.mintPrivate([owner], {from: owner});
        //     await expectedExceptionPromise(function() {
        //         return instance.mintPrivate([owner, owner], {from: owner});
        //     });
        //     await instance.mintPrivate([owner], {from: owner});
        //     await expectedExceptionPromise(function() {
        //         return instance.mintPrivate([owner], {from: owner});
        //     });
        //     await expectedExceptionPromise(function() {
        //         return instance.mintPrivate([owner, owner], {from: owner});
        //     });
        //     await instance.mint(1, {from: alice, value: fishPrice});
        // });
    });

    describe("withdraw", function() {
        it("owner should withdraw correctly", async function() {
            await instance.mint(1, {from: alice, value: fishPrice});
            let ownerBalanceBN = toBN(await web3.eth.getBalance(owner));
            let txObj = await instance.withdraw({from: owner});
            let gasUsed = web3.utils.toBN(txObj.receipt.gasUsed);
            let tx = await web3.eth.getTransaction(txObj.tx);
            let gasPrice = web3.utils.toBN(tx.gasPrice);
            let txCostBN = gasPrice.mul(gasUsed);
            let newBalanceCalculation = ownerBalanceBN.add(new web3.utils.BN(fishPrice)).sub(txCostBN);
            let newOwnerBalanceBN = toBN(await web3.eth.getBalance(owner));
            assert.strictEqual(newOwnerBalanceBN.toString(), newBalanceCalculation.toString(), "Owner did not receive the funds");
        });
        it("alice cannot withdraw", async function() {
            await instance.mint(1, {from: alice, value: fishPrice});
            await expectedExceptionPromise(function() {
                return instance.withdraw({from: alice});
            });
        });
    });

    describe("starting block", function() {
        it("should not mint if the starting block is above current block", async function() {
            await instance.setStartingBlock(999999999, {from: owner});
            let startingBlock = await instance.startingBlock({from: owner});
            assert.strictEqual(startingBlock.toString(), "999999999", "StartingBlock should be 999999999");
            await expectedExceptionPromise(function() {
                return instance.mint(1, {from: alice, value: fishPrice});
            });
        });
        it("should mint if the starting block is below current block", async function() {
            await instance.setStartingBlock(1, {from: owner});
            let startingBlock = await instance.startingBlock({from: owner});
            assert.strictEqual(startingBlock.toString(), "1", "StartingBlock should be 1");
            await instance.mint(1, {from: alice, value: fishPrice});
        });
        it("should not let alice change starting block", async function() {
            await expectedExceptionPromise(function() {
                return instance.setStartingBlock(999999999, {from: alice});
            });
        });
    });

    describe("contract uri", function() {
        it("should change contract uri", async function() {
            await instance.setContractURI("https://contracturi123.com", {from: owner});
            let contractUri = await instance.contractURI({from: alice});
            assert.strictEqual(contractUri, "https://contracturi123.com", "Contract URI should be https://contracturi123.com");
        });
        it("should not let alice change contract uri", async function() {
            await expectedExceptionPromise(function() {
                return instance.setContractURI("https://contracturi123.com", {from: alice});
            });
        });
    });

    describe("token type", function() {
        it("should return the correct token type", async function() {
            await instance.mint(10, {from: alice, value: fishPrice*10});
            let r1 = await instance.tokenType(1, {from: owner});
            assert.strictEqual(r1, "fish", "Type should be fish");
            await instance.hunt(1, 2, {from: alice});
            await instance.hunt(1, 3, {from: alice});
            await instance.hunt(1, 4, {from: alice});
            await instance.hunt(1, 5, {from: alice});
            await instance.hunt(1, 6, {from: alice});
            await instance.hunt(1, 7, {from: alice});
            await instance.hunt(1, 8, {from: alice});
            await instance.hunt(1, 9, {from: alice});
            await instance.hunt(1, 10, {from: alice});
            let r2 = await instance.tokenType(1, {from: owner});
            assert.strictEqual(r2, "shark", "Type should be shark");
        });
        it("should revert if token does not exist", async function() {
            await expectedExceptionPromise(function() {
                return instance.tokenType(1, {from: owner});
            });
        });
    });

    describe("token uri", function() {
        it("should change base uri and return correct token", async function() {
            await instance.setBaseURI("https://baseuri123.com/", true, {from: owner});
            await instance.mint(2, {from: alice, value: fishPrice*2});
            let r1 = await instance.tokenURI(1, {from: owner});
            let r2 = await instance.tokenURI(2, {from: owner});
            assert.strictEqual(r1, "https://baseuri123.com/1/fish", "TokenURI for token 1 is not correct");
            assert.strictEqual(r2, "https://baseuri123.com/2/fish", "TokenURI for token 2 is not correct");
            // ipfs
            await instance.setBaseURI("https://baseuri123.com/", false, {from: owner});
            let r12 = await instance.tokenURI(1, {from: owner});
            let r22 = await instance.tokenURI(2, {from: owner});
            assert.strictEqual(r12, "https://baseuri123.com/1/1", "TokenURI for token 1 is not correct");
            assert.strictEqual(r22, "https://baseuri123.com/2/1", "TokenURI for token 2 is not correct");
        });
        it("should return correct base uri when token is a shark", async function() {
            await instance.setBaseURI("https://baseuri123.com/", true, {from: owner});
            await instance.mint(10, {from: alice, value: fishPrice*10});
            await instance.hunt(1, 2, {from: alice});
            await instance.hunt(1, 3, {from: alice});
            await instance.hunt(1, 4, {from: alice});
            await instance.hunt(1, 5, {from: alice});
            await instance.hunt(1, 6, {from: alice});
            await instance.hunt(1, 7, {from: alice});
            await instance.hunt(1, 8, {from: alice});
            await instance.hunt(1, 9, {from: alice});
            await instance.hunt(1, 10, {from: alice});
            let r = await instance.tokenURI(1, {from: owner});
            assert.strictEqual(r, "https://baseuri123.com/1/shark", "TokenURI for token 1 is not correct");
            // ipfs
            await instance.setBaseURI("https://baseuri123.com/", false, {from: owner});
            let r2 = await instance.tokenURI(1, {from: owner});
            assert.strictEqual(r2, "https://baseuri123.com/1/10", "TokenURI for token 1 is not correct");
        });
        it("should not let alice change base uri", async function() {
            await expectedExceptionPromise(function() {
                return instance.setBaseURI("https://baseuri123.com/", false, {from: alice});
            });
        });
        it("should return empty if no base uri", async function() {
            await instance.mint(1, {from: alice, value: fishPrice});
            let r = await instance.tokenURI(1, {from: owner});
            assert.strictEqual(r, "", "TokenURI is empty because no base uri");
        });
        it("should revert if token does not exist", async function() {
            await instance.setBaseURI("https://baseuri123.com/", false, {from: owner});
            await expectedExceptionPromise(function() {
                return instance.tokenURI(1, {from: owner});
            });
        });
    });

    describe("hunt", function() {
        it("should mint two fishes and let alice hunt them", async function() {
            await instance.mint(2, {from: alice, value: fishPrice*2});
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
            let power = await instance.power(1, {from: bob});
            assert.strictEqual(power.toString(), "2", "Token 1 should have power 2");
        });
        it("should mint five fish and hunt between them", async function() {
            await instance.mint(5, {from: alice, value: fishPrice*5});
            await instance.hunt(3, 4, {from: alice});
            await instance.hunt(3, 5, {from: alice});
            // check token 3 power
            let power1 = await instance.power(3, {from: bob});
            assert.strictEqual(power1.toString(), "3", "Token 3 should have power 3");
            // last hunt and check token 1 power
            await instance.hunt(1, 2, {from: alice});
            await instance.hunt(3, 1, {from: alice});
            let power2 = await instance.power(3, {from: bob});
            assert.strictEqual(power2.toString(), "5", "Token 3 should have power 5");
        });
        it("should private mint and hunt between them", async function() {
            await instance.mintPrivate([alice, alice], {from: owner});
            await instance.hunt(1, 2, {from: alice});
            // check token owners
            let ownerOfToken1 = await instance.ownerOf(1, {from: owner});
            assert.strictEqual(ownerOfToken1, alice, "Owner of token 1 should be alice");
            await expectedExceptionPromise(function() {
                // second token should be burned
                return instance.ownerOf(2, {from: owner});
            });
            // check token 1 power
            let power = await instance.power(1, {from: bob});
            assert.strictEqual(power.toString(), "2", "Token 1 should have power 2");
        });
        it("should not hunt bigger fish", async function() {
            await instance.mint(3, {from: alice, value: fishPrice*3});
            await instance.hunt(2, 3, {from: alice});
            await expectedExceptionPromise(function() {
                // cannot hunt a bigger fish
                return instance.hunt(1, 2, {from: alice});
            });
        });
        it("shoult not hunt if prey and predator are the same", async function() {
            await instance.mint(1, {from: alice, value: fishPrice});
            await expectedExceptionPromise(function() {
                return instance.hunt(1, 1, {from: alice});
            });
        });
        it("should not hunt other people fish", async function() {
            await instance.mint(1, {from: alice, value: fishPrice});
            await instance.mint(1, {from: bob, value: fishPrice});
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
            await instance.mint(1, {from: alice, value: fishPrice});
            await instance.mint(1, {from: bob, value: fishPrice});
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
            await instance.mint(1, {from: alice, value: fishPrice});
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
