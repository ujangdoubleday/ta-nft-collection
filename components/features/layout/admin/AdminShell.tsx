'use client';

import { AdminLayout } from './AdminLayout';
import { Shell } from '@/components/features/layout/core';

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return <Shell Layout={AdminLayout}>{children}</Shell>;
}

export default AdminShell;
