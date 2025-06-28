'use client';

import { Win98Window } from '@/components/ui/organisms/Win98Window';
import Image from 'next/image';

export function HeroSection() {
  return (
    <Win98Window
      title="MyNFTs.exe: Digital Art Creator"
      icon="/assets/icons/window/nft-art.png"
      className="mb-4"
    >
      <div className="space-y-4 text-black p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2 text-[#0000AA]">Welcome to MyNFTs.exe</h1>
            <h2 className="text-lg font-bold">Create, Mint & Own Digital Masterpieces</h2>
            <p className="text-sm my-4">
              Express your creativity through digital art on the blockchain. Create unique
              collectibles, build your portfolio, and own exclusive digital assets with our
              retro-inspired platform.
            </p>
          </div>
          <div className="flex-shrink-0 w-40 h-40 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] flex items-center justify-center">
            <Image
              src="/assets/icons/window/nft-art.png"
              alt="NFT Illustration"
              width={500}
              height={500}
              className="w-32 h-32 object-contain"
            />
          </div>
        </div>
      </div>
    </Win98Window>
  );
}
