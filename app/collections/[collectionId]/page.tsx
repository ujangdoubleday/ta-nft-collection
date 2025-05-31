import { Container } from '@/components/core/layout/container';
import { ClientCollectionDetail, CollectionErrorMessage } from '@/components/features/collections';

export const runtime = 'edge';

// Define types for the collection items
type CollectionItem = {
  id: string;
  name: string;
  type: string;
  image: string;
  attributes: {
    rarity?: string;
    pixels?: string;
    dimensions?: string;
    complexity?: string;
    era?: string;
    style?: string;
    category?: string;
    resolution?: string;
  };
};

type Collection = {
  id: string;
  name: string;
  description: string;
  items: CollectionItem[];
};

// Sample collections data
const collections: Record<string, Collection> = {
  'pixel-art': {
    id: 'pixel-art',
    name: 'Pixel Art',
    description: 'Classic pixel art celebrating the golden age of digital creativity',
    items: Array.from({ length: 12 }, (_, i) => ({
      id: `pixel-${i + 1}`,
      name: `Pixel Art #${i + 1}`,
      type: 'Digital Art',
      image:
        i % 2 === 0
          ? '/assets/images/nfts/pixel-art/pixel-1.jpg'
          : '/assets/images/nfts/pixel-art/pixel-2.jpg',
      attributes: {
        rarity: i < 3 ? 'Rare' : i < 8 ? 'Uncommon' : 'Common',
        pixels: `${(i + 1) * 8}x${(i + 1) * 8}`,
      },
    })),
  },
  '3d-voxel': {
    id: '3d-voxel',
    name: '3D Voxel',
    description: 'Three-dimensional voxel art with depth and personality',
    items: Array.from({ length: 8 }, (_, i) => ({
      id: `voxel-${i + 1}`,
      name: `Voxel Art #${i + 1}`,
      type: '3D Model',
      image:
        i % 2 === 0
          ? '/assets/images/nfts/3d-voxel/voxel-1.svg'
          : '/assets/images/nfts/3d-voxel/voxel-2.svg',
      attributes: {
        dimensions: `${16 + i * 8}x${16 + i * 8}x${16 + i * 8}`,
        complexity: i < 2 ? 'High' : i < 5 ? 'Medium' : 'Low',
      },
    })),
  },
  'retro-computing': {
    id: 'retro-computing',
    name: 'Retro Computing',
    description: 'Digital artifacts celebrating the history of computing',
    items: Array.from({ length: 10 }, (_, i) => ({
      id: `retro-${i + 1}`,
      name: `Retro Computer #${i + 1}`,
      type: 'Digital Art',
      image:
        i % 2 === 0
          ? '/assets/images/nfts/retro-computing/retro-1.svg'
          : '/assets/images/nfts/retro-computing/retro-2.svg',
      attributes: {
        era: i < 3 ? '1970s' : i < 7 ? '1980s' : '1990s',
        style: i % 2 === 0 ? 'Realistic' : 'Stylized',
      },
    })),
  },
  'windows-98-icons': {
    id: 'windows-98-icons',
    name: 'Classic Icons',
    description: 'Nostalgic digital iconography from the dawn of the internet age',
    items: Array.from({ length: 16 }, (_, i) => ({
      id: `icon-${i + 1}`,
      name: `Classic Icon #${i + 1}`,
      type: 'Icon Pack',
      image:
        i % 2 === 0
          ? '/assets/images/nfts/windows-98-icons/win98-1.svg'
          : '/assets/images/nfts/windows-98-icons/win98-2.svg',
      attributes: {
        category: i < 4 ? 'System' : i < 8 ? 'Application' : i < 12 ? 'Document' : 'Misc',
        resolution: i % 3 === 0 ? '16x16' : i % 3 === 1 ? '32x32' : '48x48',
      },
    })),
  },
};

type Params = Promise<{ collectionId: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function CollectionPage({
  params,
  searchParams: _searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  // Await the params
  const resolvedParams = await params;
  const { collectionId } = resolvedParams;

  // In a real app, this would be a database or API call
  const collection = collections[collectionId as keyof typeof collections];

  // Handle case where collection doesn't exist
  if (!collection) {
    return (
      <main className="py-4">
        <Container>
          <CollectionErrorMessage />
        </Container>
      </main>
    );
  }

  return (
    <main className="py-4">
      <Container>
        <ClientCollectionDetail collectionId={collectionId} collection={collection} />
      </Container>
    </main>
  );
}
