import { Container } from '@/components/core/layout/container';
import { AlchemyNFTDetail } from '@/components/features/collections/nft/detail';
import { CollectionErrorMessage } from '@/components/features/collections/shared/error/CollectionErrorMessage';
import { getCollectionByContractAddress } from '@/lib/api/services';

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
  const resolvedParams = await params;
  const contractAddress = resolvedParams.collectionId;
  const { nftId } = resolvedParams;

  const collection = await getCollectionByContractAddress(contractAddress);

  if (!collection) {
    return (
      <main className="py-4">
        <Container>
          <CollectionErrorMessage
            title="Error - Collection Not Found"
            icon="/assets/icons/window/document-error.png"
          />
        </Container>
      </main>
    );
  }

  return (
    <main className="py-4">
      <Container>
        <AlchemyNFTDetail contractAddress={contractAddress} tokenId={nftId} />
      </Container>
    </main>
  );
}
