const Fishtank = artifacts.require("Fishtank.sol");

module.exports = async function(deployer, network, accounts) {
    return deployer.deploy(Fishtank);
};
