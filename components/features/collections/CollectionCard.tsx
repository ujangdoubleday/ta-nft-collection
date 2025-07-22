'use client';

import Link from 'next/link';
import { Edit, MoreHorizontal, ExternalLink, ImagePlus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { shortenAddress } from '@/lib/utils/formatting';
import { useAddress } from '@/lib/hooks/use-address';
import { trpc } from '@/lib/api/trpc/client';
import { NextImage } from '@/components/shared/NextImage';

interface CollectionCardProps {
  collection: {
    id: string;
    address: string;
    name: string;
    description: string;
    imageUrl: string;
    itemCount: number;
    createdAt: string;
    symbol: string;
  };
  role?: 'admin' | 'user'; // Add role prop to determine link paths
  isOwner?: boolean; // Pre-determined ownership status
  ownerLoaded?: boolean; // Whether ownership data is loaded
}

export function CollectionCard({
  collection,
  role = 'user',
  isOwner: preDeterminedOwnership,
  ownerLoaded: ownershipPreloaded = false,
}: CollectionCardProps) {
  const { data: userAddress } = useAddress();
  const [isOwner, setIsOwner] = useState<boolean>(preDeterminedOwnership || false);
  const [isLoading, setIsLoading] = useState<boolean>(!ownershipPreloaded);

  // Only fetch if ownership wasn't pre-determined
  const { data: ownerData } = trpc.collection.getCollectionOwner.useQuery(
    { collectionAddress: collection.address },
    {
      enabled: !!collection.address && !ownershipPreloaded,
    },
  );

  // const image = `https://${collection.imageUrl}`;

  // Check if user is owner whenever ownerData or userAddress changes
  useEffect(() => {
    // If ownership is pre-determined, use that value
    if (ownershipPreloaded) {
      setIsOwner(!!preDeterminedOwnership);
      setIsLoading(false);
      return;
    }

    // Otherwise, determine ownership from query
    if (ownerData && userAddress) {
      setIsOwner(ownerData.toLowerCase() === userAddress.toLowerCase());
    } else {
      setIsOwner(false);
    }
    setIsLoading(false);
  }, [ownerData, userAddress, preDeterminedOwnership, ownershipPreloaded]);

  // Format creation date
  const formattedDate = (() => {
    try {
      return new Date(collection.createdAt).toLocaleDateString();
    } catch (e) {
      return 'Unknown date';
    }
  })();

  // Determine the base path based on role
  const basePath = role === 'admin' ? '/admin/collections' : '/user/collections';

  return (
    <>
      <Link href={`${basePath}/${collection.address}`} className="">
        <div className="group bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg overflow-hidden hover:bg-zinc-900 hover:border-zinc-600 duration-300 shadow-sm hover:shadow-md transition-all p-3 sm:p-4">
          <div className="flex gap-3 sm:gap-4">
            {/* Collection Image - Left Side */}
            <div className="flex-shrink-0">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-[#0A0A0A] rounded-lg overflow-hidden">
                {collection.imageUrl ? (
                  <NextImage
                    src={collection.imageUrl}
                    alt={collection.name}
                    fill
                    sizes="(max-width: 640px) 64px, 80px"
                    className="object-cover"
                    fallbackSrc="/assets/images/placeholders/placeholder_loading.gif"
                    placeholderType="blur"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A]">
                    <ImagePlus className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Collection Info - Right Side */}
            <div className="flex-grow min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-1 gap-1">
                <h3 className="font-bold text-sm sm:text-base text-white hover:text-zinc-300 transition-colors break-words pr-2 max-w-full">
                  {collection.name || 'Unnamed Collection'}
                </h3>

                {isLoading ? (
                  <div className="flex-shrink-0 h-3 sm:h-4 bg-[#1f1f1f] rounded w-16 sm:w-20 animate-pulse"></div>
                ) : (
                  <span
                    className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0 ${isOwner ? 'bg-green-900 text-green-200' : 'bg-[#1f1f1f] text-white'}`}
                  >
                    {isOwner ? 'You are the owner' : 'You are not the owner'}
                  </span>
                )}
              </div>

              <p className="text-zinc-400 text-xs sm:text-sm mb-1 sm:mb-2 break-words line-clamp-2">
                {collection.description || 'No description available'}
              </p>

              <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                <span title={collection.address} className="flex-shrink-0 text-[10px] sm:text-xs">
                  {shortenAddress(collection.address, 6)}
                </span>
                <span className="flex-shrink-0 text-[10px] sm:text-xs">
                  Created {formattedDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}
