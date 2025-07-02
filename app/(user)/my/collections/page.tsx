import { UserCollectionsContent } from '@/components/features/user/collections';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Collections | NFT Marketplace',
  description: 'View and manage your NFT collections',
};

export default function UserCollectionsPage() {
  return <UserCollectionsContent />;
}
