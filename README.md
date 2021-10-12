[![Build Status](https://app.travis-ci.com/amper-lab/poseidon.svg)](https://app.travis-ci.com/github/amper-lab/poseidon)

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
```
