import { Suspense } from 'react';
import { CollectionsPage } from '@/components/features/collections/collection';
import { LoadingWindow } from '@/components/shared/loading';
import { Container } from '@/components/core/layout';
import { Metadata } from 'next';

// Set shorter revalidation time for more frequent updates
export const revalidate = 20;

// Add cache tags for more granular revalidation
export const dynamic = 'force-dynamic';

export default function MyCollectionsPage() {
  return (
    <>
      <Suspense
        fallback={
          <main className="py-4">
            <Container>
              <LoadingWindow
                title="Loading Collections"
                text="Fetching your collections..."
                icon="/assets/icons/window/gallery.png"
              />
            </Container>
          </main>
        }
      >
        <CollectionsPage />
      </Suspense>
    </>
  );
}
