import { PublicShell } from '@/components/features/layout';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      <PublicShell>{children}</PublicShell>
    </div>
  );
}
