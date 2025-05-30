'use client';

import { Container } from '@/components/ui/container';
import { CollectionGallery } from '@/components/features/collections';
import { useWallet } from '@/lib/hooks/wallet';
import { Win98Window } from '@/components/ui/win98';
import { WalletButton } from '@/components/features/wallet/components/WalletButton';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export function CollectionsPage() {
  const { isConnected, isAuthenticated } = useWallet();
  const [mounted, setMounted] = useState(false);

  // Handle client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return early during SSR
  if (!mounted) {
    return (
      <main className="py-4">
        <Container>
          <Win98Window
            title="Loading Collections"
            icon="/assets/icons/window/gallery.png"
            className="mb-4"
          >
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <p className="text-center mb-4">Loading...</p>
            </div>
          </Win98Window>
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
                You need to connect your wallet to view your NFT collections.
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
        <CollectionGallery />
      </Container>
    </main>
  );
}
