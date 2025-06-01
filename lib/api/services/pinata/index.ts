// Import SDK implementation
import { PinataSDK } from 'pinata';
// Import API implementation for fallback
import * as PinataAPI from './api';

// Initialize Pinata SDK client
const pinataJWT = process.env.PINATA_JWT;
const pinataGateway = process.env.NEXT_PUBLIC_GATEWAY_URL || 'gateway.pinata.cloud';

// Check if credentials are available
if (!pinataJWT) {
  console.warn('Pinata JWT not found in environment variables');
}

// Create Pinata SDK client if credentials are available
const pinataSDK = pinataJWT ? new PinataSDK({ pinataJwt: pinataJWT, pinataGateway }) : null;

/**
 * Helper function to create a File-like object that works in Node.js
 * Creates a File object with all required properties for the Pinata SDK
 */
function createFileFromBuffer(
  buffer: Buffer,
  filename: string,
  mimeType = 'application/octet-stream',
) {
  // Create a blob from the buffer
  const blob = new Blob([buffer], { type: mimeType });

  // Add required File interface properties
  return Object.assign(blob, {
    name: filename,
    lastModified: new Date().getTime(),
    webkitRelativePath: '',
  });
}

/**
 * Create a new folder (group) in Pinata using SDK
 * @param name Name for the folder
 * @returns Folder ID and name
 */
export async function createPinataFolder(name: string) {
  try {
    if (!pinataSDK) {
      console.warn('Pinata SDK not initialized. Falling back to direct API implementation.');
      return PinataAPI.createPinataFolder(name);
    }

    try {
      console.log(`Creating Pinata group using SDK: ${name}`);

      const group = await pinataSDK.groups.public.create({ name });
      console.log('Pinata group created:', group);

      return {
        id: group.id,
        name: name,
      };
    } catch (sdkError: any) {
      console.error('Pinata SDK error details:', sdkError);
      console.warn('Falling back to direct API implementation.');

      // Use direct API implementation as fallback
      return PinataAPI.createPinataFolder(name);
    }
  } catch (error) {
    console.error('Error creating Pinata group:', error);
    throw new Error(
      `Failed to create Pinata group: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Get list of folders from Pinata using SDK
 * @returns Array of folders
 */
export async function getPinataFolders() {
  try {
    if (!pinataSDK) {
      console.warn('Pinata SDK not initialized. Falling back to direct API implementation.');
      return PinataAPI.getPinataFolders();
    }

    try {
      const groups = await pinataSDK.groups.public.list();
      console.log('Pinata groups fetched:', groups);

      // Handle different response structures
      if (groups && typeof groups === 'object') {
        // Try to access the items array using different potential paths
        const items =
          // @ts-ignore - Handling potential response structures
          groups.data?.items ||
          // @ts-ignore - Handling potential response structures
          groups.items ||
          [];

        return items.map((group: any) => ({
          id: group.id,
          name: group.name,
        }));
      }

      return [];
    } catch (sdkError: any) {
      console.error('Pinata SDK error details:', sdkError);
      console.warn('Falling back to direct API implementation.');

      // Use direct API implementation as fallback
      return PinataAPI.getPinataFolders();
    }
  } catch (error) {
    console.error('Error getting Pinata folders:', error);
    throw new Error(
      `Failed to get Pinata folders: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Upload file to Pinata IPFS using SDK
 * @param fileBuffer File buffer to upload
 * @param fileName Name for the file
 * @param folderId Optional folder/group ID to upload to
 * @returns CID and URL of the uploaded file
 */
export async function uploadFileToPinata(fileBuffer: Buffer, fileName: string, folderId?: string) {
  try {
    if (!pinataSDK) {
      console.warn('Pinata SDK not initialized. Falling back to direct API implementation.');
      return PinataAPI.uploadFileToPinata(fileBuffer, fileName, folderId);
    }

    try {
      const file = createFileFromBuffer(fileBuffer, fileName);

      let uploadResult;

      // Upload to specific group if folder ID is provided
      if (folderId && !folderId.startsWith('folder_')) {
        console.log(`Uploading file to Pinata group: ${folderId}`);

        uploadResult = await pinataSDK.upload.public.file(file as File, {
          groupId: folderId,
        });
      } else {
        // Upload without group
        uploadResult = await pinataSDK.upload.public.file(file as File);
      }

      console.log('File uploaded to Pinata successfully:', uploadResult);

      return {
        cid: uploadResult.cid,
        url: `https://${pinataGateway}/ipfs/${uploadResult.cid}`,
      };
    } catch (sdkError: any) {
      console.error('Pinata SDK upload error:', sdkError);
      console.warn('Falling back to direct API implementation.');

      // Use direct API implementation as fallback
      return PinataAPI.uploadFileToPinata(fileBuffer, fileName, folderId);
    }
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw new Error(
      `Failed to upload to Pinata: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Upload JSON metadata to Pinata IPFS using SDK
 * @param metadata JSON metadata to upload
 * @param name Name for the metadata file
 * @param folderId Optional folder/group ID to upload to
 * @returns CID and URL of the uploaded metadata
 */
export async function uploadMetadataToPinata(metadata: any, name: string, folderId?: string) {
  try {
    if (!pinataSDK) {
      console.warn('Pinata SDK not initialized. Falling back to direct API implementation.');
      return PinataAPI.uploadMetadataToPinata(metadata, name, folderId);
    }

    try {
      // Convert metadata to JSON string
      const metadataString = JSON.stringify(metadata);

      const file = createFileFromBuffer(
        Buffer.from(metadataString),
        `${name}.json`,
        'application/json',
      );

      let uploadResult;

      // Upload to specific group if folder ID is provided
      if (folderId && !folderId.startsWith('folder_')) {
        console.log(`Uploading metadata to Pinata group: ${folderId}`);

        uploadResult = await pinataSDK.upload.public.file(file as File, {
          groupId: folderId,
        });
      } else {
        // Upload without group
        uploadResult = await pinataSDK.upload.public.file(file as File);
      }

      console.log('Metadata uploaded to Pinata successfully:', uploadResult);

      return {
        cid: uploadResult.cid,
        url: `https://${pinataGateway}/ipfs/${uploadResult.cid}`,
      };
    } catch (sdkError: any) {
      console.error('Pinata SDK metadata upload error:', sdkError);
      console.warn('Falling back to direct API implementation.');

      // Use direct API implementation as fallback
      return PinataAPI.uploadMetadataToPinata(metadata, name, folderId);
    }
  } catch (error) {
    console.error('Error uploading metadata to Pinata:', error);
    throw new Error(
      `Failed to upload metadata to Pinata: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// Export the Pinata API client for backward compatibility
export const { pinata } = PinataAPI;
