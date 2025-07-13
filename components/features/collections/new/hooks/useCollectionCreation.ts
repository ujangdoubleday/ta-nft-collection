'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/lib/hooks/wallet';
import { usePinataUpload } from '@/lib/hooks/usePinataUpload';
import { useNFTFactory } from '@/lib/blockchain/hooks';
import { trpc } from '@/lib/api/trpc/client';
import { useRouter } from 'next/navigation';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
          setErrorMessage('Transaction was rejected. Please approve the transaction to continue.');
        } else if (error.message.includes('insufficient funds')) {
          setErrorMessage('Insufficient funds in your wallet to complete this transaction.');
        } else if (error.message.includes('gas')) {
          setErrorMessage('Error with transaction gas. Please check your wallet settings.');
        } else if (error.message.includes('nonce')) {
          setErrorMessage('Transaction nonce error. Please reset your wallet or try again.');
        } else if (error.message.includes('network')) {
          setErrorMessage('Network error. Please check your connection.');
        } else if (error.message.includes('timeout')) {
          setErrorMessage('Transaction timed out. The network may be congested.');
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

          setErrorMessage(shortMessage);
        }
      } else {
        setErrorMessage('Unknown error creating collection. Please try again later.');
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
