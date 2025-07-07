import { getServerSession } from 'next-auth';
import { forbidden } from 'next/navigation';
import { authOptions } from '@/lib/auth/next-auth/options';
import { AdminShell } from '@/components/features/layout';

const ADMIN_ADDRESSES = ['0x19191984DF6Ce7749B786b9a2BB869B4b735eC31'];

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.address) {
    forbidden();
  }

  const isAdmin = ADMIN_ADDRESSES.map((addr) => addr.toLowerCase()).includes(
    session.user.address.toLowerCase(),
  );

  if (!isAdmin) {
    forbidden();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#000000]">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
