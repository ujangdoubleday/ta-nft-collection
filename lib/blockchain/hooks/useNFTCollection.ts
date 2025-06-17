import { useCallback, useState } from 'react';
import { useWriteContract } from 'wagmi';
import { sepolia } from 'wagmi/chains';

// NFT Collection contract ABI for the mintNFT function
const NFT_COLLECTION_ABI = [
  {
    name: 'mintNFT',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'tokenURI', type: 'string' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'Transfer',
    type: 'event',
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: true, name: 'tokenId', type: 'uint256' },
    ],
  },
];

export interface UseNFTCollectionReturn {
  mintNFT: (
    contractAddress: string,
    recipient: string,
    tokenURI: string,
  ) => Promise<{
    hash?: `0x${string}`;
    tokenId?: string;
    error?: Error;
  }>;
  isLoading: boolean;
  error: Error | null;
}

export function useNFTCollection(): UseNFTCollectionReturn {
  const [error, setError] = useState<Error | null>(null);

  const { writeContractAsync, isPending: isMintLoading } = useWriteContract();

  const mintNFT = useCallback(
    async (contractAddress: string, recipient: string, tokenURI: string) => {
      try {
        setError(null);

        // Validate inputs
        if (!contractAddress) throw new Error('Contract address is required');
        if (!recipient) throw new Error('Recipient address is required');
        if (!tokenURI) throw new Error('Token URI is required');

        console.log(`Minting NFT to ${recipient} with URI: ${tokenURI}`);
        console.log(`Using NFT Collection contract: ${contractAddress}`);

        // Call the contract method
        const hash = await writeContractAsync({
          address: contractAddress as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: 'mintNFT',
          args: [recipient, tokenURI],
          chainId: sepolia.id,
        });

        console.log(`Transaction hash: ${hash}`);
        console.log(
          `Transaction submitted successfully! You can view it at https://sepolia.etherscan.io/tx/${hash}`,
        );

        // Log to help with debugging
        console.log(
          `Important: If events are not detected but transaction succeeded, manually refresh the collection view`,
        );

        // Since we can't get the tokenId directly from the transaction,
        // we would typically listen for events, but for now we'll return the tx hash
        return { hash };
      } catch (err) {
        console.error('Error minting NFT:', err);
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        return { error };
      }
    },
    [writeContractAsync],
  );

  return {
    mintNFT,
    isLoading: isMintLoading,
    error,
  };
}
