import { NFTsContent } from '@/components/features/nfts';
import { Suspense } from 'react';

export default function AdminNFTsPage() {
  return (
    <Suspense>
      <NFTsContent role="admin" />
    </Suspense>
  );
}
