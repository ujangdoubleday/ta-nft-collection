import { CollectionDetailContent } from '@/components/features/collections/detail';

type Params = Promise<{ address: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const address = params.address;

  return <CollectionDetailContent address={address} role="user" />;
}
