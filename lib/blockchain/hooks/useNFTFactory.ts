import { useCallback, useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, zeroAddress, encodeAbiParameters, parseAbiParameters } from 'viem';
import { sepolia } from 'wagmi/chains';
import { useVerifyContract } from './useVerifyContract';

// NFT Factory contract source code untuk verifikasi
const NFT_FACTORY_SOURCE_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// The NFT Collection contract that will be created by the factory
contract NFTCollection is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Collection metadata
    string public collectionURI;

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner,
        string memory _collectionURI
    ) ERC721(name, symbol) Ownable(initialOwner) {
        collectionURI = _collectionURI;
    }

    // Function to mint a new NFT
    function mintNFT(
        address recipient,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    // Function to update collection metadata
    function setCollectionURI(string memory _collectionURI) public onlyOwner {
        collectionURI = _collectionURI;
    }
}

// The factory contract that creates new NFT collections
contract NFTFactory {
    // Event emitted when a new collection is created
    event CollectionCreated(
        address collectionAddress,
        string name,
        string symbol,
        address owner
    );

    // Function to create a new NFT collection
    function createCollection(
        string memory name,
        string memory symbol,
        string memory collectionURI
    ) public returns (address) {
        // Create a new NFT collection contract
        NFTCollection newCollection = new NFTCollection(
            name,
            symbol,
            msg.sender,
            collectionURI
        );

        // Emit an event with the collection info
        emit CollectionCreated(
            address(newCollection),
            name,
            symbol,
            msg.sender
        );

        // Return the address of the newly created collection
        return address(newCollection);
    }
}`;

// NFTFactory contract ABI for the createCollection function
const NFT_FACTORY_ABI = [
  {
    name: 'createCollection',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'collectionURI', type: 'string' },
    ],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'CollectionCreated',
    type: 'event',
    inputs: [
      { indexed: false, name: 'collectionAddress', type: 'address' },
      { indexed: false, name: 'name', type: 'string' },
      { indexed: false, name: 'symbol', type: 'string' },
      { indexed: false, name: 'owner', type: 'address' },
    ],
  },
];

// NFT Collection contract ABI for verification
const NFT_COLLECTION_ABI = [
  {
    name: 'constructor',
    type: 'constructor',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'initialOwner', type: 'address' },
      { name: 'collectionURI', type: 'string' },
    ],
  },
];

// Factory contract address on Sepolia
const NFT_FACTORY_ADDRESS = '0x667d34aDc81895967C39277e2Cd2e32585afdeC3';

export interface UseNFTFactoryReturn {
  createCollection: (
    name: string,
    symbol: string,
    collectionURI: string,
    verifyContract?: boolean,
  ) => Promise<{
    hash?: `0x${string}`;
    collectionAddress?: `0x${string}`;
    verified?: boolean;
    error?: Error;
  }>;
  isLoading: boolean;
  error: Error | null;
}

export function useNFTFactory(): UseNFTFactoryReturn {
  const [error, setError] = useState<Error | null>(null);

  const { writeContractAsync, isPending: isCreateLoading } = useWriteContract();
  const { verifyContract: verifyContractOnEtherscan, isVerifying } = useVerifyContract();
  const { data: receipt, isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: undefined,
  });

  const createCollection = useCallback(
    async (name: string, symbol: string, collectionURI: string, verifyContract = false) => {
      try {
        setError(null);

        // Validate inputs
        if (!name) throw new Error('Collection name is required');
        if (!symbol) throw new Error('Collection symbol is required');
        if (!collectionURI) throw new Error('Collection URI is required');

        console.log(`Creating collection: ${name} (${symbol}) with URI: ${collectionURI}`);

        // Call the contract method
        const hash = await writeContractAsync({
          address: NFT_FACTORY_ADDRESS,
          abi: NFT_FACTORY_ABI,
          functionName: 'createCollection',
          args: [name, symbol, collectionURI],
          chainId: sepolia.id,
        });

        console.log(`Transaction hash: ${hash}`);

        // Wait for transaction receipt to get logs
        const txReceipt = await new Promise<any>((resolve) => {
          const checkReceipt = async () => {
            try {
              if (!window.ethereum) {
                console.error('No ethereum provider found');
                setTimeout(checkReceipt, 2000);
                return;
              }

              const provider = window.ethereum;
              const receipt = await provider.request({
                method: 'eth_getTransactionReceipt',
                params: [hash],
              });

              if (receipt) {
                resolve(receipt);
              } else {
                setTimeout(checkReceipt, 2000); // Check again in 2 seconds
              }
            } catch (err) {
              console.error('Error checking receipt:', err);
              setTimeout(checkReceipt, 2000);
            }
          };

          checkReceipt();
        });

        // Parse logs to find the collection address
        let collectionAddress: `0x${string}` | undefined;

        if (txReceipt && txReceipt.logs) {
          console.log('Transaction receipt:', txReceipt);
          console.log('Transaction receipt logs:', JSON.stringify(txReceipt.logs));

          try {
            // Try to find the CollectionCreated event log
            // The event signature for CollectionCreated is the first topic
            const collectionCreatedEventSignature =
              '0x5424fbee04a3b38aed6d5c8dd5fb4175c3a30fe1b5ead9e5f42c590984b88550';

            for (const log of txReceipt.logs) {
              console.log('Checking log:', log);

              // Check if this log is from our factory contract
              if (log.address && log.address.toLowerCase() === NFT_FACTORY_ADDRESS.toLowerCase()) {
                console.log('Found log from factory contract');

                // For non-indexed event parameters, we need to decode the data
                // In the CollectionCreated event, the first parameter is the collection address
                if (log.data && log.data.length >= 66) {
                  // Data format for our event: address(32 bytes) + name + symbol + owner
                  // We need the first 32 bytes (64 chars after 0x) which is the address
                  // But Ethereum addresses are 20 bytes, so we need to extract correctly
                  const dataWithoutPrefix = log.data.startsWith('0x')
                    ? log.data.slice(2)
                    : log.data;

                  // The address is padded to 32 bytes, so we need to extract the last 40 chars (20 bytes)
                  // of the first 32 bytes (64 chars)
                  const addressHex = '0x' + dataWithoutPrefix.slice(24, 64);
                  console.log('Extracted address from data:', addressHex);

                  // Validate that it's a proper Ethereum address
                  if (/^0x[a-fA-F0-9]{40}$/.test(addressHex)) {
                    collectionAddress = addressHex as `0x${string}`;
                    console.log(`Valid collection address found: ${collectionAddress}`);
                    break;
                  }
                }
              }
            }

            // If we still don't have the address, try another approach
            if (!collectionAddress) {
              console.log('Trying alternative method to find contract address...');

              // Look for contract creation logs
              for (const log of txReceipt.logs) {
                // Contract creation usually has the contract address as the log address
                // and the creator (our factory) would be in the topics
                if (log.topics && log.topics.length > 0) {
                  const potentialAddress = log.address;
                  console.log('Potential contract address from log address:', potentialAddress);

                  if (potentialAddress && /^0x[a-fA-F0-9]{40}$/.test(potentialAddress)) {
                    collectionAddress = potentialAddress as `0x${string}`;
                    console.log(`Using log address as collection address: ${collectionAddress}`);
                    break;
                  }
                }
              }
            }
          } catch (parseErr) {
            console.error('Error parsing transaction logs:', parseErr);
          }
        }

        if (!collectionAddress) {
          console.warn('Could not extract collection address from transaction logs');

          // As a last resort, try to get the contract address from the transaction receipt
          if (txReceipt && txReceipt.contractAddress) {
            collectionAddress = txReceipt.contractAddress as `0x${string}`;
            console.log(`Using transaction receipt contractAddress: ${collectionAddress}`);
          }
        }

        // Jika opsi verifikasi kontrak diaktifkan
        let verificationResult = { verified: false };

        if (verifyContract && collectionAddress) {
          try {
            console.log('Starting contract verification process...');

            // Get the current connected address for the initialOwner parameter
            if (!window.ethereum) {
              throw new Error('No ethereum provider found');
            }

            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const ownerAddress = accounts[0];

            if (!ownerAddress) {
              throw new Error('No connected wallet account found');
            }

            console.log(`Using owner address for verification: ${ownerAddress}`);

            // Encode constructor arguments
            const constructorArgs = encodeAbiParameters(
              parseAbiParameters('string, string, address, string'),
              [name, symbol, ownerAddress, collectionURI],
            ).slice(2); // remove 0x prefix

            console.log('Constructor arguments:', constructorArgs);
            console.log('Contract address to verify:', collectionAddress);

            // Add delay to make sure the contract is deployed and available for verification
            console.log('Waiting 10 seconds before attempting verification...');
            await new Promise((resolve) => setTimeout(resolve, 10000));

            const verifyResult = await verifyContractOnEtherscan({
              contractAddress: collectionAddress,
              sourceCode: NFT_FACTORY_SOURCE_CODE,
              contractName: 'NFTCollection',
              compilerVersion: 'v0.8.20+commit.a1b79de6',
              optimizationUsed: false,
              constructorArguments: constructorArgs,
            });

            verificationResult.verified = verifyResult.status === 'success';
            console.log('Verification result:', verifyResult);
          } catch (verifyError) {
            console.error('Error verifying contract:', verifyError);
          }
        }

        return { hash, collectionAddress, ...verificationResult };
      } catch (err) {
        console.error('Error creating NFT collection:', err);
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        return { error };
      }
    },
    [writeContractAsync, verifyContractOnEtherscan],
  );

  return {
    createCollection,
    isLoading: isCreateLoading || isVerifying || isWaitingForReceipt,
    error,
  };
}
