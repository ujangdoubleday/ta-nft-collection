'use client';

import { Send } from 'lucide-react';

interface NFTMintHeaderProps {
  collectionName?: string;
  NFTid: string;
  isOwner: boolean;
  onTransfer: () => void;
}

export function NFTMintHeader({
  collectionName = 'Collection',
  NFTid,
  isOwner,
  onTransfer,
}: NFTMintHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Detail NFT</h1>
          <p className="text-zinc-400">
            Detail NFT of {collectionName} - #{NFTid}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <div className="flex justify-center mt-4 gap-2">
              <button
                className="bg-white text-black hover:bg-zinc-200 py-2 px-3 rounded-md transition-colors text-sm font-medium flex items-center gap-2"
                onClick={() => onTransfer()}
              >
                <Send className="h-4 w-4" />
                Transfer This NFT
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="h-px w-full bg-[#1f1f1f] mt-6"></div>
    </div>
  );
}
