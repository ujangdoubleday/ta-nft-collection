import { CollectionNFTsContent } from '@/components/features/user/collections/nfts';
import { requireSession } from '@/lib/auth/require-session';

type Params = Promise<{ address: string }>;

export default async function Page(props: { params: Params }) {
  await requireSession();

  const params = await props.params;
  const address = params.address;

  return <CollectionNFTsContent address={address} />;
}
