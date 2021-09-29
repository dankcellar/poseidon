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
            gas: 5000000,
            network_id: "*",
        },
        rinkeby: {
            provider: function () {
                return new HDWalletProvider(MNEMONIC, "https://rinkeby.infura.io/v3/" + NODE_API_KEY);
            },
            gas: 5000000,
            network_id: 4,
        },
        live: {
            provider: function () {
                return new HDWalletProvider(MNEMONIC, "https://mainnet.infura.io/v3/" + NODE_API_KEY);
            },
            gas: 5000000,
            gasPrice: 5000000000,
            network_id: 1,
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
