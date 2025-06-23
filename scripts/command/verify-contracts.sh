#!/bin/bash

echo "NFT Collection Verifier"
echo ""

if [ -z "$1" ]; then
  echo "Usage: ./verify-contracts.sh <contract-address>"
  echo "Example: ./verify-contracts.sh 0xC8EAD2de9769df4bdeAbA3cE51eB895a4D66F26a"
  exit 1
fi

export CONTRACT_ADDRESS=$1
echo "Setting CONTRACT_ADDRESS to $CONTRACT_ADDRESS"

echo ""
echo "Verifying NFT Collection contract at $CONTRACT_ADDRESS..."
echo ""

bun run verify:collection

echo ""
echo "Verification process completed."
echo "" 