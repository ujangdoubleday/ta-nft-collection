import { CollectionDetailContent } from '@/components/features/user/collections/detail';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collection Details | NFT Marketplace',
  description: 'View and manage your NFT collection details',
};

interface CollectionDetailPageProps {
  params: {
    address: string;
  };
}

export default function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  return <CollectionDetailContent address={params.address} />;
}
