import { PublicLayout } from '@/components/features/layout/public';

export default function PublicRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      <PublicLayout>{children}</PublicLayout>
    </div>
  );
}
