import { useState } from 'react';
import { trpc } from '@/lib/api/trpc/client';

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

interface PinataFolder {
  id: string;
  name: string;
}

interface NFTMetadata {
  name?: string;
  description?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

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
      console.error('Error creating folder:', error);
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
  const uploadToPinata = async (file: File, metadata: NFTMetadata = {}, folderId?: string) => {
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

      // Use tRPC mutation to upload
      const result = await uploadMutation.mutateAsync({
        file: Array.from(uint8Array), // Convert to regular array for serialization
        fileName: file.name,
        name: metadata.name,
        description: metadata.description,
        attributes: metadata.attributes,
        folderId: folderId || selectedFolder?.id, // Use provided folderId or selected folder
      });

      setUploadResult(result);
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error uploading to Pinata',
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
