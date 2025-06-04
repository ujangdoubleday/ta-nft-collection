'use client';

import { Win98Window } from '@/components/ui/organisms/Win98Window';

interface NFTPropertiesProps {
  attributes: Record<string, string>;
}

export function NFTProperties({ attributes }: NFTPropertiesProps) {
  return (
    <Win98Window title="Properties" icon="/assets/icons/window/gallery.png" className="mb-3">
      <div className="grid grid-cols-2 gap-1 max-h-[180px] overflow-y-auto p-1">
        {Object.entries(attributes).map(([key, value]) => (
          <div
            key={key}
            className="bg-[#c0c0c0] border-[1px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-1 hover:bg-[#d0d0d0]"
          >
            <p className="text-black text-xs uppercase">{key}</p>
            <p className="text-black text-sm font-bold truncate">{value as string}</p>
          </div>
        ))}
      </div>
    </Win98Window>
  );
}
