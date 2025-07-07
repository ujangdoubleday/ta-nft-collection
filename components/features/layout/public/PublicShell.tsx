'use client';

import { PublicLayout } from './PublicLayout';
import { Shell } from '@/components/features/layout/core/Shell';

interface PublicShellProps {
  children: React.ReactNode;
}

export function PublicShell({ children }: PublicShellProps) {
  return <Shell Layout={PublicLayout}>{children}</Shell>;
}

export default PublicShell;
