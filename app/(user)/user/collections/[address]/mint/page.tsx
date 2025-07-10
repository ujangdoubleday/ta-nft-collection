import { NFTMintContent } from '@/components/features/collections/mint';
import { NotOwnerMessage } from '@/components/features/collections';
import { serverClient } from '@/lib/api/trpc/server-client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/next-auth/options';
import { redirect } from 'next/navigation';

type Params = Promise<{ address: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const address = params.address;

  // Get the user session
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.address) {
    redirect('/login');
  }

  const userAddress = session.user.address;

  // Validate the collection
  try {
    await serverClient.collection.isCollectionValid({ collectionAddress: address });
  } catch (error) {
    console.error('Invalid collection:', error);
    // We'll let the client component handle the error display
  }

  // Check if the user is the owner of the collection
  const owner = await serverClient.collection.getCollectionOwner({ collectionAddress: address });
  const isOwner = !!owner && userAddress.toLowerCase() === owner.toLowerCase();

  // If user is not the owner, show access denied message
  if (!isOwner) {
    return <NotOwnerMessage collectionAddress={address} isAdmin={false} />;
  }

  // Only show the mint form if user is the owner
  return <NFTMintContent contractAddress={address} role="user" isOwner={isOwner} />;
}
