'use client';

import { CollectionItem } from '@/components/features/collections/types';
import { NextImage } from '@/components/shared/media';
import { InlineLoading } from '@/components/shared/loading';
import { useState, useEffect } from 'react';
import { useNFTOwner } from '@/lib/blockchain/hooks/useAlchemyNFTs';
import { useWallet } from '@/lib/hooks/wallet';

interface CollectionItemCardProps {
  item: CollectionItem;
  onViewDetailsAction: (itemId: string) => void;
}

// Format address for display
const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Image placeholder component
const ImagePlaceholder = ({ placeholder }: { placeholder?: string }) => {
  return (
    <div
      className="w-full h-full flex items-center justify-center bg-gray-200"
      style={{
        backgroundImage: placeholder ? `url(${placeholder})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(4px)',
      }}
    >
      <InlineLoading
        // text="Loading image"
        spinnerSize="small"
        direction="column"
        className="bg-black bg-opacity-50 p-2 rounded"
      />
    </div>
  );
};

export function CollectionItemCard({ item, onViewDetailsAction }: CollectionItemCardProps) {
  const [imageError, setImageError] = useState(false);
  const [placeholder, setPlaceholder] = useState<string | undefined>(undefined);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { address } = useWallet();
  const { owner: nftOwner, isLoading: isLoadingOwner } = useNFTOwner(
    item.contractAddress,
    item.tokenId,
  );

  // Generate placeholder URL for the API
  useEffect(() => {
    if (item.placeholder) {
      // Use the placeholder provided by the item
      setPlaceholder(item.placeholder);
    } else if (item.blurhash) {
      // Use the blurhash provided by the item
      setPlaceholder(item.blurhash);
    } else if (item.image) {
      // Use the API route with the image URL as parameter
      const encodedUrl = encodeURIComponent(item.image);
      setPlaceholder(`/api/placeholder?url=${encodedUrl}`);
    } else if (item.id) {
      // Fallback to using ID if no image URL
      setPlaceholder(`/api/placeholder?id=${item.id}`);
    }
  }, [item.image, item.id, item.placeholder, item.blurhash]);

  // Handle image error
  const handleImageError = () => {
    console.error(`Failed to load image: ${item.image}`);
    setImageError(true);
  };

  // Handle image load
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Determine if current user is the owner
  const isOwner = address && nftOwner && address.toLowerCase() === nftOwner.toLowerCase();

  return (
    <div
      key={item.id}
      className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-1 hover:shadow-md"
    >
      <div
        className="bg-black mb-2 cursor-pointer overflow-hidden relative transition-all duration-200 hover:opacity-90 hover:shadow-md"
        style={{
          aspectRatio: '1/1',
          width: '100%',
        }}
        onClick={() => onViewDetailsAction(item.id)}
      >
        {item.image && !imageError ? (
          <>
            {!imageLoaded && <ImagePlaceholder placeholder={placeholder} />}
            <NextImage
              src={item.image}
              alt={item.name || ''}
              fill={true}
              sizes="(max-width: 768px) 100vw, 300px"
              className={`object-contain transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              placeholderType="blur"
              blurDataURL={placeholder}
              onError={handleImageError}
              onLoad={handleImageLoad}
              unoptimized={true} // Disable Next.js image optimization for external URLs
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white text-sm">No image available</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 text-xs opacity-0 hover:opacity-100 transition-opacity z-10">
          View Details
        </div>
      </div>

      {/* Windows 98 style owner info bar */}
      <div className="mb-1">
        <div className="flex items-center">
          <div className="bg-[#000080] text-white px-2 py-0.5 text-xs font-bold flex items-center">
            <img src="/assets/icons/window/info.png" alt="Owner" className="w-3 h-3 mr-1" />
            <span>Owner</span>
          </div>
        </div>
        <div className="border border-[#808080] border-t-white border-l-white bg-[#efefef] p-1.5 text-xs flex justify-between items-center">
          {isLoadingOwner ? (
            <div className="flex items-center">
              <div className="win98-progress-bar w-4 h-3 mr-1.5"></div>
              <span className="text-gray-700">Loading owner...</span>
            </div>
          ) : !nftOwner ? (
            <span className="text-gray-700">Unknown owner</span>
          ) : (
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-1.5 ${isOwner ? 'bg-green-600' : 'bg-gray-500'}`}
              ></div>
              <span className="font-mono">
                {formatAddress(nftOwner)}
                {isOwner && (
                  <span className="ml-1 bg-[#000080] text-white px-1 text-[10px] rounded">YOU</span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
