import { z } from 'zod';
import { publicProcedure, router } from '@/lib/api/trpc/server';
import {
  uploadFileToPinata,
  uploadMetadataToPinata,
  createPinataFolder,
  getPinataFolders,
} from '@/lib/api/services/pinata';

export const uploadRouter = router({
  // Get all Pinata folders
  getPinataFolders: publicProcedure.query(async () => {
    try {
      const folders = await getPinataFolders();
      return folders;
    } catch (error) {
      console.error('Error getting Pinata folders:', error);
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
        console.log(`Creating Pinata folder: ${name}`);

        const folder = await createPinataFolder(name);
        console.log(`Folder created: ${folder.name} (${folder.id})`);

        return folder;
      } catch (error) {
        console.error('Error creating Pinata folder:', error);
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
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const { file, fileName, name, description, folderId } = input;

        // Convert the array back to Buffer
        const fileBuffer = Buffer.from(file);

        console.log(`Processing file: ${fileName}, size: ${fileBuffer.length} bytes`);
        if (folderId) {
          console.log(`Using folder ID: ${folderId}`);
        }

        // Upload file to Pinata
        const result = await uploadFileToPinata(fileBuffer, fileName, folderId);

        console.log(`File uploaded successfully. CID: ${result.cid}`);

        // Create and upload metadata
        const metadata = {
          name: name || fileName,
          description: description || '',
          image: result.url,
          attributes: [],
        };

        console.log(`Creating metadata for: ${name || fileName}`);

        // Upload metadata to Pinata
        const metadataResult = await uploadMetadataToPinata(
          metadata,
          `${name || 'collection'}-metadata`,
          folderId,
        );

        console.log(`Metadata uploaded successfully. CID: ${metadataResult.cid}`);

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
