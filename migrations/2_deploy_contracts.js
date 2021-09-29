const Poseidon = artifacts.require("Poseidon.sol");

module.exports = async function(deployer, network, accounts) {
    // OpenSea proxy registry addresses for rinkeby and mainnet.
    let proxyRegistryAddress = "0xa5409ec958c83c3f309868babaca7c86dcb077c1";
    if (network === 'rinkeby') {
        proxyRegistryAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
    }

    return deployer.deploy(Poseidon, proxyRegistryAddress, {gas: 5000000});
};
