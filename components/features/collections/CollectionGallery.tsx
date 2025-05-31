'use client';

import { Win98Window } from "@/components/ui/organisms/Win98Window";
import {
  CollectionCard,
  EmptyCollectionMessage,
} from '@/components/features/collections/components/collection';

// Sample collection data
const collections = [
  {
    id: 'pixel-art',
    name: 'Pixel Art',
    description: 'Classic pixel art celebrating the golden age of digital creativity',
    count: 16,
    thumbnail: '/assets/images/nfts/pixel-art/pixel-1.svg',
  },
  {
    id: '3d-voxel',
    name: '3D Voxel',
    description: 'Three-dimensional voxel art with depth and personality',
    count: 8,
    thumbnail: '/assets/images/nfts/3d-voxel/voxel-1.svg',
  },
  {
    id: 'retro-computing',
    name: 'Retro Computing',
    description: 'Digital artifacts celebrating the history of computing',
    count: 12,
    thumbnail: '/assets/images/nfts/retro-computing/retro-1.svg',
  },
  {
    id: 'windows-98-icons',
    name: 'Classic Icons',
    description: 'Nostalgic digital iconography from the dawn of the internet age',
    count: 24,
    thumbnail: '/assets/images/nfts/windows-98-icons/win98-1.svg',
  },
];

interface CollectionGalleryProps {
  // Props dapat ditambahkan jika perlu
}

export function CollectionGallery({}: CollectionGalleryProps) {
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
              id={collection.id}
              name={collection.name}
              description={collection.description}
              count={collection.count}
              thumbnail={collection.thumbnail}
            />
          ))}
        </div>
      )}
    </Win98Window>
  );
}

