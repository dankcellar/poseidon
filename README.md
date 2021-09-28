[![Build Status](https://travis-ci.org/amper-lab/poseidon.svg)](https://travis-ci.org/amper-lab/poseidon)

# Poseidon

Poseidon is a ERC-721 token.

```
sudo npm install -g truffle
sudo npm install -g truffle-flattener
truffle init
sudo npm install -g ganache-cli

truffle test

ganache-cli --blockTime 1 --gasLimit 1000000 --host 0.0.0.0 --accounts=10
truffle migrate --reset --network dev
npm run dev
```
