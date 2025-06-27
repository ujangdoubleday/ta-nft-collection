import { useCallback, useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { useCreateCollection } from './useNFTFactoryWrite';

// Import ABIs from the Hardhat-compiled contracts
// @ts-ignore - This will be imported properly as JSON
import NFT_FACTORY_ABI from '../abi/NFTFactory.json';
import { NFT_FACTORY_ADDRESS } from '@/lib/blockchain';

export interface UseNFTFactoryReturn {
  createCollection: (
    name: string,
    symbol: string,
    contractURI: string,
    totalSupply: bigint,
    creationFee: bigint,
  ) => Promise<{
    hash?: `0x${string}`;
    collectionAddress?: `0x${string}`;
    error?: Error;
  }>;
  isLoading: boolean;
  error: Error | null;
}

export function useNFTFactory(): UseNFTFactoryReturn {
  const { createCollection, isLoading, error } = useCreateCollection();

  return {
    createCollection: async (
      name: string,
      symbol: string,
      contractURI: string,
      totalSupply: bigint,
      creationFee: bigint,
    ) => {
      return await createCollection(name, symbol, contractURI, totalSupply, creationFee);
    },
    isLoading,
    error,
  };
}
