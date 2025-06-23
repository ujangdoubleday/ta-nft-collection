#!/bin/bash

echo "NFT Contracts Verifier (All-in-One)"
echo ""

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./verify-all.sh <factory-address> <collection-address>"
  echo "Example: ./verify-all.sh 0x38BB9170AdE58DE906527ee4521FC8605a3DF76D 0xC8EAD2de9769df4bdeAbA3cE51eB895a4D66F26a"
  exit 1
fi

FACTORY_ADDRESS=$1
COLLECTION_ADDRESS=$2

echo "=================================="
echo "Step 1: Verifying NFT Factory"
echo "=================================="
export CONTRACT_ADDRESS=$FACTORY_ADDRESS
echo "Setting CONTRACT_ADDRESS to $CONTRACT_ADDRESS"
echo ""

bun run verify:factory

echo ""
echo "=================================="
echo "Step 2: Verifying NFT Collection"
echo "=================================="
export CONTRACT_ADDRESS=$COLLECTION_ADDRESS
echo "Setting CONTRACT_ADDRESS to $CONTRACT_ADDRESS"
echo ""

bun run verify:collection

echo ""
echo "=================================="
echo "All verification processes completed."
echo "==================================" 