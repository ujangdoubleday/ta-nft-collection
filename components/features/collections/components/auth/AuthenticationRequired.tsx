'use client';

import { Container } from '@/components/core/layout/container';
import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { WalletButton } from '@/components/features/wallet/components/WalletButton';
import Image from 'next/image';

interface AuthenticationRequiredProps {
  message?: string;
  title?: string;
}

export function AuthenticationRequired({
  message = 'You need to connect your wallet to access this feature.',
  title = 'Authentication Required',
}: AuthenticationRequiredProps) {
  return (
    <main className="py-4">
      <Container>
        <Win98Window title={title} icon="/assets/icons/window/error.png" className="mb-4">
          <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
            <Image
              src="/assets/icons/window/warning.png"
              alt="Wallet Warning"
              className="w-16 h-16 mb-4"
              height={64}
              width={64}
            />
            <h2 className="text-xl font-bold mb-2">Wallet Connection Required</h2>
            <p className="text-center mb-6">{message}</p>
            <div className="flex justify-center">
              <WalletButton />
            </div>
          </div>
        </Win98Window>
      </Container>
    </main>
  );
}
