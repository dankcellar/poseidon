[![Build Status](https://app.travis-ci.com/amperlabs/poseidon.svg)](https://app.travis-ci.com/github/amperlabs/poseidon)

# Poseidon

Poseidon is an ERC721 contract in which each token has a starting level of 1, and each token can increase its own level
by hunting another token.

An owner of at least two tokens can decide to hunt, by choosing one token to become the predator and another token to
become the prey. When hunting, the predator token level becomes the sum of the level of both tokens and the prey token
is burned.

Each token art evolves when its level increases to certain thresholds.

```
# installing
sudo npm install -g truffle
sudo npm install -g ganache-cli
npm install

# testing
ganache-cli
truffle test

# testnet/production
truffle-flattener ./contracts/Poseidon.sol > ./flattened/Poseidon.sol
https://remix.ethereum.org/
```
