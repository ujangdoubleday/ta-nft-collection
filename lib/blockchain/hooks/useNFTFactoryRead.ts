import { useReadContract } from 'wagmi';
import { sepolia } from 'wagmi/chains';

// Import ABIs from the Hardhat-compiled contracts
// @ts-ignore - This will be imported properly as JSON
import NFT_FACTORY_ABI from '../abi/NFTFactory.json';
import { NFT_FACTORY_ADDRESS } from '../utils/collection';

/**
 * Hook to get a collection by address from the NFTFactory contract
 * @param collectionAddress The address of the collection to get info for
 * @param options Optional query configuration options
 */
export function useCollectionInfo(collectionAddress?: `0x${string}`, options?: any) {
  return useReadContract({
    address: NFT_FACTORY_ADDRESS,
    abi: NFT_FACTORY_ABI,
    functionName: 'getCollectionInfo',
    args: collectionAddress ? [collectionAddress] : undefined,
    query: {
      enabled: !!collectionAddress,
      ...options,
    },
  });
}

/**
 * Hook to get all collections created by a specific address
 * @param creatorAddress The address of the creator
 * @param options Optional query configuration options
 */
export function useCollectionInfoByCreator(creatorAddress?: `0x${string}`, options?: any) {
  return useReadContract({
    address: NFT_FACTORY_ADDRESS,
    abi: NFT_FACTORY_ABI,
    functionName: 'getCollectionInfoByCreator',
    args: creatorAddress ? [creatorAddress] : undefined,
    query: {
      enabled: !!creatorAddress,
      ...options,
    },
  });
}

/**
 * Hook to get all collections from the NFTFactory contract
 * @param options Optional query configuration options
 */
export function useAllCollections(options?: any) {
  return useReadContract({
    address: NFT_FACTORY_ADDRESS,
    abi: NFT_FACTORY_ABI,
    functionName: 'getAllCollections',
    query: options,
  });
}

/**
 * Hook to get a specific collection by index
 * @param index The index of the collection
 */
export function useCollectionByIndex(index?: bigint) {
  return useReadContract({
    address: NFT_FACTORY_ADDRESS,
    abi: NFT_FACTORY_ABI,
    functionName: 'allCollections',
    args: index !== undefined ? [index] : undefined,
    query: {
      enabled: index !== undefined,
    },
  });
}

/**
 * Hook to check if a collection is valid
 * @param collectionAddress The address of the collection to check
 */
export function useIsCollectionValid(collectionAddress?: `0x${string}`) {
  return useReadContract({
    address: NFT_FACTORY_ADDRESS,
    abi: NFT_FACTORY_ABI,
    functionName: 'isCollectionValid',
    args: collectionAddress ? [collectionAddress] : undefined,
    query: {
      enabled: !!collectionAddress,
    },
  });
}

/**
 * Hook to check if a collection is valid (alternative method)
 * @param collectionAddress The address of the collection to check
 */
export function useIsValidCollection(collectionAddress?: `0x${string}`) {
  return useReadContract({
    address: NFT_FACTORY_ADDRESS,
    abi: NFT_FACTORY_ABI,
    functionName: 'isValidCollection',
    args: collectionAddress ? [collectionAddress] : undefined,
    query: {
      enabled: !!collectionAddress,
    },
  });
}

/**
 * Hook to get the collection creation fee
 */
export function useCreationFee() {
  return useReadContract({
    address: NFT_FACTORY_ADDRESS,
    abi: NFT_FACTORY_ABI,
    functionName: 'creationFee',
  });
}

/**
 * Hook to get the total number of collections
 */
export function useTotalCollections() {
  return useReadContract({
    address: NFT_FACTORY_ADDRESS,
    abi: NFT_FACTORY_ABI,
    functionName: 'totalCollections',
  });
}

/**
 * Hook to get the total fees collected
 */
export function useTotalFeesCollected() {
  return useReadContract({
    address: NFT_FACTORY_ADDRESS,
    abi: NFT_FACTORY_ABI,
    functionName: 'totalFeesCollected',
  });
}

/**
 * Hook to get the owner of the NFTFactory contract
 */
export function useFactoryOwner() {
  return useReadContract({
    address: NFT_FACTORY_ADDRESS,
    abi: NFT_FACTORY_ABI,
    functionName: 'owner',
  });
}

/**
 * Hook to check if the NFTFactory contract is paused
 */
export function useIsPaused() {
  return useReadContract({
    address: NFT_FACTORY_ADDRESS,
    abi: NFT_FACTORY_ABI,
    functionName: 'paused',
  });
}

/**
 * Hook to get the factory stats
 */
export function useFactoryStats() {
  return useReadContract({
    address: NFT_FACTORY_ADDRESS,
    abi: NFT_FACTORY_ABI,
    functionName: 'getFactoryStats',
  });
}

/**
 * Hook to get collection info directly from the mapping
 * @param collectionAddress The address of the collection
 */
export function useCollectionInfoMapping(collectionAddress?: `0x${string}`) {
  return useReadContract({
    address: NFT_FACTORY_ADDRESS,
    abi: NFT_FACTORY_ABI,
    functionName: 'collectionInfo',
    args: collectionAddress ? [collectionAddress] : undefined,
    query: {
      enabled: !!collectionAddress,
    },
  });
}

/**
 * Hook to get collection info by creator and index
 * @param creatorAddress The address of the creator
 * @param index The index of the collection
 */
export function useCreatorCollectionByIndex(creatorAddress?: `0x${string}`, index?: bigint) {
  return useReadContract({
    address: NFT_FACTORY_ADDRESS,
    abi: NFT_FACTORY_ABI,
    functionName: 'creatorToCollectionInfo',
    args: creatorAddress && index !== undefined ? [creatorAddress, index] : undefined,
    query: {
      enabled: !!creatorAddress && index !== undefined,
    },
  });
}
