import { useCreateCollection } from './useNFTFactoryWrite';

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
