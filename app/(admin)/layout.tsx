import { AdminLayout } from '@/components/features/layout/admin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { forbidden } from 'next/navigation';
import { getUserRole } from '@/lib/auth/role';

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session || !session.user?.address) {
    return forbidden();
  }

  // Check if the authenticated wallet is admin
  const role = await getUserRole(session.user.address);
  if (role !== 'admin') {
    return forbidden();
  }

  // Add AdminLayout back here at the top level so it only renders once
  return (
    <div className="min-h-screen flex flex-col bg-[#000000]">
      <AdminLayout>{children}</AdminLayout>
    </div>
  );
}
