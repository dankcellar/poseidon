const path = require("path");

module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!
    networks: {
        // ganache
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*",
        }
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
