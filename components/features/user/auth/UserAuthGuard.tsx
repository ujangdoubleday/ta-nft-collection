'use client';

import { useAddress } from '@/lib/hooks/use-address';
import Spinner from '@/components/ui/spinner';

interface UserAuthGuardProps {
  children: React.ReactNode;
}

export function UserAuthGuard({ children }: UserAuthGuardProps) {
  const { data: address, isLoading } = useAddress();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" color="white" text="Checking wallet..." />
      </div>
    );
  }

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" color="white" text="Redirecting..." />
      </div>
    );
  }

  return <>{children}</>;
}
