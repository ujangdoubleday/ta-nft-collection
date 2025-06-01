import { Container } from '@/components/core/layout/container';
import {
  ClientNFTDetail,
  NFTErrorMessage,
  CollectionErrorMessage,
} from '@/components/features/collections';

// export const runtime = 'edge';

// Define type for NFT history item
type HistoryItem = {
  type: string;
  from: string;
  to: string;
  date: string;
  price?: string;
};

// Define type for NFT item
type NFTItem = {
  name: string;
  description: string;
  type: string;
  creator: string;
  owner: string;
  mintDate: string;
  tokenId: string;
  blockchain: string;
  image: string;
  attributes: Record<string, string>;
  history?: HistoryItem[];
};

// Define collection items type
type CollectionItems = {
  [key: string]: NFTItem;
};

// Define collection type
type Collection = {
  name: string;
  description?: string;
  items: CollectionItems;
};

// Sample collections data
const collections: Record<string, Collection> = {
  'pixel-art': {
    name: 'Pixel Art',
    description: 'Classic pixel art celebrating the golden age of digital creativity',
    items: {
      'pixel-1': {
        name: 'Pixel Art #1',
        description: 'A beautiful 8x8 pixel art piece featuring a landscape scene.',
        type: 'Digital Art',
        creator: 'Your Address',
        owner: 'Your Address',
        mintDate: '2023-10-15',
        tokenId: '1',
        blockchain: 'Ethereum',
        image: '/assets/images/nfts/pixel-art/pixel-1.jpg',
        attributes: {
          rarity: 'Rare',
          pixels: '8x8',
        },
        history: [
          {
            type: 'Mint',
            from: '0x0000000000000000000000000000000000000000',
            to: '0xABC...123',
            date: '2023-10-15',
            price: '0.05 ETH',
          },
          {
            type: 'Transfer',
            from: '0xABC...123',
            to: 'Your Address',
            date: '2023-11-05',
            price: '0.08 ETH',
          },
        ],
      },
      'pixel-2': {
        name: 'Pixel Art #2',
        description: 'A pixelated character inspired by classic arcade games.',
        type: 'Digital Art',
        creator: 'Your Address',
        owner: 'Your Address',
        mintDate: '2023-10-16',
        tokenId: '2',
        blockchain: 'Ethereum',
        image: '/assets/images/nfts/pixel-art/pixel-2.jpg',
        attributes: {
          rarity: 'Uncommon',
          pixels: '16x16',
        },
        history: [
          {
            type: 'Mint',
            from: '0x0000000000000000000000000000000000000000',
            to: 'Your Address',
            date: '2023-10-16',
            price: '0.05 ETH',
          },
        ],
      },
    },
  },
  '3d-voxel': {
    name: '3D Voxel',
    items: {
      'voxel-1': {
        name: 'Voxel Art #1',
        description: 'A 3D voxel model of a futuristic cityscape.',
        type: '3D Model',
        creator: 'Your Address',
        owner: 'Your Address',
        mintDate: '2023-11-01',
        tokenId: '1',
        blockchain: 'Polygon',
        image: '/assets/images/nfts/3d-voxel/voxel-1.svg',
        attributes: {
          dimensions: '24x24x24',
          complexity: 'High',
        },
        history: [
          {
            type: 'Mint',
            from: '0x0000000000000000000000000000000000000000',
            to: 'Your Address',
            date: '2023-11-01',
            price: '5 MATIC',
          },
        ],
      },
    },
  },
  'retro-computing': {
    name: 'Retro Computing',
    items: {
      'retro-1': {
        name: 'Retro Computer #1',
        description: 'An artistic rendering of a vintage 1970s computer terminal.',
        type: 'Digital Art',
        creator: 'Your Address',
        owner: 'Your Address',
        mintDate: '2023-09-20',
        tokenId: '1',
        blockchain: 'Ethereum',
        image: '/assets/images/nfts/retro-computing/retro-1.svg',
        attributes: {
          era: '1970s',
          style: 'Realistic',
        },
        history: [
          {
            type: 'Mint',
            from: '0x0000000000000000000000000000000000000000',
            to: 'Your Address',
            date: '2023-09-20',
            price: '0.03 ETH',
          },
        ],
      },
    },
  },
  'windows-98-icons': {
    name: 'Classic Icons',
    items: {
      'icon-1': {
        name: 'Classic Icon #1',
        description: 'A recreation of a classic computer icon in retro style.',
        type: 'Icon Pack',
        creator: 'Your Address',
        owner: 'Your Address',
        mintDate: '2023-12-01',
        tokenId: '1',
        blockchain: 'Ethereum',
        image: '/assets/images/nfts/windows-98-icons/win98-1.svg',
        attributes: {
          category: 'System',
          resolution: '32x32',
        },
        history: [
          {
            type: 'Mint',
            from: '0x0000000000000000000000000000000000000000',
            to: 'Your Address',
            date: '2023-12-01',
            price: '0.02 ETH',
          },
        ],
      },
    },
  },
};

type Params = Promise<{
  collectionId: string;
  nftId: string;
}>;

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function NFTDetailPage({
  params,
  searchParams: _searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  // Await the params
  const resolvedParams = await params;
  const { collectionId, nftId } = resolvedParams;

  // In a real app, this would be a database or API call
  const collection = collections[collectionId as keyof typeof collections];

  if (!collection) {
    return (
      <main className="py-4">
        <Container>
          <CollectionErrorMessage />
        </Container>
      </main>
    );
  }

  // Get the NFT
  const nft = collection.items?.[nftId] as NFTItem | undefined;

  if (!nft) {
    return (
      <main className="py-4">
        <Container>
          <NFTErrorMessage collectionId={collectionId} />
        </Container>
      </main>
    );
  }

  return (
    <main className="py-4">
      <Container>
        <ClientNFTDetail
          collectionId={collectionId}
          nftId={nftId}
          nft={nft}
          collectionName={collection.name}
        />
      </Container>
    </main>
  );
}
