'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Upload, X, Check } from 'lucide-react';
import { NewCollectionHeader } from './NewCollectionHeader';
import { useWallet } from '@/lib/hooks/wallet';
import { usePinataUpload } from '@/lib/hooks/usePinataUpload';
import { useNFTFactory } from '@/lib/blockchain/hooks';
import { trpc } from '@/lib/api/trpc/client';
import { useRouter } from 'next/navigation';

export function NewCollectionContentWithBlockchain() {
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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

  if (createSuccess) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        <div className="text-center py-12">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Collection Created Successfully!</h2>
          <p className="text-zinc-400 mb-6">
            Your new NFT collection has been created and is ready to use.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href={`/user/collections/${createdAddress}`}
              className="bg-white text-black hover:bg-zinc-200 py-2 px-4 rounded-md transition-colors text-sm font-medium"
            >
              View Collection
            </Link>
            <Link
              href={`/user/collections/${createdAddress}/mint`}
              className="bg-[#0A0A0A] border border-[#1f1f1f] hover:bg-[#1f1f1f] text-white py-2 px-4 rounded-md transition-colors text-sm font-medium"
            >
              Mint First NFT
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Display a connect wallet message if not connected or authenticated
  if (!isConnected || !isAuthenticated) {
    return (
      <>
        <NewCollectionHeader />
        <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
          <div className="text-center py-12">
            <div className="bg-[#0A0A0A] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#1f1f1f]">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
            <p className="text-zinc-400 mb-6">
              {!isConnected
                ? 'Connect your wallet to create a new NFT collection.'
                : 'Please authenticate your wallet to create collections.'}
            </p>
            <button
              onClick={handleConnect}
              className="bg-white text-black hover:bg-zinc-200 py-2 px-6 rounded-md transition-colors text-sm font-medium inline-flex items-center gap-2"
            >
              {!isConnected ? 'Connect Wallet' : 'Authenticate Wallet'}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NewCollectionHeader />

      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        <form onSubmit={handleCreate}>
          {errorMessage && (
            <div className="bg-red-900/40 border border-red-700 text-red-100 p-3 rounded-md mb-6">
              <p>{errorMessage}</p>
            </div>
          )}

          {processingStep && (
            <div className="bg-blue-900/40 border border-blue-700 text-blue-100 p-3 rounded-md mb-6">
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <p>{processingStep}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Image Upload */}
            <div className="w-full lg:w-1/3">
              <div className="mb-4">
                <label className="block text-white mb-2 text-sm font-medium">
                  Collection Image
                </label>
                <div className="relative aspect-square bg-[#0A0A0A] border border-[#1f1f1f] border-dashed rounded-lg overflow-hidden flex flex-col items-center justify-center">
                  {imagePreview ? (
                    <>
                      <Image
                        src={imagePreview}
                        alt="Collection Preview"
                        fill
                        className="object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setCoverImage(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-[#0A0A0A] border border-[#1f1f1f] rounded-full"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center h-full w-full">
                      <Upload className="h-8 w-8 text-white mb-2" />
                      <span className="text-white text-sm font-medium">Upload Image</span>
                      <span className="text-zinc-400 text-xs mt-1">
                        PNG, JPG, SVG, GIF (Max 10MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
                <p className="text-zinc-500 text-xs mt-1">
                  This image will be used as the collection thumbnail and logo
                </p>
              </div>
            </div>

            {/* Right Column - Collection Details */}
            <div className="w-full lg:w-2/3">
              <div className="mb-4">
                <label htmlFor="name" className="block text-white mb-2 text-sm font-medium">
                  Collection Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter collection name"
                  className="w-full bg-[#0A0A0A] border border-[#1f1f1f] rounded-md py-2 px-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="symbol" className="block text-white mb-2 text-sm font-medium">
                  Collection Symbol
                </label>
                <input
                  type="text"
                  id="symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="Enter collection symbol (e.g. PIXEL)"
                  className="w-full bg-[#0A0A0A] border border-[#1f1f1f] rounded-md py-2 px-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
                  required
                  maxLength={6}
                />
                <p className="text-zinc-500 text-xs mt-1">
                  A short symbol for your collection (max 6 characters)
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="maxSupply" className="block text-white mb-2 text-sm font-medium">
                  Maximum Supply
                </label>
                <input
                  type="number"
                  id="maxSupply"
                  value={maxSupply}
                  onChange={(e) => setMaxSupply(e.target.value)}
                  placeholder="Enter maximum supply (e.g. 100)"
                  className="w-full bg-[#0A0A0A] border border-[#1f1f1f] rounded-md py-2 px-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
                  required
                  min="1"
                  max="10000"
                />
                <p className="text-zinc-500 text-xs mt-1">
                  Maximum number of NFTs that can be minted in this collection
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="description" className="block text-white mb-2 text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter collection description"
                  rows={4}
                  className="w-full bg-[#0A0A0A] border border-[#1f1f1f] rounded-md py-2 px-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
                  required
                ></textarea>
              </div>

              {/* Creation fee info */}
              <div className="mb-6 bg-[#0A0A0A] border border-[#1f1f1f] p-3 rounded-md">
                <p className="text-sm text-white">
                  <span className="font-medium">Collection Owner:</span>{' '}
                  <span className="text-zinc-400">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </p>
                <p className="text-sm text-white mt-1">
                  <span className="font-medium">Creation Fee:</span>{' '}
                  <span className="text-zinc-400">{creationFeeData?.fee || '0'} ETH</span>
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isCreating || !name || !symbol || !description || !imagePreview}
                  className={`bg-white text-black hover:bg-zinc-200 py-2 px-6 rounded-md transition-colors text-sm font-medium flex items-center gap-2 ${
                    (isCreating || !name || !symbol || !description || !imagePreview) &&
                    'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {isCreating ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></span>
                      Creating...
                    </>
                  ) : (
                    'Create Collection'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
