import { useFactoryOwner as useFactoryOwnerRead } from './useNFTFactoryRead';
import { trpc } from '@/lib/api/trpc/client';

/**
 * Hook to get the owner of the NFTFactory contract
 * Returns the owner address
 */
export function useFactoryOwner() {
  // Use the TRPC query to get the owner address
  const { data: ownerAddress, isLoading } = trpc.factoryConfig.getFactoryOwner.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  return {
    ownerAddress,
    isLoading,
  };
}
