import { DashboardWrapper } from '@/components/features/dashboard';
import { Suspense } from 'react';

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardWrapper />
    </Suspense>
  );
}
