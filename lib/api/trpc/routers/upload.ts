import { z } from 'zod';
import { publicProcedure, router } from '@/lib/api/trpc/server';
import {
  createFolder,
  getFolders,
  uploadFile,
  uploadMetadata,
  PinataFolder,
  PinataUploadResult,
} from '@/lib/api/services/pinata/helper';

// Metadata types
const METADATA_TYPE = {
  COLLECTION: 'collection',
  NFT: 'nft',
};

export const uploadRouter = router({
  // Get all Pinata folders
  getPinataFolders: publicProcedure.query(async () => {
    try {
      const folders = await getFolders();
      return folders;
    } catch (error) {
      console.error('Error getting IPFS folders:', error);
      throw new Error(error instanceof Error ? error.message : 'Unknown error');
    }
  }),

  // Create a new Pinata folder
  createPinataFolder: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const { name } = input;
        // console.log(`Creating IPFS folder: ${name}`);

        const folder = await createFolder(name);
        // console.log(`Folder created: ${folder.name} (${folder.id})`);

        return folder;
      } catch (error) {
        console.error('Error creating IPFS folder:', error);
        throw new Error(error instanceof Error ? error.message : 'Unknown error');
      }
    }),

  // Upload file to Pinata
  uploadToPinata: publicProcedure
    .input(
      z.object({
        file: z.array(z.number()), // Array of numbers (Uint8Array serialized)
        fileName: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        folderId: z.string().optional(), // Optional folder ID
        banner_image: z.string().optional(),
        featured_image: z.string().optional(),
        external_link: z.string().optional(),
        external_url: z.string().optional(), // For NFT metadata
        collaborators: z.array(z.string()).optional(),
        attributes: z
          .array(
            z.object({
              trait_type: z.string(),
              value: z.string().or(z.number()),
            }),
          )
          .optional(), // For NFT metadata
        metadataType: z
          .enum([METADATA_TYPE.COLLECTION, METADATA_TYPE.NFT])
          .default(METADATA_TYPE.COLLECTION),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const {
          file,
          fileName,
          name,
          description,
          folderId,
          banner_image,
          featured_image,
          external_link,
          external_url,
          collaborators,
          attributes,
          metadataType,
        } = input;

        // Convert the array back to Buffer
        const fileBuffer = Buffer.from(file);

        // console.log(`Processing file: ${fileName}, size: ${fileBuffer.length} bytes`);
        if (folderId) {
          // console.log(`Using IPFS folder ID: ${folderId}`);
        }

        // Upload file to Pinata
        const result = await uploadFile(fileBuffer, fileName, folderId);

        // console.log(`File uploaded successfully to IPFS. CID: ${result.cid}`);

        // Create and upload metadata based on type
        let metadata;

        if (metadataType === METADATA_TYPE.COLLECTION) {
          // Collection metadata (contract level)
          metadata = {
            name: name || fileName,
            description: description || '',
            image: result.url,
            banner_image: banner_image || '',
            featured_image: featured_image || '',
            external_link: external_link || '',
            collaborators: collaborators || [],
          };
          // console.log('Creating collection (contract-level) metadata');
        } else {
          // NFT metadata (token standard)
          metadata = {
            name: name || fileName,
            description: description || '',
            image: result.url,
            external_url: external_url || external_link || '',
            attributes: attributes || [],
          };
          // console.log('Creating NFT (token-standard) metadata');
        }

        // console.log(`Creating metadata for: ${name || fileName}`);

        // Upload metadata to Pinata
        const metadataResult = await uploadMetadata(metadata, `metadata`, folderId);

        // console.log(`Metadata uploaded successfully to IPFS. CID: ${metadataResult.cid}`);

        return {
          success: true,
          image: result,
          metadata: metadataResult,
        };
      } catch (error) {
        console.error('Upload error:', error);
        throw new Error(error instanceof Error ? error.message : 'Unknown error');
      }
    }),
});
