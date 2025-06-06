'use client';

import { CollectionItem } from '@/components/features/collections/types';
import { NextImage } from '@/components/shared/icons';
import { InlineLoading } from '@/components/shared/loading';
import { useState, useEffect } from 'react';

interface CollectionItemCardProps {
  item: CollectionItem;
  onViewDetails: (itemId: string) => void;
}

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
        text="Loading image"
        spinnerSize="small"
        direction="column"
        className="bg-black bg-opacity-50 p-2 rounded"
      />
    </div>
  );
};

export function CollectionItemCard({ item, onViewDetails }: CollectionItemCardProps) {
  const [imageError, setImageError] = useState(false);
  const [placeholder, setPlaceholder] = useState<string | undefined>(undefined);
  const [imageLoaded, setImageLoaded] = useState(false);

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

  return (
    <div
      key={item.id}
      className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-2 hover:shadow-md"
    >
      <div className="flex justify-between items-center mb-2">
        <div className="text-black text-sm font-bold truncate pr-2">{item.name}</div>
      </div>

      <div
        className="bg-black mb-2 cursor-pointer overflow-hidden relative transition-all duration-200 hover:opacity-90 hover:shadow-md"
        style={{
          aspectRatio: '1/1',
          width: '100%',
        }}
        onClick={() => onViewDetails(item.id)}
      >
        {item.image && !imageError ? (
          <>
            {!imageLoaded && <ImagePlaceholder placeholder={placeholder} />}
            <NextImage
              src={item.image}
              alt={item.name}
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

      <div className="flex justify-between items-center mb-2">
        <div className="text-black text-xs bg-[#efefef] px-1 border border-[#808080] rounded-sm">
          {item.attributes?.rarity || item.attributes?.era || item.attributes?.complexity || ''}
        </div>
        <div className="text-black text-xs">Created by: You</div>
      </div>

      <div className="border border-[#808080] bg-[#f0f0f0] p-1 mb-2 text-[10px]">
        {item.attributes &&
          Object.entries(item.attributes).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="font-bold">{key}:</span>
              <span>{value as string}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
