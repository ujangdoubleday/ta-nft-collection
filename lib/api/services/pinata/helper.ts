/**
 * Pinata IPFS Service Helper
 *
 * This file provides a simplified interface for interacting with Pinata IPFS services.
 * It exports all the necessary functions and types for working with Pinata.
 */

import {
  createPinataFolder,
  getPinataFolders,
  uploadFileToPinata,
  uploadMetadataToPinata,
  pinata,
} from './index';

// Re-export all functions and types
export { createPinataFolder, getPinataFolders, uploadFileToPinata, uploadMetadataToPinata, pinata };

// Define common types for Pinata services
export interface PinataFolder {
  id: string;
  name: string;
  isDummy?: boolean;
}

export interface PinataUploadResult {
  cid: string;
  url: string;
}

/**
 * Helper function to create a Pinata folder
 * @param name Name for the folder
 * @returns Folder information
 */
export const createFolder = async (name: string): Promise<PinataFolder> => {
  return createPinataFolder(name);
};

/**
 * Helper function to get all Pinata folders
 * @returns Array of folders
 */
export const getFolders = async (): Promise<PinataFolder[]> => {
  return getPinataFolders();
};

/**
 * Helper function to upload a file to Pinata IPFS
 * @param fileBuffer File buffer to upload
 * @param fileName Name for the file
 * @param folderId Optional folder/group ID to upload to
 * @returns CID and URL of the uploaded file
 */
export const uploadFile = async (
  fileBuffer: Buffer,
  fileName: string,
  folderId?: string,
): Promise<PinataUploadResult> => {
  return uploadFileToPinata(fileBuffer, fileName, folderId);
};

/**
 * Helper function to upload JSON metadata to Pinata IPFS
 * @param metadata JSON metadata to upload
 * @param name Name for the metadata file
 * @param folderId Optional folder/group ID to upload to
 * @returns CID and URL of the uploaded metadata
 */
export const uploadMetadata = async (
  metadata: any,
  name: string,
  folderId?: string,
): Promise<PinataUploadResult> => {
  return uploadMetadataToPinata(metadata, name, folderId);
};
