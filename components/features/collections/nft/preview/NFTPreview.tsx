'use client';

import { useState } from 'react';
import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { NextImage } from '@/components/shared/media';

interface NFTPreviewProps {
  title: string;
  description: string;
  image: string;
  placeholderImage?: string | null;
  properties?: Array<{
    name: string;
    value: string;
  }>;
}

export function NFTPreview({
  title,
  description,
  image,
  placeholderImage,
  properties = [],
}: NFTPreviewProps) {
  const [imageError, setImageError] = useState(false);

  // Handle image error
  const handleImageError = () => {
    console.error(`NFTPreview - Failed to load image: ${image}`);
    setImageError(true);
  };

  const placeholder = `/api/placeholder?url=${placeholderImage}`;

  return (
    <Win98Window title="NFT Preview" icon="/assets/icons/window/gallery.png" className="mb-3">
      <div className="bg-black mb-3 relative w-full" style={{ aspectRatio: '1/1' }}>
        {image ? (
          <NextImage
            src={imageError ? '' : image}
            alt={title}
            fill={true}
            sizes="(max-width: 768px) 90vw, 500px"
            className="object-contain"
            onError={handleImageError}
            unoptimized={true}
            placeholderType="blur"
            blurDataURL={placeholder || ''}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white text-sm">No image available</span>
          </div>
        )}
      </div>

      <h3 className="text-black font-bold text-base mb-2">{title}</h3>
      <p className="text-black text-sm mb-2 max-h-[80px] overflow-y-auto">{description}</p>

      {properties && properties.length > 0 && (
        <div className="mt-2">
          <h4 className="text-black font-bold text-xs mb-1">Properties:</h4>
          <div className="grid grid-cols-2 gap-1">
            {properties.map((prop, index) =>
              prop.name && prop.value ? (
                <div key={index} className="bg-[#e0e0e0] border border-[#808080] p-1 text-center">
                  <p className="text-[10px] uppercase text-[#0000aa] font-bold">{prop.name}</p>
                  <p className="text-[11px]">{prop.value}</p>
                </div>
              ) : null,
            )}
          </div>
        </div>
      )}
    </Win98Window>
  );
}
