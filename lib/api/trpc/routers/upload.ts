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
        console.log(`Creating IPFS folder: ${name}`);

        const folder = await createFolder(name);
        console.log(`Folder created: ${folder.name} (${folder.id})`);

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
        attributes: z
          .array(
            z.object({
              trait_type: z.string(),
              value: z.string(),
            }),
          )
          .optional(), // Optional array of attributes
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const { file, fileName, name, description, folderId, attributes } = input;

        // Convert the array back to Buffer
        const fileBuffer = Buffer.from(file);

        console.log(`Processing file: ${fileName}, size: ${fileBuffer.length} bytes`);
        if (folderId) {
          console.log(`Using IPFS folder ID: ${folderId}`);
        }

        // Upload file to Pinata
        const result = await uploadFile(fileBuffer, fileName, folderId);

        console.log(`File uploaded successfully to IPFS. CID: ${result.cid}`);

        // Create and upload metadata
        const metadata = {
          name: name || fileName,
          description: description || '',
          image: result.url,
          attributes: attributes || [],
        };

        console.log(`Creating metadata for: ${name || fileName}`);
        if (attributes && attributes.length > 0) {
          console.log(`Including ${attributes.length} attributes in metadata`);
        }

        // Upload metadata to Pinata
        const metadataResult = await uploadMetadata(metadata, `metadata`, folderId);

        console.log(`Metadata uploaded successfully to IPFS. CID: ${metadataResult.cid}`);

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
