import { Container } from '@/components/core/layout/container';
import { TrpcNFTMintForm } from '@/components/features/collections/nft';
import { CollectionErrorMessage } from '@/components/features/collections/shared/error/CollectionErrorMessage';
import { getCollectionByContractAddress } from '@/lib/api/services';

type Params = Promise<{ collectionId: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function CreateNFTPage({
  params,
  searchParams: _searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const resolvedParams = await params;
  const contractAddress = resolvedParams.collectionId;

  const collection = await getCollectionByContractAddress(contractAddress);

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
