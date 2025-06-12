import { useCallback, useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { sepolia } from 'wagmi/chains';

// Import ABIs from the Hardhat-compiled contracts
// @ts-ignore - This will be imported properly as JSON
import NFT_FACTORY_ABI from '../abi/NFTFactory.json';

const NFT_FACTORY_ADDRESS = '0x667d34aDc81895967C39277e2Cd2e32585afdeC3';

export interface UseNFTFactoryReturn {
  createCollection: (
    name: string,
    symbol: string,
    collectionURI: string,
  ) => Promise<{
    hash?: `0x${string}`;
    collectionAddress?: `0x${string}`;
    error?: Error;
  }>;
  isLoading: boolean;
  error: Error | null;
}

export function useNFTFactory(): UseNFTFactoryReturn {
  const [error, setError] = useState<Error | null>(null);

  const { writeContractAsync, isPending: isCreateLoading } = useWriteContract();
  const { isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: undefined,
  });

  const createCollection = useCallback(
    async (name: string, symbol: string, collectionURI: string) => {
      try {
        setError(null);

        // Validate inputs
        if (!name) throw new Error('Collection name is required');
        if (!symbol) throw new Error('Collection symbol is required');
        if (!collectionURI) throw new Error('Collection URI is required');

        const hash = await writeContractAsync({
          address: NFT_FACTORY_ADDRESS,
          abi: NFT_FACTORY_ABI,
          functionName: 'createCollection',
          args: [name, symbol, collectionURI],
          chainId: sepolia.id,
        });

        const txReceipt = await new Promise<any>((resolve) => {
          const checkReceipt = async () => {
            try {
              if (!window.ethereum) {
                // Simple error without exposing details
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
              // Silent error handling
              setTimeout(checkReceipt, 2000);
            }
          };

          checkReceipt();
        });

        // Parse logs to find the collection address
        let collectionAddress: `0x${string}` | undefined;

        if (txReceipt && txReceipt.logs) {
          try {
            for (const log of txReceipt.logs) {
              if (log.address && log.address.toLowerCase() === NFT_FACTORY_ADDRESS.toLowerCase()) {
                if (log.data && log.data.length >= 66) {
                  const dataWithoutPrefix = log.data.startsWith('0x')
                    ? log.data.slice(2)
                    : log.data;

                  // The address is padded to 32 bytes, so we need to extract the last 40 chars (20 bytes)
                  // of the first 32 bytes (64 chars)
                  const addressHex = '0x' + dataWithoutPrefix.slice(24, 64);

                  // Validate that it's a proper Ethereum address
                  if (/^0x[a-fA-F0-9]{40}$/.test(addressHex)) {
                    collectionAddress = addressHex as `0x${string}`;
                    break;
                  }
                }
              }
            }

            // If we still don't have the address, try another approach
            if (!collectionAddress) {
              // Look for contract creation logs
              for (const log of txReceipt.logs) {
                // Contract creation usually has the contract address as the log address
                // and the creator (our factory) would be in the topics
                if (log.topics && log.topics.length > 0) {
                  const potentialAddress = log.address;

                  if (potentialAddress && /^0x[a-fA-F0-9]{40}$/.test(potentialAddress)) {
                    collectionAddress = potentialAddress as `0x${string}`;
                    break;
                  }
                }
              }
            }
          } catch (parseErr) {
            // Silent error handling for log parsing
          }
        }

        if (!collectionAddress) {
          // As a last resort, try to get the contract address from the transaction receipt
          if (txReceipt && txReceipt.contractAddress) {
            collectionAddress = txReceipt.contractAddress as `0x${string}`;
          }
        }

        return { hash, collectionAddress };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        return { error };
      }
    },
    [writeContractAsync],
  );

  return {
    createCollection,
    isLoading: isCreateLoading || isWaitingForReceipt,
    error,
  };
}
