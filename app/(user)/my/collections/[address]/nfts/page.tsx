import { CollectionNFTsContent } from '@/components/features/user/collections/nfts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collection NFTs | NFT Marketplace',
  description: 'View and manage NFTs in your collection',
};

interface CollectionNFTsPageProps {
  params: {
    address: string;
  };
}

export default function CollectionNFTsPage({ params }: CollectionNFTsPageProps) {
  return <CollectionNFTsContent address={params.address} />;
}
