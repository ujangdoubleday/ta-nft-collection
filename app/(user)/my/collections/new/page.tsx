import { NewCollectionContent } from '@/components/features/user/collections/new';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Collection | NFT Marketplace',
  description: 'Create a new NFT collection',
};

export default function NewCollectionPage() {
  return <NewCollectionContent />;
}
