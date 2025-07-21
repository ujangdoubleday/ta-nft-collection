import { UserLayout, BlocklistHandler } from '@/components/features/layout/user';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverClient } from '@/lib/api/trpc/server-client';

export const dynamic = 'force-dynamic';

export default async function UserRootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  let isBlocklisted = false;

  if (session?.user?.address) {
    isBlocklisted = await serverClient.blocklist.isBlocklisted({
      address: session.user.address,
    });

    if (isBlocklisted) {
      return <BlocklistHandler address={session.user.address} />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#000000]">
      <UserLayout>{children}</UserLayout>
    </div>
  );
}
