import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/next-auth/options';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // Get the session on the server side
  const session = await getServerSession(authOptions);

  // If no session exists, redirect to the collections page
  if (!session) {
    redirect('/collections');
  }

  return <>{children}</>;
}
