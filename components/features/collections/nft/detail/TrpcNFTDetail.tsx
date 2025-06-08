'use client';

import {
  useCollectionByContractAddress,
  useNFTByTokenId,
} from '@/components/features/collections/hooks';
import { ClientNFTDetail } from './ClientNFTDetail';
import { CollectionErrorMessage } from '@/components/features/collections/shared/error/CollectionErrorMessage';
import { NFTErrorMessage } from '@/components/features/collections/shared/error/NFTErrorMessage';
import { useEffect, useState } from 'react';
import { formatIPFSUrl } from '@/lib/utils/helpers/url';
import { generateSimpleColorPlaceholder } from '@/lib/utils/helpers/plaiceholder';
import { LoadingWindow } from '@/components/shared/loading/LoadingWindow';

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

// Loading component for NFT detail
export const NFTDetailLoading = () => {
  return (
    <LoadingWindow
      title="Loading NFT"
      text="Loading NFT details..."
      icon="/assets/icons/window/nft.png"
      minHeight="min-h-[400px]"
    />
  );
};

export const TrpcNFTDetail = ({ contractAddress, nftId }: TrpcNFTDetailProps) => {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState(false);
  const [metadataTimeout, setMetadataTimeout] = useState(false);
  const [placeholderImage, setPlaceholderImage] = useState<string | null>(null);

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

  // Generate a placeholder for the NFT
  useEffect(() => {
    if (dbNft) {
      const generatePlaceholder = async () => {
        try {
          // Generate a placeholder based on NFT ID
          const placeholder = await generateSimpleColorPlaceholder(dbNft.imageUrl);
          setPlaceholderImage(placeholder);
        } catch (error) {
          console.error('Error generating placeholder:', error);
        }
      };

      generatePlaceholder();
    }
  }, [dbNft]);

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
          // Use imageUrl from database if available
          let imageUrl = '';

          if (dbNft.imageUrl) {
            // Format the image URL properly if it's an IPFS URL
            imageUrl = formatIPFSUrl(dbNft.imageUrl);
            console.log('Using imageUrl from database:', imageUrl);

            // Create minimal metadata with the database image
            setMetadata({
              name: dbNft.name,
              description: dbNft.description || '',
              image: imageUrl,
              directImageUrl: imageUrl,
              attributes: [],
            });
            clearTimeout(timeoutId);
            setIsLoadingMetadata(false);
            return;
          }

          // If no imageUrl in database, extract CID from metadataUrl as fallback
          const cidMatch = dbNft.metadataUrl.match(/\/ipfs\/([^/]+)/);
          const cid = cidMatch ? cidMatch[1] : null;

          // Construct image URL directly if we have CID
          if (cid) {
            // Use CID directly as the image URL with the gateway from env
            imageUrl = `https://${gatewayUrl}/ipfs/${cid}`;
          }

          // Fetch metadata for attributes and other details
          const controller = new AbortController();
          const fetchTimeoutId = setTimeout(
            () => controller.abort(new DOMException('Timeout', 'TimeoutError')),
            3000,
          ); // 3 seconds fetch timeout

          const response = await fetch(dbNft.metadataUrl, {
            signal: controller.signal,
            cache: 'no-store', // Prevent caching issues
          });

          clearTimeout(fetchTimeoutId);

          if (response.ok) {
            const data = await response.json();

            // Process the image URL from metadata
            let metadataImageUrl = data.image || '';

            // If the image URL is an IPFS URL, convert it to use our gateway
            if (metadataImageUrl.includes('ipfs://')) {
              const ipfsCid = metadataImageUrl.replace('ipfs://', '').split('/')[0];
              metadataImageUrl = `https://${gatewayUrl}/ipfs/${ipfsCid}`;
            }

            // Add the direct image URL to the metadata
            setMetadata({
              ...data,
              image: metadataImageUrl,
              directImageUrl: metadataImageUrl || imageUrl,
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

  if (isLoadingCollection || isLoadingNft || isLoadingMetadata) {
    return <NFTDetailLoading />;
  }

  if (collectionError || !collection) {
    return <CollectionErrorMessage />;
  }

  if (!dbNft) {
    return <NFTErrorMessage collectionId={contractAddress} />;
  }

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

  // Get the image URL with fallbacks
  let imageUrl = '';
  if (dbNft.imageUrl) {
    imageUrl = formatIPFSUrl(dbNft.imageUrl);
  } else if (metadata?.directImageUrl) {
    imageUrl = metadata.directImageUrl;
  } else if (metadata?.image) {
    imageUrl = metadata.image;
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
    image: imageUrl || '',
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
      placeholderImage={placeholderImage}
    />
  );
};
