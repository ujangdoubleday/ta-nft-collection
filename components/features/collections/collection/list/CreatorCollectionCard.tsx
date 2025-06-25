'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { EnrichedCollectionInfo } from '@/lib/blockchain/utils/collection';
import { useWallet } from '@/lib/hooks/wallet';
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/api/trpc/client';

interface CreatorCollectionCardProps {
  collection: EnrichedCollectionInfo;
}

export function CreatorCollectionCard({ collection }: CreatorCollectionCardProps) {
  const { address } = useWallet();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);

  const { data: ownerData, isLoading: isLoadingOwner } =
    trpc.collection.getCollectionOwner.useQuery(
      { collectionAddress: collection?.collectionAddress as string },
      {
        enabled: !!collection?.collectionAddress,
        refetchInterval: 30000, // Refetch every 30 seconds
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
      },
    );

  // Check if the current user is the owner
  useEffect(() => {
    if (!address || !ownerData) return;

    const isCurrentOwner = ownerData.toLowerCase() === address.toLowerCase();
    setIsOwner(isCurrentOwner);
  }, [address, ownerData]);

  // Use try-catch for all property access to prevent rendering errors
  try {
    // Get collection name from metadata or fallback to contract name
    const name = collection?.metadata?.name || collection?.name || 'Unnamed Collection';

    // Handle potentially undefined totalSupply
    const totalSupply = collection?.totalSupply ? collection.totalSupply.toString() : '0';

    // Get collection description from metadata or create a fallback
    const description =
      collection?.metadata?.description ||
      `Symbol: ${collection?.symbol || 'UNKNOWN'} | Total Supply: ${totalSupply}`;

    // Format creation date with null check
    const createdAt = collection?.createdAt ? Number(collection.createdAt) * 1000 : Date.now();
    const createdDate = new Date(createdAt);
    const formattedDate = createdDate.toLocaleDateString();
    const formattedTime = createdDate.toLocaleTimeString();
    const fullFormattedDate = `${formattedDate} ${formattedTime}`;

    // Check if collection is new (less than 24 hours old)
    const isNew = Date.now() - createdAt < 24 * 60 * 60 * 1000;

    // Get image URL with fallback - now this should be processed by tRPC
    const imageUrl = collection?.imageUrl || '/assets/images/placeholders/image-placeholder.svg';

    // Check if metadata is missing (for debugging/UX)
    const hasMetadata = collection?.metadata && Object.keys(collection.metadata).length > 0;

    return (
      <Link href={`/collections/${collection?.collectionAddress || '#'}`}>
        <Win98Window
          title={name}
          icon="/assets/icons/window/nft.png"
          className="cursor-pointer h-full transition-transform hover:scale-[1.01] hover:shadow-lg"
        >
          <div className="p-3">
            <div className="flex flex-row">
              {/* Collection Image (Left) */}
              <div className="relative w-32 h-32 bg-gray-100 overflow-hidden flex-shrink-0">
                <Image
                  src={imageUrl}
                  alt={name}
                  fill
                  sizes="128px"
                  className="object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    (e.target as HTMLImageElement).src =
                      '/assets/images/placeholders/image-placeholder.svg';
                  }}
                />
              </div>

              {/* Collection Info (Right) */}
              <div className="ml-4 flex-grow overflow-hidden">
                <div className="flex items-center">
                  <h3 className="text-lg font-bold mb-1 truncate">{name}</h3>
                  {isNew && (
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      NEW
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {collection?.collectionAddress
                    ? `${collection.collectionAddress.substring(0, 6)}...${collection.collectionAddress.substring(collection.collectionAddress.length - 4)}`
                    : 'Unknown Address'}
                </div>
                <p className="text-sm mb-2 line-clamp-3 break-words overflow-hidden">
                  {description}
                </p>

                {/* Show warning if metadata is missing */}
                {!hasMetadata && (
                  <p className="text-xs text-yellow-600 mb-2">⚠️ Metadata not loaded</p>
                )}
              </div>
            </div>

            {/* Tags at bottom */}
            <div className="flex flex-wrap gap-2 text-xs mt-3 pt-2 border-t border-gray-200">
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                Symbol: {collection?.symbol || 'UNKNOWN'}
              </span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                Supply: {totalSupply}
              </span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                Created: {fullFormattedDate}
              </span>

              {/* Ownership status */}
              {isLoadingOwner ? (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Checking ownership...
                </span>
              ) : isOwner === true ? (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  You are the owner
                </span>
              ) : isOwner === false ? (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                  Ownership renounced
                </span>
              ) : null}
            </div>
          </div>
        </Win98Window>
      </Link>
    );
  } catch (error) {
    // If there's any error in rendering, show a simple fallback
    console.error('Error rendering collection card:', error);
    return (
      <Win98Window
        title="Collection Card Error"
        icon="/assets/icons/window/error.png"
        className="cursor-pointer h-full"
      >
        <div className="p-4 text-center">
          <p>There was an error displaying this collection.</p>
          <p className="text-xs text-gray-500 mt-2">
            {collection?.collectionAddress || 'Unknown collection'}
          </p>
        </div>
      </Win98Window>
    );
  }
}
