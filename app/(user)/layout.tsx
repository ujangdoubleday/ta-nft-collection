import { UserShell } from '@/components/features/layout/UserShell';

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#000000]">
      <UserShell>{children}</UserShell>
    </div>
  );
}
