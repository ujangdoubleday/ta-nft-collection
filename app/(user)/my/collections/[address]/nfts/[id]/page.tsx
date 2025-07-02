import { NFTDetailContent } from '@/components/features/user/collections/detail/nft';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NFT Details | NFT Marketplace',
  description: 'View details of your NFT',
};

interface NFTDetailPageProps {
  params: {
    address: string;
    id: string;
  };
}

export default function NFTDetailPage({ params }: NFTDetailPageProps) {
  return <NFTDetailContent address={params.address} id={params.id} />;
}
