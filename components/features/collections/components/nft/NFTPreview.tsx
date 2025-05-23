"use client";

interface NFTPreviewProps {
  name: string;
  description: string;
  image: string;
}

export function NFTPreview({ name, description, image }: NFTPreviewProps) {
  return (
    <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4 mb-4">
      <div className="win98-bar h-6 flex items-center px-2 mb-3">
        <span className="text-white text-xs font-semibold tracking-tight">
          NFT Preview
        </span>
      </div>

      <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white mb-3 p-2">
        <div className="relative" style={{ aspectRatio: "1/1" }}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <h3 className="text-black font-bold text-sm mb-1">{name}</h3>
      <p className="text-black text-xs">{description}</p>
    </div>
  );
}
