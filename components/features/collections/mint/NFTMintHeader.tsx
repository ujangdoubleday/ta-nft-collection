'use client';

interface NFTMintHeaderProps {
  collectionName?: string;
  contractAddress: string;
  basePath: string;
}

export function NFTMintHeader({ collectionName = 'Collection' }: NFTMintHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-white mb-2">Mint NFT</h1>
      <p className="text-zinc-400">Create a new NFT in Collection: {collectionName}</p>
      <div className="h-px w-full bg-[#1f1f1f] mt-6"></div>
    </div>
  );
}
