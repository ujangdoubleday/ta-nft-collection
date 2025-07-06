import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/next-auth/options';
import { unauthorized } from 'next/navigation';

export async function requireSession() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.address) {
    unauthorized();
  }

  return session;
}
