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
  fetchNFTsForOwner,
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
      // console.log(`TRPC - Getting NFTs for collection ${contractAddress}`);

      try {
        // Fetch NFTs for the collection
        const alchemyResponse = await fetchNFTsForContract(contractAddress);

        // Check if we have NFTs to process
        if (!alchemyResponse || !alchemyResponse.nfts || alchemyResponse.nfts.length === 0) {
          // console.log(`TRPC - No NFTs found for collection ${contractAddress}`);
          return [];
        }

        // console.log(
        //   `TRPC - Processing ${alchemyResponse.nfts.length} NFTs for collection ${contractAddress}`,
        // );

        // Map to consistent format
        const processedNfts = alchemyResponse.nfts.map((nft) => {
          // Make sure we have a valid NFT object
          if (!nft || !nft.tokenId) {
            console.warn(`TRPC - Invalid NFT object found in collection ${contractAddress}`, nft);
            return null;
          }

          // Format the NFT data consistently
          return {
            tokenId: nft.tokenId,
            name: nft.name || `NFT #${nft.tokenId}`,
            description: nft.description || nft.raw?.metadata?.description || '',
            metadataUrl: nft.tokenUri || nft.raw?.tokenUri || '',
            imageUrl: nft.raw?.metadata?.image || nft.image?.originalUrl || '',
            contractAddress: contractAddress, // Always include the contract address
            metadata: nft.raw?.metadata || {},
            image: nft.image || {},
            createdAt: nft.timeLastUpdated ? new Date(nft.timeLastUpdated) : new Date(),
            updatedAt: nft.timeLastUpdated ? new Date(nft.timeLastUpdated) : new Date(),
          };
        });

        // Filter out any null values
        const validNfts = processedNfts.filter((nft) => nft !== null);
        // console.log(
        //   `TRPC - Returning ${validNfts.length} valid NFTs for collection ${contractAddress}`,
        // );

        return validNfts;
      } catch (error) {
        console.error(`Error getting NFTs for collection ${contractAddress}:`, error);
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
        // console.log(
        //   `tRPC - Fetching transfer history for NFT: ${contractAddress} Token ID: ${tokenId}`,
        // );
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
        // console.log(`tRPC - Refreshing metadata for NFT: ${contractAddress} Token ID: ${tokenId}`);
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

  // Get NFTs by owner and collection addresses
  getByOwner: publicProcedure
    .input(
      z.object({
        ownerAddress: z.string(),
        contractAddresses: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const { ownerAddress, contractAddresses } = input;
        const { nfts } = await fetchNFTsForOwner(ownerAddress, contractAddresses || []);

        // Map NFTs to a more convenient structure
        return nfts.map((nft) => ({
          id: nft.tokenId,
          tokenId: nft.tokenId,
          name: nft.name || `NFT #${nft.tokenId}`,
          description: nft.description || '',
          imageUrl: nft.image?.originalUrl || nft.image?.cachedUrl || '',
          contractAddress: nft.contract.address,
          symbol: nft.contract.symbol,
          tokenType: nft.tokenType,
          metadata: nft.raw.metadata,
          timeLastUpdated: nft.timeLastUpdated,
        }));
      } catch (error) {
        console.error('Error fetching NFTs by owner:', error);
        throw new Error('Failed to fetch NFTs by owner');
      }
    }),

  // Tambahkan procedure baru untuk admin
  getAllNFTs: publicProcedure
    .input(
      z.object({
        contractAddresses: z.array(z.string()).optional(),
        limit: z.number().optional().default(100),
      }),
    )
    .query(async ({ input }) => {
      const { contractAddresses, limit } = input;

      // console.log(`TRPC - Getting all NFTs, contractAddresses:`, contractAddresses?.length);

      try {
        // Jika tidak ada alamat kontrak, ambil dari semua koleksi
        let addresses = contractAddresses || [];

        // Batasi jumlah alamat yang akan diproses
        const addressesToProcess = addresses.slice(0, 10); // Process max 10 collections at once

        // console.log(
        //   `TRPC - Processing ${addressesToProcess.length} contract addresses for getAllNFTs`,
        // );

        // Ambil NFT dari semua koleksi secara paralel
        const nftsByCollection = await Promise.all(
          addressesToProcess.map(async (address) => {
            try {
              // console.log(`TRPC - Fetching NFTs for collection ${address}`);
              const alchemyResponse = await fetchNFTsForContract(address);

              if (!alchemyResponse || !alchemyResponse.nfts || alchemyResponse.nfts.length === 0) {
                // console.log(`TRPC - No NFTs found for collection ${address}`);
                return [];
              }

              // Map each NFT to include its collection address with consistent format
              return alchemyResponse.nfts
                .filter((nft) => nft && nft.tokenId) // Filter out invalid NFTs
                .map((nft) => ({
                  tokenId: nft.tokenId,
                  name: nft.name || `NFT #${nft.tokenId}`,
                  description: nft.description || nft.raw?.metadata?.description || '',
                  metadataUrl: nft.tokenUri || nft.raw?.tokenUri || '',
                  imageUrl: nft.raw?.metadata?.image || nft.image?.originalUrl || '',
                  contractAddress: address, // Always use the correct address
                  metadata: nft.raw?.metadata || {},
                  image: nft.image || {},
                  createdAt: nft.timeLastUpdated ? new Date(nft.timeLastUpdated) : new Date(),
                  updatedAt: nft.timeLastUpdated ? new Date(nft.timeLastUpdated) : new Date(),
                }));
            } catch (error) {
              console.error(`Error fetching NFTs from collection ${address}:`, error);
              return []; // Return empty array on error
            }
          }),
        );

        // Gabungkan semua NFT
        const allNfts = nftsByCollection.flat();

        // Batasi jumlah NFT yang dikembalikan
        const limitedNfts = allNfts.slice(0, limit);

        // console.log(`TRPC - Returning ${limitedNfts.length} NFTs out of ${allNfts.length} total`);

        // Validate before returning
        const validNfts = limitedNfts.filter(
          (nft) => nft && typeof nft === 'object' && nft.tokenId && nft.contractAddress,
        );

        if (validNfts.length !== limitedNfts.length) {
          // console.warn(`TRPC - Filtered out ${limitedNfts.length - validNfts.length} invalid NFTs`);
        }

        return validNfts;
      } catch (error) {
        console.error('Error in getAllNFTs:', error);
        return [];
      }
    }),
});
