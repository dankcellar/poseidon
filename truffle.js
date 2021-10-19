require('dotenv').config();
const path = require("path");
const HDWalletProvider = require("truffle-hdwallet-provider");

const MNEMONIC = process.env.MNEMONIC;
const NODE_API_KEY = process.env.INFURA_KEY;
const needsNodeAPI = process.env.npm_config_argv &&
    (process.env.npm_config_argv.includes("rinkeby") || process.env.npm_config_argv.includes("live"));

if (needsNodeAPI && (!MNEMONIC || !NODE_API_KEY)) {
    console.error("Please set a mnemonic and INFURA_KEY.");
    process.exit(0);
}

module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!
    contracts_build_directory: path.join(__dirname, "client/src/contracts"),
    networks: {
        // ganache
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*",
        },
        live: {
            provider: function () {
                return new HDWalletProvider(MNEMONIC, "https://mainnet.infura.io/v3/" + NODE_API_KEY);
            },
            gasPrice: 63000000000,
            network_id: 1,
        },
        ropsten: {
            provider: function () {
                return new HDWalletProvider(MNEMONIC, "https://ropsten.infura.io/v3/" + NODE_API_KEY);
            },
            gasPrice: 2000000000,  // 2 gwei
            network_id: 3,
        },
        rinkeby: {
            provider: function () {
                return new HDWalletProvider(MNEMONIC, "https://rinkeby.infura.io/v3/" + NODE_API_KEY);
            },
            gasPrice: 1010000000,
            network_id: 4,
        },
    },
    compilers: {
        solc: {
            version: "0.8.6",
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    plugins: [
        'truffle-plugin-verify'
    ],
};
