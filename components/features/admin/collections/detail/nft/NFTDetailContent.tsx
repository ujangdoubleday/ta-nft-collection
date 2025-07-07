'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatIPFSUrl } from '@/lib/utils/helpers/url';
import { trpc } from '@/lib/api/trpc/client';

// Import modular components
import { NFTImageSection } from './NFTImageSection';
import { TokenDetailsSection } from './TokenDetailsSection';
import { OwnershipSection } from './OwnershipSection';
import { HistorySection } from './HistorySection';
import { AttributesSection } from './AttributesSection';
import { TransferDialog } from './TransferDialog';
import { BurnDialog } from './BurnDialog';

// Import types and utils
import { NFTItem, HistoryItem } from './types';
import { formatDate, copyToClipboard } from './utils';

interface NFTDetailContentProps {
  address: string;
  id: string;
}

export function NFTDetailContent({ address, id }: NFTDetailContentProps) {
  // State for dialogs
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isBurnDialogOpen, setIsBurnDialogOpen] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Function to handle copying address with feedback
  const handleCopyAddress = (address: string) => {
    copyToClipboard(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  // Fetch collection metadata URI and collection info from the server using tRPC
  const {
    data: contractData,
    isLoading: isLoadingContract,
    error: contractError,
  } = trpc.collection.getContractURI.useQuery(
    { contractAddress: address as `0x${string}` },
    { enabled: !!address },
  );

  // Extract contractURI and collectionInfo from the combined response
  const contractURI = contractData?.contractURI;
  const collectionInfo = contractData?.collectionInfo;

  // Fetch collection owner using tRPC
  const {
    data: ownerData,
    isLoading: isLoadingCollectionOwner,
    error: ownerError,
  } = trpc.nft.getCollectionOwner.useQuery(
    { collectionAddress: address as `0x${string}` },
    { enabled: !!address },
  );

  const collectionOwner = ownerData?.owner;

  // Fetch collection metadata from IPFS using tRPC
  const {
    data: metadataResult,
    isLoading: isLoadingMetadata,
    error: metadataError,
  } = trpc.collection.fetchProcessedMetadata.useQuery(
    { uri: contractURI as string },
    {
      enabled: !!contractURI,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  );

  // Extract metadata from the response
  const metadata = metadataResult?.metadata;

  // Fetch NFT data using tRPC from blockchain
  const {
    data: alchemyNft,
    isLoading: isLoadingNft,
    error: nftError,
  } = trpc.nft.getRawNFTByTokenId.useQuery(
    { contractAddress: address, tokenId: id },
    {
      enabled: !!address && !!id,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  );

  // Fetch NFT owner from blockchain
  const { data: nftOwnerData, isLoading: isLoadingOwner } = trpc.nft.getNFTOwner.useQuery(
    { contractAddress: address, tokenId: id },
    {
      enabled: !!address && !!id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );

  const nftOwner = nftOwnerData?.owner;

  // Get image URL with fallbacks (derived state)
  const imageUrl = useMemo((): string => {
    if (!alchemyNft) return '';

    if (alchemyNft.raw?.metadata?.image) {
      return formatIPFSUrl(alchemyNft.raw.metadata.image);
    }
    if (alchemyNft.image?.originalUrl) {
      return alchemyNft.image.originalUrl;
    }
    return '';
  }, [alchemyNft]);

  // Process attributes (derived state)
  const processedAttributes = useMemo((): { trait_type: string; value: string }[] => {
    const attributes: { trait_type: string; value: string }[] = [];

    if (alchemyNft?.raw?.metadata?.attributes && alchemyNft.raw.metadata.attributes.length > 0) {
      alchemyNft.raw.metadata.attributes.forEach((attr: any) => {
        if (attr.trait_type && attr.value) {
          attributes.push({
            trait_type: attr.trait_type,
            value: String(attr.value),
          });
        }
      });
    }

    return attributes;
  }, [alchemyNft]);

  // Create NFT history (derived state)
  const nftHistory = useMemo((): HistoryItem[] => {
    if (!alchemyNft || !nftOwner) return [];

    return [
      {
        type: 'Mint',
        from: '0x0000000000000000000000000000000000000000',
        to: nftOwner,
        date: alchemyNft.timeLastUpdated
          ? formatDate(alchemyNft.timeLastUpdated)
          : formatDate(new Date()),
        // Example transaction hash - would come from blockchain data
        txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      },
    ];
  }, [alchemyNft, nftOwner]);

  // Cast collectionInfo to an array type to access numeric indices
  const collectionInfoArray = collectionInfo as unknown as string[];
  const collectionName = metadata?.name || collectionInfoArray?.[2] || 'Unnamed Collection';

  // Convert Alchemy NFT to the expected format (derived state)
  const nft = useMemo((): NFTItem | null => {
    if (!alchemyNft) return null;

    return {
      id: id,
      tokenType: alchemyNft.tokenType,
      tokenId: alchemyNft.tokenId,
      name: alchemyNft.name || `NFT #${alchemyNft.tokenId}`,
      description: alchemyNft.description || `An NFT from the ${collectionName} collection.`,
      imageUrl: imageUrl,
      owner: nftOwner || '0x0000000000000000000000000000000000000000',
      creator: (collectionOwner as string) || '0x0000000000000000000000000000000000000000',
      mintedAt: alchemyNft.timeLastUpdated
        ? new Date(alchemyNft.timeLastUpdated).toISOString()
        : new Date().toISOString(),
      attributes: processedAttributes,
    };
  }, [alchemyNft, collectionName, collectionOwner, imageUrl, processedAttributes, nftOwner, id]);

  // Calculate loading state
  const isLoading =
    isLoadingContract ||
    isLoadingMetadata ||
    isLoadingCollectionOwner ||
    isLoadingNft ||
    isLoadingOwner;

  // Add debug logging for address and token ID
  useEffect(() => {
    if (nft) {
      console.log('NFT data available:', {
        address,
        tokenId: nft.tokenId,
        formattedAddress: address as `0x${string}`,
        isAddressValid: typeof address === 'string' && address.startsWith('0x'),
        isTokenIdValid: typeof nft.tokenId === 'string' && nft.tokenId.length > 0,
      });
    }
  }, [address, nft]);

  if (isLoading) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-[#1f1f1f] rounded w-1/4 mb-4"></div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2 aspect-square bg-[#1f1f1f] rounded"></div>
          <div className="w-full md:w-1/2 space-y-4">
            <div className="h-10 bg-[#1f1f1f] rounded w-3/4"></div>
            <div className="h-20 bg-[#1f1f1f] rounded w-full"></div>
            <div className="h-40 bg-[#1f1f1f] rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        <Link
          href={`/my/collections/${address}/nfts`}
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Collection NFTs
        </Link>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-2">NFT Not Found</h2>
          <p className="text-zinc-400">
            The NFT with ID {id} could not be found in collection {address}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* NFT Image */}
        <NFTImageSection
          nft={nft}
          onTransfer={() => setIsTransferDialogOpen(true)}
          onBurn={() => setIsBurnDialogOpen(true)}
        />

        {/* NFT Details */}
        <div className="w-full md:w-1/2">
          <h1 className="text-2xl font-bold text-white mb-2">{nft.name}</h1>
          <p className="text-zinc-400 mb-6">{nft.description}</p>

          <div className="space-y-4">
            <TokenDetailsSection
              tokenId={nft.tokenId}
              address={address}
              tokenType={nft.tokenType}
            />

            <OwnershipSection
              creator={nft.creator}
              owner={nft.owner}
              copiedAddress={copiedAddress}
              onCopyAddressAction={handleCopyAddress}
            />

            <HistorySection
              contractAddress={address as string}
              tokenId={nft.tokenId as string}
              history={nftHistory}
            />

            <AttributesSection attributes={nft.attributes} />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <TransferDialog
        isOpen={isTransferDialogOpen}
        onCloseAction={() => setIsTransferDialogOpen(false)}
        recipientAddress={recipientAddress}
        onAddressChangeAction={setRecipientAddress}
        contractAddress={address}
        tokenId={nft.tokenId}
        ownerAddress={nft.owner}
      />

      <BurnDialog
        isOpen={isBurnDialogOpen}
        onCloseAction={() => setIsBurnDialogOpen(false)}
        nft={nft}
      />
    </div>
  );
}
