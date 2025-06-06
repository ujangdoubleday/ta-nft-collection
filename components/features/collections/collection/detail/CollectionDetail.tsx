'use client';

import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { useRouter } from 'next/navigation';
import { Collection } from '@/components/features/collections/types';
import {
  CollectionHeader,
  CollectionItemCard,
} from '@/components/features/collections/collection/detail';
import { EmptyCollectionContent } from '@/components/features/collections/collection/empty';

interface CollectionDetailProps {
  collectionId: string;
  collection: Collection;
}

export function CollectionDetail({ collectionId, collection }: CollectionDetailProps) {
  const router = useRouter();

  const handleAddNewClick = () => {
    router.push(`/collections/${collectionId}/mint`);
  };

  const handleViewDetails = (itemId: string) => {
    router.push(`/collections/${collectionId}/${itemId}`);
  };

  return (
    <Win98Window
      title={`Collection: ${collection.name}`}
      icon="/assets/icons/window/gallery.png"
      className="max-w-12xl mx-auto"
    >
      <div className="p-4">
        <CollectionHeader description={collection.description} />

        {collection.items.length === 0 ? (
          <EmptyCollectionContent onAddNew={handleAddNewClick} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collection.items.map((item) => (
              <CollectionItemCard key={item.id} item={item} onViewDetails={handleViewDetails} />
            ))}
          </div>
        )}
      </div>
    </Win98Window>
  );
}
