import { NotOwnerMessage } from '@/components/features/collections';
import { CollectionSettingsContent } from '@/components/features/collections/settings';
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

  // Check if the user is the owner of the collection
  const owner = await serverClient.collection.getCollectionOwner({ collectionAddress: address });
  const isOwner = !!owner && userAddress.toLowerCase() === owner.toLowerCase();

  // If user is not the owner, show access denied message
  if (!isOwner) {
    return <NotOwnerMessage collectionAddress={address} isAdmin={true} />;
  }

  return <CollectionSettingsContent address={address} role="admin" />;
}
