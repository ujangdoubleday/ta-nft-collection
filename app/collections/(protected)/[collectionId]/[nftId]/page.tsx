import { Container } from '@/components/core/layout/container';
import { NFTDetailWrapper } from '@/components/features/collections/nft/detail';

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

  return (
    <main className="py-4">
      <Container>
        <NFTDetailWrapper contractAddress={contractAddress} tokenId={nftId} />
      </Container>
    </main>
  );
}
