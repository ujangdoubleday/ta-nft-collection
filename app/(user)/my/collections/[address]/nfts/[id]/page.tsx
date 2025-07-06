import { NFTDetailContent } from '@/components/features/user/collections/detail/nft';
import { requireSession } from '@/lib/auth/require-session';

type Params = Promise<{ address: string; id: string }>;

export default async function Page(props: { params: Params }) {
  await requireSession();

  const params = await props.params;
  const address = params.address;
  const id = params.id;

  return <NFTDetailContent address={address} id={id} />;
}
