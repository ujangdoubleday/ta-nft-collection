import { Container } from '@/components/core/layout/container';
import { TrpcNFTMintForm, CollectionErrorMessage } from '@/components/features/collections';
import { getCollectionByContractAddress } from '@/lib/api/services';

// export const runtime = 'edge';

// The collectionId param from the URL is actually the contract address
type Params = Promise<{ collectionId: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function CreateNFTPage({
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
  // This is just to check if the collection exists before rendering the client component
  const collection = await getCollectionByContractAddress(contractAddress);

  // Handle case where collection doesn't exist
  if (!collection) {
    return (
      <main className="py-4">
        <Container>
          <CollectionErrorMessage
            title="Error - Collection Not Found"
            icon="/assets/icons/window/gallery-create.png"
          />
        </Container>
      </main>
    );
  }

  return (
    <main className="py-4">
      <Container>
        <TrpcNFTMintForm contractAddress={contractAddress} />
      </Container>
    </main>
  );
}
