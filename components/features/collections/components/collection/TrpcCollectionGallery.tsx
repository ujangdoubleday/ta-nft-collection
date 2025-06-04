'use client';

import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { Win98Spinner } from '@/components/ui/organisms/Win98Spinner';
import {
  CollectionCard,
  EmptyCollectionMessage,
} from '@/components/features/collections/components/collection';
import { useAllCollections } from '../../hooks';

interface TrpcCollectionGalleryProps {
  // Props can be added if needed
}

export function TrpcCollectionGallery({}: TrpcCollectionGalleryProps) {
  const { collections, isLoading, error } = useAllCollections();

  // Show loading state
  if (isLoading) {
    return (
      <Win98Window
        title="Loading Collections"
        icon="/assets/icons/window/gallery.png"
        className="mb-4"
      >
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <Win98Spinner />
          <p className="text-center mt-4">Loading collections...</p>
        </div>
      </Win98Window>
    );
  }

  // Show error state
  if (error) {
    return (
      <Win98Window
        title="Error Loading Collections"
        icon="/assets/icons/window/error.png"
        className="mb-4"
      >
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
          <p className="text-center text-red-600">An error occurred while loading collections.</p>
          <p className="text-center mt-2">Please try again later.</p>
        </div>
      </Win98Window>
    );
  }

  return (
    <Win98Window
      title="Your Digital Gallery"
      icon="/assets/icons/window/gallery.png"
      className="mb-4"
    >
      {collections.length === 0 ? (
        <EmptyCollectionMessage />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              id={collection.contractAddress} // Use contract address as ID for routing
              name={collection.name}
              description={collection.description || ''}
              // Use placeholder count and thumbnail for now
              // In a real implementation, these would come from the blockchain or a separate table
              count={8}
              thumbnail={`/assets/images/nfts/pixel-art/pixel-${Math.floor(Math.random() * 2) + 1}.jpg`}
            />
          ))}
        </div>
      )}
    </Win98Window>
  );
}
