import { serverClient, makeSerializable } from '@/lib/api/trpc/server-client';

/**
 * Check if a collection is valid by calling the blockchain
 * @param contractAddress The contract address to validate
 * @returns Boolean indicating whether the collection is valid
 */
export async function isCollectionValid(contractAddress: string) {
  try {
    const isValid = await serverClient.collection.isCollectionValid({
      collectionAddress: contractAddress,
    });
    return isValid;
  } catch (error) {
    console.error('Error validating collection:', error);
    return false;
  }
}

/**
 * Fetch NFT by token ID and contract address
 * @param tokenId The token ID of the NFT
 * @param contractAddress The contract address of the collection
 * @returns The NFT data or null if not found
 */
export async function getNFTByTokenId(tokenId: string, contractAddress: string) {
  try {
    const result = await serverClient.nft.getByTokenId({ tokenId, contractAddress });
    return result ? makeSerializable(result) : null;
  } catch (error) {
    console.error('Error fetching NFT by token ID:', error);
    return null;
  }
}
