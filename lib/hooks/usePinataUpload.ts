import { useState } from 'react';
import { trpc } from '@/lib/api/trpc/client';
import { PinataFolder } from '@/lib/api/services/pinata/helper';

// Metadata types
export const METADATA_TYPE = {
  COLLECTION: 'collection',
  NFT: 'nft',
};

interface UploadResult {
  success: boolean;
  image?: {
    cid: string;
    url: string;
  };
  metadata?: {
    cid: string;
    url: string;
  };
  error?: string;
}

// Base metadata interface with common fields
interface BaseMetadata {
  name?: string;
  description?: string;
  image?: string;
}

// Collection metadata (contract level)
interface CollectionMetadata extends BaseMetadata {
  banner_image?: string;
  featured_image?: string;
  external_link?: string;
  collaborators?: string[];
}

// NFT metadata (token standard)
interface NFTTokenMetadata extends BaseMetadata {
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

// Union type for both metadata types
export type NFTMetadata = CollectionMetadata | NFTTokenMetadata;

export function usePinataUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<PinataFolder | null>(null);

  // Get the tRPC mutations and queries
  const uploadMutation = trpc.upload.uploadToPinata.useMutation();
  const createFolderMutation = trpc.upload.createPinataFolder.useMutation();
  const foldersQuery = trpc.upload.getPinataFolders.useQuery(undefined, {
    // Don't refetch on window focus
    refetchOnWindowFocus: false,
  });

  // Create a new folder
  const createFolder = async (folderName: string) => {
    if (!folderName) return null;

    setIsCreatingFolder(true);

    try {
      const result = await createFolderMutation.mutateAsync({ name: folderName });

      // Refresh folders list
      await foldersQuery.refetch();

      // Return the created folder
      return result;
    } catch (error) {
      console.error('Error creating IPFS folder:', error);
      throw error;
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Select a folder
  const selectFolder = (folder: PinataFolder | null) => {
    setSelectedFolder(folder);
    return folder;
  };

  // Upload file to Pinata
  const uploadToPinata = async (
    file: File,
    metadata: NFTMetadata = {},
    folderId?: string,
    metadataType: string = METADATA_TYPE.COLLECTION,
  ) => {
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Convert to Uint8Array for better serialization
      const uint8Array = new Uint8Array(arrayBuffer);

      // Limit file size to avoid issues
      if (uint8Array.length > 10 * 1024 * 1024) {
        // 10MB limit
        throw new Error('File size exceeds 10MB limit');
      }

      // Extract metadata fields based on type
      const commonFields = {
        name: metadata.name,
        description: metadata.description,
      };

      // Prepare upload data
      const uploadData: any = {
        file: Array.from(uint8Array), // Convert to regular array for serialization
        fileName: file.name,
        ...commonFields,
        folderId: folderId || selectedFolder?.id, // Use provided folderId or selected folder
        metadataType,
      };

      // Add type-specific fields
      if (metadataType === METADATA_TYPE.COLLECTION) {
        const collectionMetadata = metadata as CollectionMetadata;
        uploadData.banner_image = collectionMetadata.banner_image;
        uploadData.featured_image = collectionMetadata.featured_image;
        uploadData.external_link = collectionMetadata.external_link;
        uploadData.collaborators = collectionMetadata.collaborators;
      } else {
        const nftMetadata = metadata as NFTTokenMetadata;
        uploadData.external_url = nftMetadata.external_url;
        uploadData.attributes = nftMetadata.attributes;
      }

      // Use tRPC mutation to upload
      const result = await uploadMutation.mutateAsync(uploadData);

      setUploadResult(result);
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error uploading to IPFS',
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadToPinata,
    createFolder,
    selectFolder,
    isUploading,
    isCreatingFolder,
    uploadResult,
    selectedFolder,
    folders: foldersQuery.data || [],
    isFoldersLoading: foldersQuery.isLoading,
    refetchFolders: foldersQuery.refetch,
  };
}
