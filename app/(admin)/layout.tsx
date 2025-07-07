import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/next-auth/options';

const ADMIN_ADDRESSES = ['0x19191984DF6Ce7749B786b9a2BB869B4b735eC31'];

// export const experimental_ppr = true;

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.address) {
    redirect('/');
  }

  const isAdmin = ADMIN_ADDRESSES.map((addr) => addr.toLowerCase()).includes(
    session.user.address.toLowerCase(),
  );

  if (!isAdmin) {
    redirect('/');
  }

  return <>{children}</>;
}
