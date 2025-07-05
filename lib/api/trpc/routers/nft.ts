import { z } from 'zod';
import { publicProcedure, router } from '@/lib/api/trpc/server';
import { publicClient } from '@/lib/blockchain/viem';
import { NFT_COLLECTION_ABI } from '@/lib/blockchain/abi';
import {
  fetchNFTsForContract,
  fetchNFTByTokenId,
  getNFTOwner,
  getTransferHistory,
  refreshNFTMetadata,
} from '@/lib/blockchain/utils/alchemy';

export const nftRouter = router({
  getByTokenId: publicProcedure
    .input(z.object({ tokenId: z.string(), contractAddress: z.string() }))
    .query(async ({ input }) => {
      const { tokenId, contractAddress } = input;

      try {
        // Fetch NFT directly from blockchain using Alchemy API
        const nft = await fetchNFTByTokenId(contractAddress, tokenId);

        if (!nft) {
          console.error(`NFT not found: ${contractAddress} - Token ID: ${tokenId}`);
          return null;
        }

        // Extract metadata from Alchemy response
        const metadata = nft.raw?.metadata || {};

        return {
          tokenId: nft.tokenId,
          name: nft.name || `NFT #${nft.tokenId}`,
          description: nft.description || metadata.description || '',
          metadataUrl: nft.tokenUri || nft.raw?.tokenUri || '',
          imageUrl: nft.image?.originalUrl || metadata.image || '',
          contractAddress: nft.contract.address,
          ownerAddress: '', // Note: Alchemy doesn't provide owner in this endpoint
          createdAt: new Date(nft.timeLastUpdated || Date.now()),
          updatedAt: new Date(nft.timeLastUpdated || Date.now()),
        };
      } catch (error) {
        console.error(
          `Error fetching NFT from blockchain: ${contractAddress} - Token ID: ${tokenId}`,
          error,
        );
        return null;
      }
    }),

  getCollectionOwner: publicProcedure
    .input(z.object({ collectionAddress: z.string() }))
    .query(async ({ input }) => {
      const { collectionAddress } = input;

      try {
        // Call the owner() function on the NFTCollection contract
        const owner = await publicClient.readContract({
          address: collectionAddress as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: 'owner',
        });

        return { owner };
      } catch (error) {
        console.error(`Error getting owner of collection ${collectionAddress}:`, error);
        return { owner: null, error: 'Failed to get collection owner' };
      }
    }),

  getByCollectionAddress: publicProcedure
    .input(z.object({ contractAddress: z.string() }))
    .query(async ({ input }) => {
      const { contractAddress } = input;

      try {
        // Fetch NFTs directly from blockchain using Alchemy API
        const alchemyResponse = await fetchNFTsForContract(contractAddress);

        if (alchemyResponse.nfts.length === 0) {
          // If no NFTs found, check if the collection exists on-chain
          try {
            const totalSupply = await publicClient.readContract({
              address: contractAddress as `0x${string}`,
              abi: NFT_COLLECTION_ABI,
              functionName: 'totalSupply',
            });

            if (Number(totalSupply) > 0) {
              console.log(
                `Collection ${contractAddress} has ${Number(totalSupply)} NFTs on-chain but none returned from Alchemy`,
              );
            }
          } catch (error) {
            console.error(`Error checking totalSupply for collection ${contractAddress}:`, error);
          }
        }

        // Map Alchemy NFTs to our application's format
        return alchemyResponse.nfts.map((nft) => {
          // Extract metadata from Alchemy response
          const metadata = nft.raw?.metadata || {};

          return {
            tokenId: nft.tokenId,
            name: nft.name || `NFT #${nft.tokenId}`,
            description: nft.description || metadata.description || '',
            metadataUrl: nft.tokenUri || nft.raw?.tokenUri || '',
            imageUrl: nft.raw?.metadata.image || metadata.image || '',
            contractAddress: nft.contract.address,
            ownerAddress: '', // Note: Alchemy doesn't provide owner in this endpoint
            createdAt: new Date(nft.timeLastUpdated || Date.now()),
            updatedAt: new Date(nft.timeLastUpdated || Date.now()),
          };
        });
      } catch (error) {
        console.error(
          `Error fetching NFTs from blockchain for collection ${contractAddress}:`,
          error,
        );
        return [];
      }
    }),

  // New procedure to get raw NFT data from Alchemy
  getRawNFTByTokenId: publicProcedure
    .input(z.object({ tokenId: z.string(), contractAddress: z.string() }))
    .query(async ({ input }) => {
      const { tokenId, contractAddress } = input;

      try {
        // Fetch NFT directly from blockchain using Alchemy API with raw data
        const nft = await fetchNFTByTokenId(contractAddress, tokenId);
        return nft;
      } catch (error) {
        console.error(
          `Error fetching raw NFT from blockchain: ${contractAddress} - Token ID: ${tokenId}`,
          error,
        );
        return null;
      }
    }),

  // New procedure to get NFT owner
  getNFTOwner: publicProcedure
    .input(z.object({ contractAddress: z.string(), tokenId: z.string() }))
    .query(async ({ input }) => {
      const { contractAddress, tokenId } = input;

      try {
        // Fetch NFT owner directly from blockchain
        const owner = await getNFTOwner(contractAddress, tokenId);
        return { owner };
      } catch (error) {
        console.error(
          `Error fetching NFT owner from blockchain: ${contractAddress} - Token ID: ${tokenId}`,
          error,
        );
        return { owner: null, error: 'Failed to get NFT owner' };
      }
    }),

  // New procedure to get NFT transfer history
  getTransferHistory: publicProcedure
    .input(z.object({ contractAddress: z.string(), tokenId: z.string() }))
    .query(async ({ input }) => {
      const { contractAddress, tokenId } = input;

      try {
        console.log(
          `tRPC - Fetching transfer history for NFT: ${contractAddress} Token ID: ${tokenId}`,
        );
        const history = await getTransferHistory(contractAddress, tokenId);
        return history;
      } catch (error) {
        console.error(
          `Error fetching transfer history: ${contractAddress} - Token ID: ${tokenId}`,
          error,
        );
        return [];
      }
    }),

  // New procedure to refresh NFT metadata
  refreshNFTMetadata: publicProcedure
    .input(z.object({ contractAddress: z.string(), tokenId: z.string() }))
    .mutation(async ({ input }) => {
      const { contractAddress, tokenId } = input;

      try {
        console.log(`tRPC - Refreshing metadata for NFT: ${contractAddress} Token ID: ${tokenId}`);
        const result = await refreshNFTMetadata(contractAddress, tokenId);
        return result;
      } catch (error) {
        console.error(
          `Error refreshing NFT metadata: ${contractAddress} - Token ID: ${tokenId}`,
          error,
        );
        return { success: false, error };
      }
    }),
});
