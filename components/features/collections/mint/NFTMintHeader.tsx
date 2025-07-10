'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { shortenAddress } from '@/lib/utils/formatting';

interface NFTMintHeaderProps {
  collectionName?: string;
  contractAddress: string;
  basePath: string;
}

export function NFTMintHeader({
  collectionName = 'Collection',
  contractAddress,
  basePath,
}: NFTMintHeaderProps) {
  return (
    <div className="mb-6">
      <Link
        href={`${basePath}/${contractAddress}`}
        className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-sm mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Collection
      </Link>
      <h1 className="text-2xl font-bold text-white mb-2">
        Mint NFT to {collectionName} ({shortenAddress(contractAddress)})
      </h1>
      <p className="text-zinc-400">Create a new NFT in your collection</p>
      <div className="h-px w-full bg-[#1f1f1f] mt-6"></div>
    </div>
  );
}
