import { Container } from '@/components/core/layout/container';
import { TrpcCollectionDetail, CollectionErrorMessage } from '@/components/features/collections';
import { getCollectionByContractAddress, getNFTsByContractAddress } from '@/lib/api/services';

// export const runtime = 'edge';

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

// The collectionId param from the URL is actually the contract address
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
  // The collectionId from the URL is actually the contract address
  const contractAddress = resolvedParams.collectionId;

  // Fetch collection from database using contract address via tRPC
  const collection = await getCollectionByContractAddress(contractAddress);

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
        <TrpcCollectionDetail contractAddress={contractAddress} />
      </Container>
    </main>
  );
}
