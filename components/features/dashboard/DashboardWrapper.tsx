'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWallet } from '@/lib/hooks/wallet';
import { Container } from '@/components/features/layout/core/Container';
import { LoadingWindow } from '@/components/shared/loading';
import { DashboardLayout } from './DashboardLayout';
import { DashboardWelcome } from './DashboardWelcome';

interface DashboardWrapperProps {
  children?: React.ReactNode;
}

export const DashboardWrapper = ({ children }: DashboardWrapperProps) => {
  const { isConnected, isAuthenticated } = useWallet();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  // Handle client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle redirect after authentication
  useEffect(() => {
    if (mounted && isConnected && isAuthenticated && redirectPath) {
      router.push(redirectPath);
    }
  }, [mounted, isConnected, isAuthenticated, redirectPath, router]);

  // Return early during SSR
  if (!mounted) {
    return (
      <main className="py-4">
        <Container>
          <LoadingWindow
            title="Loading Admin Dashboard"
            text="Initializing..."
            icon="/assets/icons/window/gallery.png"
          />
        </Container>
      </main>
    );
  }

  // Show connect wallet message if not connected
  if (!isConnected || !isAuthenticated) {
    return (
      <main className="py-4">
        <Container>
          <DashboardWelcome redirectPath={redirectPath} />
        </Container>
      </main>
    );
  }

  return (
    <main className="py-4">
      <Container>{children || <DashboardLayout />}</Container>
    </main>
  );
};
