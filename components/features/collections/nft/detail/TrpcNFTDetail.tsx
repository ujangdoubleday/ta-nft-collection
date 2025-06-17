'use client';

import {
  useCollectionByContractAddress,
  useNFTByTokenId,
} from '@/components/features/collections/hooks';
import { ClientNFTDetail } from './ClientNFTDetail';
import { CollectionErrorMessage } from '@/components/features/collections/shared/error/CollectionErrorMessage';
import { NFTErrorMessage } from '@/components/features/collections/shared/error/NFTErrorMessage';
import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatIPFSUrl } from '@/lib/utils/helpers/url';
import { generateSimpleColorPlaceholder } from '@/lib/utils/helpers/plaiceholder';
import { LoadingWindow } from '@/components/shared/loading/LoadingWindow';

// Define gateway URL from environment variable or use default
const GATEWAY_URL =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'cyan-dead-reptile-256.mypinata.cloud';

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

// Utility functions
const extractCIDFromUrl = (url: string): string | null => {
  const cidMatch = url.match(/\/ipfs\/([^/]+)/);
  return cidMatch ? cidMatch[1] : null;
};

const constructImageUrl = (cid: string): string => {
  return `https://${GATEWAY_URL}/ipfs/${cid}`;
};

const formatDate = (date: Date | string): string => {
  return new Date(date).toISOString().split('T')[0];
};

// Async functions for React Query
const fetchNFTMetadata = async (metadataUrl: string): Promise<NFTMetadata> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(new DOMException('Timeout', 'TimeoutError')),
    3000,
  );

  try {
    const response = await fetch(metadataUrl, {
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Process the image URL from metadata
    let metadataImageUrl = data.image || '';

    // If the image URL is an IPFS URL, convert it to use our gateway
    if (metadataImageUrl.includes('ipfs://')) {
      const ipfsCid = metadataImageUrl.replace('ipfs://', '').split('/')[0];
      metadataImageUrl = constructImageUrl(ipfsCid);
    }

    return {
      ...data,
      image: metadataImageUrl,
      directImageUrl: metadataImageUrl,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const generatePlaceholder = async (imageUrl: string): Promise<string> => {
  return await generateSimpleColorPlaceholder(imageUrl);
};

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
  // UI state (keep useState + useEffect)
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

  // React Query for generating placeholder
  const { data: placeholderImage, isLoading: isGeneratingPlaceholder } = useQuery({
    queryKey: ['nft-placeholder', dbNft?.imageUrl || dbNft?.tokenId],
    queryFn: () => generatePlaceholder(dbNft?.imageUrl || dbNft?.tokenId || 'default'),
    enabled: !!dbNft,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // React Query for fetching metadata
  const {
    data: metadata,
    isLoading: isLoadingMetadata,
    error: metadataError,
  } = useQuery({
    queryKey: ['nft-metadata', dbNft?.metadataUrl],
    queryFn: () => fetchNFTMetadata(dbNft!.metadataUrl!),
    enabled: !!dbNft?.metadataUrl && !dbNft?.imageUrl, // Only fetch if no direct imageUrl
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

  // Create minimal metadata from database if imageUrl exists (derived state)
  const minimalMetadata = useMemo((): NFTMetadata | null => {
    if (!dbNft?.imageUrl) return null;

    const imageUrl = formatIPFSUrl(dbNft.imageUrl);
    return {
      name: dbNft.name,
      description: dbNft.description || '',
      image: imageUrl,
      directImageUrl: imageUrl,
      attributes: [],
    };
  }, [dbNft]);

  // Fallback metadata creation (derived state)
  const fallbackMetadata = useMemo((): NFTMetadata | null => {
    if (!dbNft?.metadataUrl || metadata || minimalMetadata) return null;

    const cid = extractCIDFromUrl(dbNft.metadataUrl);
    if (!cid) return null;

    const imageUrl = constructImageUrl(cid);
    return {
      name: dbNft.name,
      description: dbNft.description || '',
      image: imageUrl,
      directImageUrl: imageUrl,
      attributes: [],
    };
  }, [dbNft, metadata, minimalMetadata]);

  // Final metadata (derived state)
  const finalMetadata = minimalMetadata || metadata || fallbackMetadata;

  // Process attributes (derived state)
  const processedAttributes = useMemo((): Record<string, string> => {
    const attributes: Record<string, string> = {};

    if (finalMetadata?.attributes && finalMetadata.attributes.length > 0) {
      finalMetadata.attributes.forEach((attr) => {
        if (attr.trait_type && attr.value) {
          attributes[attr.trait_type.toLowerCase()] = attr.value;
        }
      });
    } else {
      // Fallback attributes
      attributes.rarity = 'Common';
    }

    return attributes;
  }, [finalMetadata]);

  // Get image URL with fallbacks (derived state)
  const imageUrl = useMemo((): string => {
    if (dbNft?.imageUrl) {
      return formatIPFSUrl(dbNft.imageUrl);
    }
    if (finalMetadata?.directImageUrl) {
      return finalMetadata.directImageUrl;
    }
    if (finalMetadata?.image) {
      return finalMetadata.image;
    }
    return '';
  }, [dbNft, finalMetadata]);

  // Create NFT history (derived state)
  const nftHistory = useMemo((): HistoryItem[] => {
    if (!dbNft) return [];

    return [
      {
        type: 'Mint',
        from: '0x0000000000000000000000000000000000000000',
        to: dbNft.owner.address,
        date: dbNft.createdAt ? formatDate(dbNft.createdAt) : formatDate(new Date()),
        price: '0.05 ETH', // Default price
      },
    ];
  }, [dbNft]);

  // Convert database NFT to the expected format (derived state)
  const nft = useMemo((): NFTItem | null => {
    if (!dbNft || !collection) return null;

    return {
      name: finalMetadata?.name || dbNft.name,
      description:
        finalMetadata?.description ||
        dbNft.description ||
        `An NFT from the ${collection.name} collection.`,
      type: 'Digital Art',
      creator: collection.owner.address,
      owner: dbNft.owner.address,
      mintDate: dbNft.createdAt ? formatDate(dbNft.createdAt) : formatDate(new Date()),
      tokenId: dbNft.tokenId,
      blockchain: 'Ethereum',
      image: imageUrl,
      attributes: processedAttributes,
      history: nftHistory,
    };
  }, [dbNft, collection, finalMetadata, imageUrl, processedAttributes, nftHistory]);

  // Handle metadata timeout (side effect - keep useEffect)
  useEffect(() => {
    if (isLoadingMetadata) {
      const timeoutId = setTimeout(() => {
        setMetadataTimeout(true);
      }, 5000);

      return () => clearTimeout(timeoutId);
    } else {
      setMetadataTimeout(false);
    }
  }, [isLoadingMetadata]);

  // Calculate loading state
  const isLoading = isLoadingCollection || isLoadingNft || (isLoadingMetadata && !metadataTimeout);

  // Show loading state
  if (isLoading) {
    return <NFTDetailLoading />;
  }

  // Show error states
  if (collectionError || !collection) {
    return <CollectionErrorMessage />;
  }

  if (nftError || !dbNft) {
    return <NFTErrorMessage collectionId={contractAddress} />;
  }

  if (!nft) {
    return <NFTErrorMessage collectionId={contractAddress} />;
  }

  return (
    <ClientNFTDetail
      collectionId={contractAddress}
      nftId={nftId}
      nft={nft}
      collectionName={collection.name}
      placeholderImage={placeholderImage || null}
    />
  );
};
