import Image from 'next/image';
import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { WalletButton } from '@/components/features/wallet/components/WalletButton';
import { Button } from '@/components/ui/atoms/button';

interface DashboardWelcomeProps {
  redirectPath?: string | null;
}

export const DashboardWelcome = ({ redirectPath }: DashboardWelcomeProps) => {
  return (
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
  );
};
