import { CollectionsPage } from '@/components/features/collections/collection';

// Set shorter revalidation time for more frequent updates
export const revalidate = 30;

// Add cache tags for more granular revalidation
export const dynamic = 'force-dynamic';

export default function MyCollectionsPage() {
  return (
    <>
      <CollectionsPage />
    </>
  );
}
