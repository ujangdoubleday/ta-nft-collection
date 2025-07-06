import { NewCollectionContentWithBlockchain } from '@/components/features/user/collections/new';
import { requireSession } from '@/lib/auth/require-session';

export default async function NewCollectionPage() {
  await requireSession();

  return <NewCollectionContentWithBlockchain />;
}
