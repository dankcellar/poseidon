const Poseidon = artifacts.require("Poseidon.sol");

module.exports = async function (deployer) {
    deployer.deploy(Poseidon, {gas: 5000000});
};
