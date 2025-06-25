import { Container } from '@/components/core/layout/container';
import { CollectionDetailWrapper } from '@/components/features/collections/collection/detail';

type Params = Promise<{ collectionId: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function CollectionDetailPage({
  params,
  searchParams: _searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const resolvedParams = await params;
  const contractAddress = resolvedParams.collectionId;

  return (
    <main className="py-4">
      <Container>
        <CollectionDetailWrapper contractAddress={contractAddress} />
      </Container>
    </main>
  );
}
