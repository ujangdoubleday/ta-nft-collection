'use client';

import {
  useCollectionByContractAddress,
  useNFTsByContractAddress,
} from '@/components/features/collections/hooks';
import { CollectionDetail } from '@/components/features/collections/collection/detail';
import { LoadingWindow } from '@/components/shared/loading';
import { CollectionErrorMessage } from '@/components/features/collections/shared/error/CollectionErrorMessage';
import { useEffect, useState } from 'react';
import { generateSimpleColorPlaceholder } from '@/lib/utils/helpers/plaiceholder';
import { formatIPFSUrl } from '@/lib/utils/helpers/url';
import { EmptyCollectionContent } from '@/components/features/collections/collection/empty/EmptyCollectionContent';
import { useRouter } from 'next/navigation';

// Define types for collection items
type CollectionItem = {
  id: string;
  name: string;
  type: string;
  image: string;
  blurhash?: string;
  placeholder?: string;
  attributes: {
    rarity?: string;
    pixels?: string;
    dimensions?: string;
    complexity?: string;
    era?: string;
    style?: string;
    category?: string;
    resolution?: string;
    [key: string]: string | undefined;
  };
};

type Collection = {
  id: string;
  name: string;
  description: string;
  items: CollectionItem[];
};

// Define NFT metadata type
type NFTMetadata = {
  name: string;
  description: string;
  image: string;
  blurhash?: string;
  placeholder?: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
};

interface TrpcCollectionDetailProps {
  contractAddress: string;
}

// Loading component for collection
const CollectionLoading = () => {
  return (
    <LoadingWindow
      title="Loading Collection"
      text="Loading NFTs..."
      icon="/assets/icons/window/gallery.png"
    />
  );
};

export const TrpcCollectionDetail = ({ contractAddress }: TrpcCollectionDetailProps) => {
  // Add router
  const router = useRouter();

  // State for collection data
  const [processedItems, setProcessedItems] = useState<CollectionItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTimeout, setProcessingTimeout] = useState(false);
  const [timeoutItems, setTimeoutItems] = useState<CollectionItem[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const [formattedCollection, setFormattedCollection] = useState<Collection | null>(null);

  // Handler for mint NFT action
  const handleMintNFT = () => {
    router.push(`/collections/${contractAddress}/mint`);
  };

  // Fetch collection data using tRPC hook
  const {
    collection,
    isLoading: isLoadingCollection,
    error: collectionError,
  } = useCollectionByContractAddress(contractAddress);

  // Fetch NFTs data using tRPC hook
  const {
    nfts,
    isLoading: isLoadingNFTs,
    error: nftsError,
    refetch: refetchNFTs,
  } = useNFTsByContractAddress(contractAddress);

  // Refresh data on component mount
  useEffect(() => {
    // Force refresh NFT data when the component mounts
    refetchNFTs();
  }, [refetchNFTs]);

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    if (isProcessing) {
      const timer = setTimeout(async () => {
        // Generate placeholders when timeout occurs
        if (nfts && nfts.length > 0) {
          const items = await Promise.all(
            nfts.map(async (nft) => {
              // Generate a color placeholder based on tokenId
              const placeholder = await generateSimpleColorPlaceholder(nft.tokenId || 'default');

              // Use imageUrl from database if available
              let image = '';
              if (nft.imageUrl) {
                image = formatIPFSUrl(nft.imageUrl);
                console.log('Timeout: Using direct imageUrl from database:', image);
              }

              return {
                id: nft.tokenId,
                name: nft.name,
                type: 'Digital Art',
                image: image,
                blurhash: placeholder,
                placeholder: placeholder,
                attributes: { rarity: 'Common' },
              };
            }),
          );
          setTimeoutItems(items);

          // Create a formatted collection with timeout items
          if (collection) {
            const timeoutCollection: Collection = {
              id: collection.id,
              name: collection.name,
              description: collection.description || '',
              items: items,
            };
            setFormattedCollection(timeoutCollection);
            setIsDataReady(true);
          }
        }
        setProcessingTimeout(true);
      }, 5000); // 5 seconds timeout

      return () => clearTimeout(timer);
    }
  }, [isProcessing, nfts, collection]);

  // Process NFTs to fetch metadata
  useEffect(() => {
    if (!nfts || nfts.length === 0 || isProcessing || !collection) {
      // Set data ready to true if we have a collection but no NFTs
      if ((!nfts || nfts.length === 0) && collection && !isProcessing) {
        setIsDataReady(true);
      }
      return;
    }

    const fetchMetadata = async () => {
      setIsProcessing(true);
      setProcessingTimeout(false);
      setIsDataReady(false);

      try {
        const items: CollectionItem[] = await Promise.all(
          nfts.map(async (nft) => {
            // Default values - generate a placeholder instead of using static SVG
            const placeholder = await generateSimpleColorPlaceholder(nft.tokenId || 'default');
            let image = '';
            let blurhash = placeholder;
            let attributes: Record<string, string> = { rarity: 'Common' };

            // If NFT has imageUrl, use it directly
            if (nft.imageUrl) {
              image = formatIPFSUrl(nft.imageUrl);
              console.log('Using direct imageUrl from NFT database:', image);

              // Also generate a placeholder for this image
              try {
                blurhash = `/api/placeholder?url=${encodeURIComponent(image)}`;
              } catch (error) {
                console.error(`Error generating placeholder for ${image}:`, error);
              }

              // Return early with the database image
              return {
                id: nft.tokenId,
                name: nft.name,
                type: 'Digital Art',
                image: image,
                blurhash: blurhash,
                placeholder: blurhash,
                attributes: attributes,
              };
            }
            // Otherwise try to fetch metadata if URL exists
            else if (nft.metadataUrl) {
              try {
                const controller = new AbortController();
                const timeoutId = setTimeout(
                  () => controller.abort(new DOMException('Timeout', 'TimeoutError')),
                  3000,
                ); // 3 seconds timeout per request

                // Fetch the metadata from the metadataUrl
                const response = await fetch(nft.metadataUrl, {
                  signal: controller.signal,
                  cache: 'no-store', // Prevent caching issues
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                  const metadata: NFTMetadata = await response.json();

                  // Use image from metadata
                  if (metadata.image) {
                    console.log('Original image URL from metadata:', metadata.image);

                    // Format the image URL properly
                    image = formatIPFSUrl(metadata.image);

                    console.log('Final image URL to be used:', image);

                    // Use placeholder from metadata if available
                    if (metadata.placeholder) {
                      blurhash = metadata.placeholder;
                    }
                    // Or use blurhash from metadata if available
                    else if (metadata.blurhash) {
                      blurhash = metadata.blurhash;
                    }
                    // Otherwise generate a new placeholder
                    else {
                      try {
                        blurhash = await generateSimpleColorPlaceholder(metadata.image);
                      } catch (error) {
                        console.error(`Error generating placeholder for ${metadata.image}:`, error);
                      }
                    }
                  }

                  // Process attributes
                  if (metadata.attributes && metadata.attributes.length > 0) {
                    attributes = metadata.attributes.reduce(
                      (acc, attr) => {
                        if (attr.trait_type && attr.value) {
                          acc[attr.trait_type.toLowerCase()] = attr.value;
                        }
                        return acc;
                      },
                      {} as Record<string, string>,
                    );
                  }
                }
              } catch (error) {
                console.error(`Error fetching metadata for NFT ${nft.tokenId}:`, error);
                // Continue with default values on error
              }
            }

            return {
              id: nft.tokenId,
              name: nft.name,
              type: 'Digital Art',
              image: image,
              blurhash: blurhash,
              placeholder: blurhash,
              attributes: attributes,
            };
          }),
        );

        setProcessedItems(items);

        // Create the formatted collection with processed items
        const newFormattedCollection: Collection = {
          id: collection.id,
          name: collection.name,
          description: collection.description || '',
          items: items,
        };

        setFormattedCollection(newFormattedCollection);

        // Wait a bit to ensure all placeholders are generated before showing the collection
        setTimeout(() => {
          setIsDataReady(true);
        }, 500);
      } catch (error) {
        console.error('Error processing NFTs:', error);
        // Generate placeholders for each NFT instead of using static SVG
        const basicItems = await Promise.all(
          nfts.map(async (nft) => {
            // Generate a color placeholder based on tokenId
            const placeholder = await generateSimpleColorPlaceholder(nft.tokenId || 'default');

            // Use imageUrl from database if available
            let image = '';
            if (nft.imageUrl) {
              image = formatIPFSUrl(nft.imageUrl);
              console.log('Error fallback: Using direct imageUrl from database:', image);
            }

            return {
              id: nft.tokenId,
              name: nft.name,
              type: 'Digital Art',
              image: image,
              blurhash: placeholder,
              placeholder: placeholder,
              attributes: { rarity: 'Common' },
            };
          }),
        );

        setProcessedItems(basicItems);

        // Create the formatted collection with basic items
        const errorCollection: Collection = {
          id: collection.id,
          name: collection.name,
          description: collection.description || '',
          items: basicItems,
        };

        setFormattedCollection(errorCollection);

        // Wait a bit to ensure all placeholders are generated before showing the collection
        setTimeout(() => {
          setIsDataReady(true);
        }, 500);
      } finally {
        setIsProcessing(false);
      }
    };

    fetchMetadata();
  }, [nfts, collection]);

  // Show loading state
  if (isLoadingCollection || isLoadingNFTs || isProcessing || !isDataReady) {
    return <CollectionLoading />;
  }

  // Show error state
  if (collectionError || !collection) {
    return <CollectionErrorMessage />;
  }

  // Show empty state when collection exists but has no NFTs
  if (!nfts || nfts.length === 0) {
    return <EmptyCollectionContent onAddNewAction={handleMintNFT} />;
  }

  // Return the collection detail component with the formatted collection
  return formattedCollection ? (
    <CollectionDetail collectionId={contractAddress} collection={formattedCollection} />
  ) : (
    <EmptyCollectionContent onAddNewAction={handleMintNFT} />
  );
};
