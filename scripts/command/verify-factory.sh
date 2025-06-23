#!/bin/bash

echo "NFT Factory Verifier"
echo ""

if [ -z "$1" ]; then
  echo "Usage: ./verify-factory.sh <factory-contract-address>"
  echo "Example: ./verify-factory.sh 0x38BB9170AdE58DE906527ee4521FC8605a3DF76D"
  exit 1
fi

export CONTRACT_ADDRESS=$1
echo "Setting CONTRACT_ADDRESS to $CONTRACT_ADDRESS"

echo ""
echo "Verifying NFT Factory contract at $CONTRACT_ADDRESS..."
echo ""

bun run verify:factory

echo ""
echo "Verification process completed."
echo "" 