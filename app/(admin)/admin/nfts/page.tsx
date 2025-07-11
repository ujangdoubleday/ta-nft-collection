import { NFTsContent } from '@/components/features/nfts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - NFT Gallery',
  description: 'View and manage all NFTs across collections',
};

export default function AdminNFTsPage() {
  return <NFTsContent role="admin" />;
}
