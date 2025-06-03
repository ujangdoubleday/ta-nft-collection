'use client';

import { useCollectionByContractAddress, useNFTsByContractAddress } from '../../hooks';
import { CollectionDetail } from '@/components/features/collections';
import { Win98Spinner } from '@/components/ui/organisms/Win98Spinner';
import { CollectionErrorMessage } from '../errors/CollectionErrorMessage';
import { useEffect, useState } from 'react';
import { generateBlurhash } from '@/lib/utils/helpers/blurhash';

// Define gateway URL from environment variable or use default
const gatewayUrl = 'cyan-dead-reptile-256.mypinata.cloud';

// Define types for collection items
type CollectionItem = {
  id: string;
  name: string;
  type: string;
  image: string;
  blurhash?: string;
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
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
};

interface TrpcCollectionDetailProps {
  contractAddress: string;
}

export const TrpcCollectionDetail = ({ contractAddress }: TrpcCollectionDetailProps) => {
  const [processedItems, setProcessedItems] = useState<CollectionItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTimeout, setProcessingTimeout] = useState(false);
  const [timeoutItems, setTimeoutItems] = useState<CollectionItem[]>([]);

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
  } = useNFTsByContractAddress(contractAddress);

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    if (isProcessing) {
      const timer = setTimeout(async () => {
        // Generate placeholders when timeout occurs
        if (nfts && nfts.length > 0) {
          const items = await Promise.all(
            nfts.map(async (nft) => {
              const placeholderBlurhash = await generateBlurhash(nft.tokenId || 'default');
              return {
                id: nft.tokenId,
                name: nft.name,
                type: 'Digital Art',
                image: placeholderBlurhash || '/assets/images/placeholders/image-placeholder.svg',
                blurhash: placeholderBlurhash,
                attributes: { rarity: 'Common' },
              };
            }),
          );
          setTimeoutItems(items);
        }
        setProcessingTimeout(true);
      }, 5000); // 5 seconds timeout

      return () => clearTimeout(timer);
    }
  }, [isProcessing, nfts]);

  // Process NFTs to fetch metadata
  useEffect(() => {
    if (!nfts || nfts.length === 0 || isProcessing) return;

    const fetchMetadata = async () => {
      setIsProcessing(true);
      setProcessingTimeout(false);

      try {
        const items: CollectionItem[] = await Promise.all(
          nfts.map(async (nft) => {
            // Default values - generate a placeholder instead of using static SVG
            const placeholderBlurhash = await generateBlurhash(nft.tokenId || 'default');
            let image = placeholderBlurhash || '/assets/images/placeholders/image-placeholder.svg';
            let blurhash: string | undefined = placeholderBlurhash;
            let attributes: Record<string, string> = { rarity: 'Common' };

            // Try to fetch metadata if URL exists
            if (nft.metadataUrl) {
              try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout per request

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
                    image = metadata.image; // This is the image URL from the metadata

                    // Generate blurhash for the image if not already in metadata
                    if (!metadata.blurhash) {
                      try {
                        blurhash = await generateBlurhash(metadata.image);
                      } catch (error) {
                        console.error(`Error generating blurhash for ${metadata.image}:`, error);
                      }
                    } else {
                      blurhash = metadata.blurhash;
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
              attributes: attributes,
            };
          }),
        );

        setProcessedItems(items);
      } catch (error) {
        console.error('Error processing NFTs:', error);
        // Generate placeholders for each NFT instead of using static SVG
        const basicItems = await Promise.all(
          nfts.map(async (nft) => {
            const placeholderBlurhash = await generateBlurhash(nft.tokenId || 'default');
            return {
              id: nft.tokenId,
              name: nft.name,
              type: 'Digital Art',
              image: placeholderBlurhash || '/assets/images/placeholders/image-placeholder.svg',
              blurhash: placeholderBlurhash,
              attributes: { rarity: 'Common' },
            };
          }),
        );
        setProcessedItems(basicItems);
      } finally {
        setIsProcessing(false);
      }
    };

    fetchMetadata();
  }, [nfts]);

  // Show loading state, but with a timeout to prevent infinite loading
  if ((isLoadingCollection || isLoadingNFTs) && !processingTimeout) {
    return <Win98Spinner />;
  }

  // If we're still processing but hit the timeout, show the collection with basic data
  if (isProcessing && processingTimeout && timeoutItems.length > 0) {
    // Show collection with basic items if we have collection data
    if (collection) {
      const basicCollection: Collection = {
        id: collection.id,
        name: collection.name,
        description: collection.description || '',
        items: timeoutItems,
      };

      return <CollectionDetail collectionId={contractAddress} collection={basicCollection} />;
    }
  }

  // Show error state
  if (collectionError || !collection) {
    return <CollectionErrorMessage />;
  }

  // Convert database collection to the expected format
  const formattedCollection: Collection = {
    id: collection.id,
    name: collection.name,
    description: collection.description || '',
    items: processedItems.length > 0 ? processedItems : timeoutItems.length > 0 ? timeoutItems : [],
  };

  return <CollectionDetail collectionId={contractAddress} collection={formattedCollection} />;
};
