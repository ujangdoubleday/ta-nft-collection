import { CollectionNFTsContent } from '@/components/features/collections/nfts';

type Params = Promise<{ address: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const address = params.address;

  return <CollectionNFTsContent address={address} role="user" />;
}
