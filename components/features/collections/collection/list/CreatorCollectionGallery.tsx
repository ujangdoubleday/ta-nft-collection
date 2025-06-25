'use client';

import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { LoadingWindow } from '@/components/shared/loading';
import { CreatorCollectionCard } from '@/components/features/collections/collection/list';
import { useWallet } from '@/lib/hooks/wallet';
import { EnrichedCollectionInfo } from '@/lib/blockchain/utils/collection';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/api/trpc/client';

interface CreatorCollectionGalleryProps {
  // Props can be added if needed
}

export function CreatorCollectionGallery({}: CreatorCollectionGalleryProps) {
  const { address } = useWallet();
  const router = useRouter();
  const [renderError, setRenderError] = useState<Error | null>(null);

  // Opsi 1: Gunakan enriched collections (dengan metadata langsung dari tRPC)
  const {
    data: collections,
    isLoading,
    error,
    refetch,
  } = trpc.collection.getEnrichedCreatorCollections.useQuery(
    { creatorAddress: address || '' },
    {
      enabled: !!address,
      refetchInterval: 30000, // Refetch every 30 seconds
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  );

  // Manual refresh function
  const refreshCollections = useCallback(async () => {
    try {
      // Call the revalidation API
      const revalidateResponse = await fetch('/api/revalidate?tag=collections');
      if (!revalidateResponse.ok) {
        console.error('Failed to revalidate collections page');
      }
    } catch (error) {
      console.error('Error revalidating collections page:', error);
    }

    // Refetch data
    refetch();

    // Force client-side refresh
    router.refresh();
  }, [refetch, router]);

  // Show loading state
  if (isLoading) {
    return (
      <LoadingWindow
        title="Loading Your Created Collections"
        text="Fetching collections and metadata..."
        icon="/assets/icons/window/gallery-create.png"
      />
    );
  }

  // Show error state
  if (error || renderError) {
    return (
      <Win98Window
        title="Error Loading Collections"
        icon="/assets/icons/window/error.png"
        className="mb-4"
      >
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
          <p className="text-center text-red-600">
            An error occurred while {renderError ? 'rendering' : 'loading'} your collections.
          </p>
          <p className="text-center mt-2">
            {(error || renderError)?.message || 'Please try again later.'}
          </p>
          <button
            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 border border-gray-400"
            onClick={refreshCollections}
          >
            Refresh Collections
          </button>
        </div>
      </Win98Window>
    );
  }

  // Safe rendering with try-catch
  try {
    return (
      <Win98Window
        title="My Created Collections"
        icon="/assets/icons/window/gallery-create.png"
        className="mb-4"
      >
        <div className="p-3 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-lg">Your Collections</h2>
          <button
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 border border-gray-400 text-sm"
            onClick={refreshCollections}
          >
            Refresh
          </button>
        </div>

        {!collections || !Array.isArray(collections) || collections.length === 0 ? (
          <div className="p-6">
            <p className="text-center">You haven&apos;t created any collections yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 p-3">
            {collections.map((collection: EnrichedCollectionInfo, index: number) => {
              return (
                <CreatorCollectionCard
                  key={`creator-collection-${collection?.collectionAddress || index}`}
                  collection={collection}
                />
              );
            })}
          </div>
        )}
      </Win98Window>
    );
  } catch (err) {
    console.error('Error rendering collections gallery:', err);
    setRenderError(err instanceof Error ? err : new Error('Unknown rendering error'));

    // Show a simple loading message while we update the state
    return (
      <LoadingWindow
        title="Error Rendering Collections"
        text="An error occurred. Retrying..."
        icon="/assets/icons/window/error.png"
      />
    );
  }
}
