'use client';

import { useWallet } from '@/lib/hooks/wallet';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CollectionForm } from '@/components/features/collections/collection/form';
import { Container } from '@/components/core/layout/container';
import { AuthenticationRequired } from '@/components/features/collections/shared/auth/AuthenticationRequired';

export function CreateCollectionPageWrapper() {
  const { isConnected, isAuthenticated } = useWallet();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to collections page if not authenticated
  useEffect(() => {
    if (mounted && (!isConnected || !isAuthenticated)) {
      router.replace('/collections?redirect=/collections/new');
    }
  }, [mounted, isConnected, isAuthenticated, router]);

  // Show loading state during SSR or before redirect
  if (!mounted || !isConnected || !isAuthenticated) {
    return (
      <AuthenticationRequired
        message="You need to connect your wallet to create a new NFT collection."
        title="Create Collection - Authentication Required"
      />
    );
  }

  // Only render the form if authenticated
  return (
    <main className="py-4">
      <Container>
        <CollectionForm />
      </Container>
    </main>
  );
}
