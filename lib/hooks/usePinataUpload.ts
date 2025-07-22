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
  const createMetadataMutation = trpc.upload.createMetadataWithCid.useMutation();
  const getUploadUrlMutation = trpc.upload.getUploadUrl.useMutation();
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

  // Direct upload method for large files
  const directUpload = async (
    file: File,
    folderId?: string,
  ): Promise<{ cid: string; url: string }> => {
    // Create a FormData instance
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    if (folderId) {
      formData.append('folderId', folderId);
    }

    try {
      console.log(
        `Starting direct upload for ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
      );

      // Send the file directly to our API endpoint with fetch
      const response = await fetch('/api/upload/direct', {
        method: 'POST',
        body: formData,
        // Disable the default timeout for large files
        // This is needed for Next.js 15
        signal: AbortSignal.timeout(120000), // 2 minute timeout
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload failed with status:', response.status);
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      console.log(`Upload successful. CID: ${result.cid}`);
      return {
        cid: result.cid,
        url: result.url,
      };
    } catch (error) {
      console.error('Direct upload error:', error);
      throw error;
    }
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
      let imageResult;
      const fileSize = file.size;

      // If file is larger than 5MB, use direct upload
      if (fileSize > 5 * 1024 * 1024) {
        console.log('Large file detected, using direct upload');
        imageResult = await directUpload(file, folderId || selectedFolder?.id);
      } else {
        // For smaller files, use the existing method
        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Convert to Uint8Array for better serialization
        const uint8Array = new Uint8Array(arrayBuffer);

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

        if (!result.success || !result.image) {
          throw new Error(result.error || 'Failed to upload image');
        }

        imageResult = result.image;

        // If we have metadata result already, return it
        if (result.metadata) {
          setUploadResult({
            success: true,
            image: imageResult,
            metadata: result.metadata,
          });

          return {
            success: true,
            image: imageResult,
            metadata: result.metadata,
          };
        }
      }

      // If we get here, we need to create metadata separately
      // Prepare metadata input
      const metadataInput: any = {
        imageCid: imageResult.cid,
        name: metadata.name,
        description: metadata.description,
        folderId: folderId || selectedFolder?.id,
        metadataType,
      };

      // Add type-specific fields
      if (metadataType === METADATA_TYPE.COLLECTION) {
        const collectionMetadata = metadata as CollectionMetadata;
        metadataInput.banner_image = collectionMetadata.banner_image;
        metadataInput.featured_image = collectionMetadata.featured_image;
        metadataInput.external_link = collectionMetadata.external_link;
        metadataInput.collaborators = collectionMetadata.collaborators;
      } else {
        const nftMetadata = metadata as NFTTokenMetadata;
        metadataInput.external_url = nftMetadata.external_url;
        metadataInput.attributes = nftMetadata.attributes;
      }

      // Create metadata with the image CID
      const metadataResult = await createMetadataMutation.mutateAsync(metadataInput);

      const result = {
        success: true,
        image: imageResult,
        metadata: metadataResult.metadata,
      };

      setUploadResult(result);
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error uploading to IPFS',
      };
      setUploadResult(errorResult);
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
