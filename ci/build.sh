#!/usr/bin/env sh

set -x
set -e
ganache-cli -a=9 -b 1 -h 0.0.0.0 -l 0xfffffffffff -g 0x01 > /dev/null &
TESTRPC_PID=$!
trap "kill $TESTRPC_PID" EXIT INT TERM

truffle compile
truffle migrate
truffle test
