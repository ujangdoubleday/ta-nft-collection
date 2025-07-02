import { NFTMintContent } from '@/components/features/user/collections/mint';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mint NFT | NFT Marketplace',
  description: 'Mint a new NFT in your collection',
};

interface NFTMintPageProps {
  params: {
    address: string;
  };
}

export default function NFTMintPage({ params }: NFTMintPageProps) {
  return <NFTMintContent address={params.address} />;
}
