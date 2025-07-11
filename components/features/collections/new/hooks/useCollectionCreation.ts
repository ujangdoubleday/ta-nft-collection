'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/lib/hooks/wallet';
import { usePinataUpload } from '@/lib/hooks/usePinataUpload';
import { useNFTFactory } from '@/lib/blockchain/hooks';
import { trpc } from '@/lib/api/trpc/client';

export function useCollectionCreation() {
  const { address, isConnected, isAuthenticated, authenticate, connect } = useWallet();
  const { uploadToPinata, createFolder, isUploading } = usePinataUpload();
  const { createCollection, isLoading: isFactoryLoading } = useNFTFactory();
  const utils = trpc.useContext();

  // Get creation fee
  const { data: creationFeeData } = trpc.factoryConfig.getCreationFee.useQuery();

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [maxSupply, setMaxSupply] = useState('100');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createdAddress, setCreatedAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState('');

  useEffect(() => {
    // If not connected, don't show any errors yet
    if (!isConnected) {
      setErrorMessage(null);
      return;
    }

    // If connected but not authenticated
    if (isConnected && !isAuthenticated) {
      setErrorMessage('Please authenticate your wallet to create collections');
      return;
    }

    // Clear error if properly connected and authenticated
    setErrorMessage(null);
  }, [isConnected, isAuthenticated]);

  const handleImageChange = (file: File | null) => {
    setCoverImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleConnect = async () => {
    if (!isConnected) {
      await connect();
    }
    if (isConnected && !isAuthenticated) {
      await authenticate();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for authentication
    if (!isConnected || !isAuthenticated) {
      await handleConnect();
      return;
    }

    // Validate fields
    if (!name || !symbol || !description || !coverImage) {
      setErrorMessage('Please fill all required fields and upload an image');
      return;
    }

    try {
      setIsCreating(true);
      setErrorMessage(null);

      // Step 1: Create folder on Pinata
      setProcessingStep('Creating IPFS folder...');
      const shortAddress = address?.slice(0, 6) + '...' + address?.slice(-4);
      const folderName = `${name.toLowerCase().replace(/\s+/g, '-')}-${shortAddress}`;
      let folder = null;

      try {
        folder = await createFolder(folderName);
      } catch (error) {
        console.error('Error creating folder, continuing without it', error);
      }

      // Step 2: Upload metadata to IPFS
      setProcessingStep('Uploading metadata to IPFS...');
      if (!coverImage) {
        throw new Error('Cover image is required');
      }

      const uploadResult = await uploadToPinata(
        coverImage,
        {
          name,
          description,
          external_link: '',
        },
        folder?.id,
        'collection',
      );

      if (!uploadResult?.metadata?.url) {
        throw new Error('Failed to upload metadata');
      }

      // Step 3: Create collection on blockchain
      setProcessingStep('Creating collection on blockchain...');
      const totalSupplyBigInt = BigInt(parseInt(maxSupply || '100'));

      // Get creation fee
      const fee = creationFeeData?.rawFee ?? BigInt(0);

      // Create collection
      const blockchainResult = await createCollection(
        name,
        symbol,
        uploadResult.metadata.url,
        totalSupplyBigInt,
        fee,
      );

      if (blockchainResult.error) {
        throw blockchainResult.error;
      }

      // Step 4: Collection created successfully
      if (blockchainResult.hash) {
        setProcessingStep('Waiting for transaction confirmation...');

        // Wait for 5 seconds to allow blockchain to process
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Get the transaction receipt (you may need to implement event listening instead)
        // For now we'll just set success
        setCreateSuccess(true);
        setCreatedAddress(blockchainResult.hash);

        // Refresh collections data
        if (address) {
          await Promise.all([
            utils.collection.getEnrichedCreatorCollections.invalidate({ creatorAddress: address }),
            utils.collection.getCreatorCollections.invalidate({ creatorAddress: address }),
          ]);

          // Optionally revalidate on-demand
          try {
            await fetch('/api/revalidate?tag=collections');
          } catch (err) {
            console.error('Error revalidating:', err);
          }
        }
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error creating collection');
    } finally {
      setIsCreating(false);
    }
  };

  return {
    // State
    name,
    setName,
    symbol,
    setSymbol,
    description,
    setDescription,
    maxSupply,
    setMaxSupply,
    imagePreview,
    coverImage,
    isCreating,
    createSuccess,
    createdAddress,
    errorMessage,
    processingStep,
    address,
    isConnected,
    isAuthenticated,
    creationFeeData,

    // Handlers
    handleImageChange,
    handleConnect,
    handleCreate,
  };
}
