import { NFTMintContent } from '@/components/features/user/collections/mint';

type Params = Promise<{ address: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const address = params.address;

  return <NFTMintContent contractAddress={address} />;
}
