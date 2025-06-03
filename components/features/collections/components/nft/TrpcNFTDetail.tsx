'use client';

import { useCollectionByContractAddress, useNFTByTokenId } from '../../hooks';
import { ClientNFTDetail } from './ClientNFTDetail';
import { Win98Spinner } from '@/components/ui/organisms/Win98Spinner';
import { CollectionErrorMessage, NFTErrorMessage } from '../errors';
import { useEffect, useState } from 'react';

// Define gateway URL from environment variable or use default
const gatewayUrl = 'cyan-dead-reptile-256.mypinata.cloud';

// Define type for NFT history item
type HistoryItem = {
  type: string;
  from: string;
  to: string;
  date: string;
  price?: string;
};

// Define type for NFT item
type NFTItem = {
  name: string;
  description: string;
  type: string;
  creator: string;
  owner: string;
  mintDate: string;
  tokenId: string;
  blockchain: string;
  image: string;
  attributes: Record<string, string>;
  history?: HistoryItem[];
};

// Define NFT metadata type
type NFTMetadata = {
  name: string;
  description: string;
  image: string;
  directImageUrl: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
};

interface TrpcNFTDetailProps {
  contractAddress: string;
  nftId: string;
}

export const TrpcNFTDetail = ({ contractAddress, nftId }: TrpcNFTDetailProps) => {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState(false);
  const [metadataTimeout, setMetadataTimeout] = useState(false);

  // Fetch collection data using tRPC hook
  const {
    collection,
    isLoading: isLoadingCollection,
    error: collectionError,
  } = useCollectionByContractAddress(contractAddress);

  // Fetch NFT data using tRPC hook
  const {
    nft: dbNft,
    isLoading: isLoadingNft,
    error: nftError,
  } = useNFTByTokenId(nftId, contractAddress);

  // Fetch metadata from IPFS with timeout
  useEffect(() => {
    if (dbNft?.metadataUrl && !metadata && !isLoadingMetadata) {
      const fetchMetadata = async () => {
        setIsLoadingMetadata(true);
        setMetadataTimeout(false);

        // Set a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          setMetadataTimeout(true);
          setIsLoadingMetadata(false);
        }, 5000); // 5 seconds timeout

        try {
          // Extract CID from metadataUrl
          const cidMatch = dbNft.metadataUrl.match(/\/ipfs\/([^/]+)/);
          const cid = cidMatch ? cidMatch[1] : null;

          // Construct image URL directly if we have CID
          let imageUrl = '/assets/images/nfts/placeholder.svg';
          if (cid) {
            // Use CID directly as the image URL with the gateway from env
            imageUrl = `https://${gatewayUrl}/ipfs/${cid}`;
          }

          // Fetch metadata for attributes and other details
          const controller = new AbortController();
          const fetchTimeoutId = setTimeout(() => controller.abort(), 3000); // 3 seconds fetch timeout

          const response = await fetch(dbNft.metadataUrl, {
            signal: controller.signal,
            cache: 'no-store', // Prevent caching issues
          });

          clearTimeout(fetchTimeoutId);

          if (response.ok) {
            const data = await response.json();
            // Add the direct image URL to the metadata
            setMetadata({
              ...data,
              directImageUrl: imageUrl,
            });
            clearTimeout(timeoutId); // Clear the timeout if successful
          } else {
            // If metadata fetch fails but we have CID, create minimal metadata
            if (cid) {
              setMetadata({
                name: dbNft.name,
                description: dbNft.description || '',
                image: imageUrl,
                directImageUrl: imageUrl,
                attributes: [],
              });
              clearTimeout(timeoutId);
            } else {
              setMetadataError(true);
            }
          }
        } catch (error) {
          console.error('Error fetching metadata:', error);
          setMetadataError(true);
        } finally {
          setIsLoadingMetadata(false);
        }
      };

      fetchMetadata();
    }
  }, [dbNft, metadata, isLoadingMetadata]);

  // Show loading state, but only if we're not in a timeout
  if (
    (isLoadingCollection || isLoadingNft || (isLoadingMetadata && !metadataTimeout)) &&
    !metadataTimeout
  ) {
    return <Win98Spinner />;
  }

  // Show error state for collection
  if (collectionError || !collection) {
    return <CollectionErrorMessage />;
  }

  // Show error state for NFT
  if (!dbNft) {
    return <NFTErrorMessage collectionId={contractAddress} />;
  }

  // Process attributes from metadata
  const attributes: Record<string, string> = {};
  if (metadata?.attributes && metadata.attributes.length > 0) {
    metadata.attributes.forEach((attr) => {
      if (attr.trait_type && attr.value) {
        attributes[attr.trait_type.toLowerCase()] = attr.value;
      }
    });
  } else {
    // Fallback attributes
    attributes.rarity = 'Common';
  }

  // Convert database NFT to the expected format
  const nft: NFTItem = {
    name: metadata?.name || dbNft.name,
    description:
      metadata?.description ||
      dbNft.description ||
      `An NFT from the ${collection.name} collection.`,
    type: 'Digital Art',
    creator: collection.owner.address,
    owner: dbNft.owner.address,
    mintDate: dbNft.createdAt
      ? new Date(dbNft.createdAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    tokenId: dbNft.tokenId,
    blockchain: 'Ethereum', // Assuming Ethereum for now
    image: metadata?.directImageUrl || metadata?.image || '/assets/images/nfts/placeholder.svg',
    attributes: attributes,
    history: [
      {
        type: 'Mint',
        from: '0x0000000000000000000000000000000000000000',
        to: dbNft.owner.address,
        date: dbNft.createdAt
          ? new Date(dbNft.createdAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        price: '0.05 ETH', // Default price
      },
    ],
  };

  return (
    <ClientNFTDetail
      collectionId={contractAddress}
      nftId={nftId}
      nft={nft}
      collectionName={collection.name}
    />
  );
};
