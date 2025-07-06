'use client';

import { useWallet } from '@/lib/hooks/wallet';
import Spinner from '@/components/ui/spinner';

interface UserAuthGuardProps {
  children: React.ReactNode;
}

export function UserAuthGuard({ children }: UserAuthGuardProps) {
  const { isConnected, isAuthenticated } = useWallet();

  if (!isAuthenticated || !isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" color="white" />
      </div>
    );
  }

  return <>{children}</>;
}
