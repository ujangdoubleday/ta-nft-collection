import { UserDashboardContent } from '@/components/features/user/dashboard';
import { requireSession } from '@/lib/auth/require-session';

export default async function Page() {
  await requireSession();

  return <UserDashboardContent />;
}
