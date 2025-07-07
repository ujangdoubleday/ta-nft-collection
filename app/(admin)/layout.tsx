import { AdminLayout } from '@/components/features/layout/admin';

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#000000]">
      <AdminLayout>{children}</AdminLayout>
    </div>
  );
}
