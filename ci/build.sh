#!/usr/bin/env sh

set -x
set -e
ganache-cli > /dev/null &
TESTRPC_PID=$!
trap "kill $TESTRPC_PID" EXIT INT TERM

truffle compile
truffle migrate
truffle test
