'use client';

import { Container } from '@/components/core/layout';
import { CreatorCollectionGallery } from '@/components/features/collections/collection/list';
import { useWallet } from '@/lib/hooks/wallet';
import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { LoadingWindow } from '@/components/shared/loading';
import { WalletButton } from '@/components/features/wallet/components/WalletButton';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

export function CollectionsPage() {
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
            title="Loading Collections"
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
          <Win98Window
            title="Connect Wallet Required"
            icon="/assets/icons/window/error.png"
            className="mb-4"
          >
            <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
              <Image
                src="/assets/icons/window/warning.png"
                alt="Wallet Warning"
                className="w-16 h-16 mb-4"
                height={64}
                width={64}
              />
              <h2 className="text-xl font-bold mb-2">Wallet Connection Required</h2>
              <p className="text-center mb-6">
                {redirectPath === '/collections/new'
                  ? 'You need to connect your wallet to create a new NFT collection.'
                  : 'You need to connect your wallet to view your NFT collections.'}
              </p>
              <div className="flex justify-center">
                <WalletButton />
              </div>
            </div>
          </Win98Window>
        </Container>
      </main>
    );
  }

  // Show collections when connected
  return (
    <main className="py-4">
      <Container>
        <CreatorCollectionGallery />
      </Container>
    </main>
  );
}
