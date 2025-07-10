'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';

interface MintSuccessProps {
  contractAddress: string;
  onMintAnother: () => void;
  basePath: string;
}

export const MintSuccess = ({ contractAddress, onMintAnother, basePath }: MintSuccessProps) => {
  return (
    <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
      <div className="text-center py-12">
        <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-black" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">NFT Minted Successfully!</h2>
        <p className="text-zinc-400 mb-6">
          Your new NFT has been minted and added to your collection.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href={`${basePath}/${contractAddress}/nfts`}
            className="bg-white text-black hover:bg-zinc-200 py-2 px-4 rounded-md transition-colors text-sm font-medium"
          >
            View All NFTs
          </Link>
          <button
            onClick={onMintAnother}
            className="bg-[#0A0A0A] border border-[#1f1f1f] hover:bg-[#1f1f1f] text-white py-2 px-4 rounded-md transition-colors text-sm font-medium"
          >
            Mint Another
          </button>
        </div>
      </div>
    </div>
  );
};
