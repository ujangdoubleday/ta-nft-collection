'use client';

import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { LoadingWindow } from '@/components/shared/loading';
import { CreatorCollectionCard } from '@/components/features/collections/collection/list';
import { useWallet } from '@/lib/hooks/wallet';
import { useCollectionInfoByCreator } from '@/lib/blockchain/hooks/useNFTFactoryRead';
import {
  fetchMetadata,
  ipfsToHttp,
  safeParseCollectionInfo,
  EnrichedCollectionInfo,
} from '@/lib/blockchain/utils/collection';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface CreatorCollectionGalleryProps {
  // Props can be added if needed
}

export function CreatorCollectionGallery({}: CreatorCollectionGalleryProps) {
  const { address } = useWallet();
  const router = useRouter();

  const {
    data: rawCollections,
    isLoading: isLoadingCollections,
    error: collectionError,
    refetch,
  } = useCollectionInfoByCreator(address as `0x${string}`, {
    // Enable automatic refetching
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  const [collections, setCollections] = useState<EnrichedCollectionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [renderError, setRenderError] = useState<Error | null>(null);

  // Manual refresh function
  const refreshCollections = useCallback(async () => {
    try {
      // Call the revalidation API
      const revalidateResponse = await fetch('/api/revalidate?path=/collections');
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

  // Process raw collections data and fetch metadata
  useEffect(() => {
    const processCollections = async () => {
      if (!rawCollections) return;

      try {
        setIsLoading(true);

        // Parse the raw collections data
        const parsedCollections = Array.isArray(rawCollections)
          ? rawCollections.map((info) => safeParseCollectionInfo(info)).filter(Boolean)
          : [];

        // Fetch metadata for each collection
        const enrichedCollections = await Promise.all(
          parsedCollections.map(async (collection) => {
            if (!collection) return null;

            const metadata = await fetchMetadata(collection.contractURI);

            // Process the image URL if it exists
            const imageUrl = metadata.image
              ? ipfsToHttp(metadata.image)
              : '/assets/images/placeholders/image-placeholder.svg';

            return {
              ...collection,
              metadata,
              imageUrl,
            } as EnrichedCollectionInfo;
          }),
        );

        // Filter out null values and sort by creation time (newest first)
        const validCollections = enrichedCollections.filter(
          (c): c is EnrichedCollectionInfo => c !== null,
        );

        // Sort collections by createdAt timestamp (newest first)
        const sortedCollections = validCollections.sort((a, b) => {
          // Convert BigInt to number for comparison (safe for timestamps)
          const timeA = Number(a.createdAt);
          const timeB = Number(b.createdAt);
          return timeB - timeA; // Descending order (newest first)
        });

        setCollections(sortedCollections);
      } catch (err) {
        console.error('Error processing collections:', err);
        setError(err instanceof Error ? err : new Error('Failed to process collections'));
      } finally {
        setIsLoading(false);
      }
    };

    if (rawCollections) {
      processCollections();
    } else if (!isLoadingCollections) {
      setIsLoading(false);
    }
  }, [rawCollections, isLoadingCollections]);

  // Show loading state
  if (isLoading || isLoadingCollections) {
    return (
      <LoadingWindow
        title="Loading Your Created Collections"
        text="Fetching collections you've created..."
        icon="/assets/icons/window/gallery-create.png"
      />
    );
  }

  // Show error state
  if (error || collectionError || renderError) {
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
            {(error || collectionError || renderError)?.message || 'Please try again later.'}
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
            {collections.map((collection, index) => {
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
