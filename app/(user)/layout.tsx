import { UserShell } from '@/components/features/layout';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      <UserShell>{children}</UserShell>
    </div>
  );
}
