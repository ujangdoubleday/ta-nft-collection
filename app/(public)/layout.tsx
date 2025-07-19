import { PublicLayout } from '@/components/features/layout/public';

export default function PublicRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-white flex flex-col bg-black">
      <PublicLayout>{children}</PublicLayout>
    </div>
  );
}
