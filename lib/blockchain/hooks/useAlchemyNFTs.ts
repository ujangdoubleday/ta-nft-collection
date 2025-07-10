import {
  fetchNFTsForContract,
  AlchemyNFT,
  AlchemyNFTResponse,
  getNFTOwner,
  fetchNFTByTokenId,
  fetchNFTsForOwner,
} from '../utils/alchemy';
import { useQuery } from '@tanstack/react-query';

/**
 * Custom hook to fetch NFTs for a contract using Alchemy API
 * @param contractAddress The contract address to fetch NFTs for
 * @returns Object containing NFTs data, loading state, error state, and refetch function
 */
export const useAlchemyNFTs = (contractAddress: string | null) => {
  const { data, isLoading, error, refetch } = useQuery<AlchemyNFTResponse, Error>({
    queryKey: ['alchemy-nfts', contractAddress],
    queryFn: () =>
      contractAddress
        ? fetchNFTsForContract(contractAddress)
        : Promise.resolve({ nfts: [], pageKey: null }),
    enabled: !!contractAddress,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });

  return {
    nfts: data?.nfts || [],
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to fetch the owner of an NFT
 * @param contractAddress The contract address of the NFT
 * @param tokenId The token ID of the NFT
 * @returns Object containing the owner address and loading state
 */
export function useNFTOwner(contractAddress: string | undefined, tokenId: string | undefined) {
  const { data: owner, isLoading } = useQuery({
    queryKey: ['nft-owner', contractAddress, tokenId],
    queryFn: async () => {
      if (!contractAddress || !tokenId) return null;
      return getNFTOwner(contractAddress, tokenId);
    },
    enabled: !!contractAddress && !!tokenId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { owner, isLoading };
}

/**
 * Hook to fetch a single NFT by token ID
 * @param contractAddress The contract address of the NFT
 * @param tokenId The token ID of the NFT
 * @returns Object containing the NFT data, loading state, and error state
 */
export function useAlchemyNFT(contractAddress: string | undefined, tokenId: string | undefined) {
  const {
    data: nft,
    isLoading,
    error,
    refetch,
  } = useQuery<AlchemyNFT | null, Error>({
    queryKey: ['alchemy-nft', contractAddress, tokenId],
    queryFn: async () => {
      if (!contractAddress || !tokenId) return null;
      return fetchNFTByTokenId(contractAddress, tokenId);
    },
    enabled: !!contractAddress && !!tokenId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  return { nft, isLoading, error, refetch };
}

/**
 * Hook to fetch all NFTs for an owner across multiple collections
 * @param ownerAddress The owner's wallet address
 * @param contractAddresses Optional array of contract addresses to filter by
 * @returns Object containing the NFTs data, loading state, and error state
 */
export function useNFTsForOwner(ownerAddress: string | null, contractAddresses: string[] = []) {
  const { data, isLoading, error, refetch } = useQuery<{ nfts: AlchemyNFT[] }, Error>({
    queryKey: ['nfts-for-owner', ownerAddress, contractAddresses],
    queryFn: async () => {
      if (!ownerAddress) return { nfts: [] };
      return fetchNFTsForOwner(ownerAddress, contractAddresses);
    },
    enabled: !!ownerAddress,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  return {
    nfts: data?.nfts || [],
    isLoading,
    error,
    refetch,
  };
}
