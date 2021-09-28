[![Build Status](https://travis-ci.org/amper-lab/poseidon.svg)](https://travis-ci.org/amper-lab/poseidon)

# Poseidon

Poseidon is a ERC-721 token.

```
sudo npm install -g truffle
sudo npm install -g truffle-flattener
truffle init
sudo npm install -g ganache-cli

truffle test

ganache-cli -a 9 -b 1 -h 0.0.0.0 -l 0xfffffffffff -g 0x01 -p 8545
truffle migrate --reset --network dev
npm run dev
```
