'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/lib/hooks/wallet';
import { usePinataUpload } from '@/lib/hooks/usePinataUpload';
import { useNFTFactory } from '@/lib/blockchain/hooks';
import { trpc } from '@/lib/api/trpc/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useCollectionCreation() {
  const router = useRouter();
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
  const [processingStep, setProcessingStep] = useState('');

  // Prevent navigation during creation process or after success (until redirect)
  const preventNavigation = useCallback(
    (e: PopStateEvent) => {
      if (isCreating || createSuccess) {
        // This will prevent the navigation and keep the user on the current page
        e.preventDefault();
        // Push the current URL back to the history to cancel the navigation
        window.history.pushState(null, '', window.location.href);
        // Show an alert to inform the user
        const message = isCreating
          ? 'Collection creation is in progress. Please wait until the process is complete.'
          : 'Collection created successfully. Please wait for redirect.';
        alert(message);
      }
    },
    [isCreating, createSuccess],
  );

  // Handle browser back/forward navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Add event listener for popstate (browser back/forward)
      window.addEventListener('popstate', preventNavigation);

      // Push initial state to enable popstate detection
      window.history.pushState(null, '', window.location.href);

      return () => {
        window.removeEventListener('popstate', preventNavigation);
      };
    }
  }, [preventNavigation]);

  useEffect(() => {
    // If not connected, don't show any errors yet
    if (!isConnected) {
      return;
    }

    // If connected but not authenticated
    if (isConnected && !isAuthenticated) {
      toast.error('Please authenticate your wallet to create collections');
      return;
    }
  }, [isConnected, isAuthenticated]);

  const handleImageChange = (file: File | null) => {
    setCoverImage(file);

    if (file) {
      // Validate file size before setting preview
      if (file.size > 20 * 1024 * 1024) {
        // 20MB limit
        toast.error('Image size exceeds 20MB limit. Please choose a smaller image.');
        setCoverImage(null);
        return;
      }

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
      toast.error('Please fill all required fields and upload an image');
      return;
    }

    try {
      setIsCreating(true);

      // Step 1: Create folder on Pinata
      setProcessingStep('Creating IPFS folder...');
      const timestamp = Date.now();
      const folderName = `${name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
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

      // Use the enhanced uploadToPinata which handles large files
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

        // Step 5: Revalidate collections data
        setProcessingStep('Revalidating collections...');

        if (address) {
          // Refresh collections data in TRPC cache
          await Promise.all([
            utils.collection.getEnrichedCreatorCollections.invalidate({ creatorAddress: address }),
            utils.collection.getCreatorCollections.invalidate({ creatorAddress: address }),
          ]);

          // Revalidate on-demand
          try {
            await fetch('/api/revalidate?path=/user/collections&type=page');
            await fetch('/api/revalidate?path=/admin/collections&type=page');
          } catch (err) {
            console.error('Error revalidating:', err);
          }
        }

        // Set success state
        setCreateSuccess(true);
        setCreatedAddress(blockchainResult.hash);
        setProcessingStep('Collection created successfully!');
        toast.success('Collection created successfully!');
      }
    } catch (error) {
      console.error('Error creating collection:', error);

      // Handle specific error types for better user feedback
      if (error instanceof Error) {
        // Check for common blockchain errors
        if (
          error.message.includes('User denied transaction signature') ||
          error.message.includes('user rejected transaction') ||
          error.message.includes('User rejected the request')
        ) {
          toast.error('Transaction was rejected. Please approve the transaction to continue.');
        } else if (error.message.includes('insufficient funds')) {
          toast.error('Insufficient funds in your wallet to complete this transaction.');
        } else if (error.message.includes('gas')) {
          toast.error('Error with transaction gas. Please check your wallet settings.');
        } else if (error.message.includes('nonce')) {
          toast.error('Transaction nonce error. Please reset your wallet or try again.');
        } else if (error.message.includes('network')) {
          toast.error('Network error. Please check your connection.');
        } else if (error.message.includes('timeout')) {
          toast.error('Transaction timed out. The network may be congested.');
        } else if (error.message.includes('413') || error.message.includes('Content Too Large')) {
          toast.error('Image file is too large. Please choose a smaller image (under 20MB).');
        } else {
          // For other errors, extract a shorter version
          let shortMessage = error.message;

          // If message is too long, truncate it
          if (shortMessage.length > 100) {
            // Try to find MetaMask specific error message which is more concise
            if (shortMessage.includes('MetaMask Tx Signature:')) {
              shortMessage = shortMessage.split('MetaMask Tx Signature:')[1].trim();
            } else if (shortMessage.includes('Details:')) {
              shortMessage = shortMessage.split('Details:')[1].trim();
            } else {
              // Just take the first 100 chars if we can't find a specific part
              shortMessage = shortMessage.substring(0, 100) + '...';
            }
          }

          toast.error(shortMessage);
        }
      } else {
        toast.error('Unknown error creating collection. Please try again later.');
      }
    } finally {
      // Only reset isCreating if there was an error
      // If successful, keep it true until redirect happens
      if (!createSuccess) {
        setIsCreating(false);
        setProcessingStep('');
      }
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
