'use client';

import { CollectionItem } from '@/components/features/collections/types';
import { NextImage } from '@/components/shared/icons';

interface CollectionItemCardProps {
  item: CollectionItem;
  onViewDetails: (itemId: string) => void;
}

export function CollectionItemCard({ item, onViewDetails }: CollectionItemCardProps) {
  return (
    <div
      key={item.id}
      className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-2 hover:shadow-md"
    >
      <div className="flex justify-between items-center mb-2">
        <div className="text-black text-sm font-bold truncate pr-2">{item.name}</div>
      </div>

      <div
        className="bg-white mb-2 cursor-pointer overflow-hidden relative transition-all duration-200 hover:opacity-90 hover:shadow-md"
        style={{
          aspectRatio: '1/1',
          width: '100%',
          position: 'relative',
        }}
        onClick={() => onViewDetails(item.id)}
      >
        <NextImage
          src={item.image}
          alt={item.name}
          fill={true}
          sizes="(max-width: 768px) 100vw, 300px"
          placeholderType="win98"
          className="object-cover"
        />
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
