import { UserCollectionsContent } from '@/components/features/user/collections';
import { UserCollectionsHeader } from '@/components/features/user/collections';

export default function UserCollectionsPage() {
  return (
    <div className="animate-fade-in">
      <UserCollectionsHeader />
      <UserCollectionsContent />
    </div>
  );
}
