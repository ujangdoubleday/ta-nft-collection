import { UserCollectionsContent } from '@/components/features/user/collections';
import { UserCollectionsHeader } from '@/components/features/user/collections';
import { requireSession } from '@/lib/auth/require-session';

export default async function UserCollectionsPage() {
  await requireSession();

  return (
    <div className="animate-fade-in">
      <UserCollectionsHeader />
      <UserCollectionsContent />
    </div>
  );
}
