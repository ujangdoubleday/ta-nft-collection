import { serverClient, makeSerializable } from '@/lib/api/trpc/server-client';

/**
 * Fetch a collection by contract address
 * @param contractAddress The contract address of the collection (used as the slug in the URL)
 * @returns The collection data or null if not found
 */
export async function getCollectionByContractAddress(contractAddress: string) {
  try {
    const result = await serverClient.collection.getByContractAddress({ contractAddress });
    return result ? makeSerializable(result) : null;
  } catch (error) {
    console.error('Error fetching collection by contract address:', error);
    return null;
  }
}

/**
 * Fetch NFTs by contract address
 * @param contractAddress The contract address of the collection
 * @returns Array of NFTs or empty array if error
 */
export async function getNFTsByContractAddress(contractAddress: string) {
  try {
    const result = await serverClient.nft.getByContractAddress({ contractAddress });
    return makeSerializable(result || []);
  } catch (error) {
    console.error('Error fetching NFTs by contract address:', error);
    return [];
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

/**
 * Fetch all collections
 * @returns Array of collections or empty array if error
 */
export async function getAllCollections() {
  try {
    const result = await serverClient.collection.getAll();
    return makeSerializable(result || []);
  } catch (error) {
    console.error('Error fetching all collections:', error);
    return [];
  }
}
