import { UserLayout } from '@/components/features/layout/user';

export default async function UserRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#000000]">
      <UserLayout>{children}</UserLayout>
    </div>
  );
}
