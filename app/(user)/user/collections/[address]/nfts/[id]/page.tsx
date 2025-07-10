import { NFTDetailContent } from '@/components/features/user/collections/detail/nft';

type Params = Promise<{ address: string; id: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const address = params.address;
  const id = params.id;

  return <NFTDetailContent address={address} id={id} />;
}
