'use client';

import { Win98Window } from '@/components/ui/win98';
import { useRouter } from 'next/navigation';
import { Collection } from '@/components/features/collections/types';
import {
  CollectionHeader,
  EmptyCollectionContent,
  CollectionItemCard,
  AddNewButton,
} from './components/collection';

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
      className="max-w-6xl mx-auto"
      icon="/assets/icons/window/gallery.png"
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

        <AddNewButton onClick={handleAddNewClick} />
      </div>
    </Win98Window>
  );
}
