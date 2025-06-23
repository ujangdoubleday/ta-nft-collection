import { useReadContract } from 'wagmi';

// Import ABIs from the Hardhat-compiled contracts
// @ts-ignore - This will be imported properly as JSON
import NFT_COLLECTION_ABI from '../abi/NFTCollection.json';

/**
 * Hook to get the owner of an NFT collection
 * @param collectionAddress The address of the collection contract
 * @returns The owner address and loading state
 */
export function useCollectionOwner(collectionAddress?: `0x${string}`) {
  return useReadContract({
    address: collectionAddress,
    abi: NFT_COLLECTION_ABI,
    functionName: 'owner',
    query: {
      enabled: !!collectionAddress,
    },
  });
}

/**
 * Hook to get the collection metadata URI
 * @param collectionAddress The address of the collection contract
 */
export function useContractURI(collectionAddress?: `0x${string}`) {
  return useReadContract({
    address: collectionAddress,
    abi: NFT_COLLECTION_ABI,
    functionName: 'contractURI',
    query: {
      enabled: !!collectionAddress,
    },
  });
}

/**
 * Hook to get the collection info
 * @param collectionAddress The address of the collection contract
 */
export function useCollectionInfo(collectionAddress?: `0x${string}`) {
  return useReadContract({
    address: collectionAddress,
    abi: NFT_COLLECTION_ABI,
    functionName: 'getCollectionInfo',
    query: {
      enabled: !!collectionAddress,
    },
  });
}

/**
 * Hook to get the total supply of the collection
 * @param collectionAddress The address of the collection contract
 */
export function useTotalSupply(collectionAddress?: `0x${string}`) {
  return useReadContract({
    address: collectionAddress,
    abi: NFT_COLLECTION_ABI,
    functionName: 'totalSupply',
    query: {
      enabled: !!collectionAddress,
    },
  });
}

/**
 * Hook to get the max supply of the collection
 * @param collectionAddress The address of the collection contract
 */
export function useMaxSupply(collectionAddress?: `0x${string}`) {
  return useReadContract({
    address: collectionAddress,
    abi: NFT_COLLECTION_ABI,
    functionName: 'maxSupply',
    query: {
      enabled: !!collectionAddress,
    },
  });
}

/**
 * Hook to get the tokens owned by an address
 * @param collectionAddress The address of the collection contract
 * @param ownerAddress The address of the token owner
 */
export function useTokensByOwner(collectionAddress?: `0x${string}`, ownerAddress?: `0x${string}`) {
  return useReadContract({
    address: collectionAddress,
    abi: NFT_COLLECTION_ABI,
    functionName: 'getTokensByOwner',
    args: ownerAddress ? [ownerAddress] : undefined,
    query: {
      enabled: !!collectionAddress && !!ownerAddress,
    },
  });
}

/**
 * Hook to check if a token exists
 * @param collectionAddress The address of the collection contract
 * @param tokenId The token ID to check
 */
export function useTokenExists(collectionAddress?: `0x${string}`, tokenId?: bigint) {
  return useReadContract({
    address: collectionAddress,
    abi: NFT_COLLECTION_ABI,
    functionName: 'exists',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: !!collectionAddress && tokenId !== undefined,
    },
  });
}
