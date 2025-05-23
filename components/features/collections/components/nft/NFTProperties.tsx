"use client";

interface NFTPropertiesProps {
  attributes: Record<string, string>;
}

export function NFTProperties({ attributes }: NFTPropertiesProps) {
  return (
    <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4">
      <div className="win98-bar h-6 flex items-center px-2 mb-3">
        <span className="text-white text-xs font-semibold tracking-tight">
          Properties
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {Object.entries(attributes).map(([key, value]) => (
          <div
            key={key}
            className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-2 hover:bg-[#d0d0d0]"
          >
            <p className="text-black text-xs uppercase">{key}</p>
            <p className="text-black text-xs font-bold">{value as string}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
