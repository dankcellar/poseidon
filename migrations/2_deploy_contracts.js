const Poseidon = artifacts.require("Poseidon.sol");

module.exports = async function(deployer, network, accounts) {
    return deployer.deploy(Poseidon, {gas: 4272847});
};
