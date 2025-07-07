'use client';

import { UserLayout } from './UserLayout';
import { Shell } from '@/components/features/layout/core/Shell';

interface UserShellProps {
  children: React.ReactNode;
}

export function UserShell({ children }: UserShellProps) {
  return <Shell Layout={UserLayout}>{children}</Shell>;
}

export default UserShell;
