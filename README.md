[![Build Status](https://app.travis-ci.com/amperlabs/poseidon.svg)](https://app.travis-ci.com/github/amperlabs/poseidon)

# Poseidon

Poseidon is a ERC-721 token.

```
# installing
sudo npm install -g truffle
sudo npm install -g ganache-cli
npm install
cp .env.sample .env && vim .env
cd client/ && npm install

# testing
ganache-cli
truffle test

# running development
ganache-cli -m "seed"
truffle migrate --reset --network development
cd client/ && npm start

# testnet/production
https://remix.ethereum.org/
sol-merger "./contracts/Poseidon.sol" ./build

# generator
cd generator
node .
```

## OpenSea

```
https://testnets-api.opensea.io/api/v1/asset/<your_contract_address>/<token_id>/?force_update=true

https://testnets-api.opensea.io/asset/<your_contract_address>/<your_token_id>/validate/ 
https://api.opensea.io/asset/<your_contract_address>/<your_token_id>/validate/ 
```