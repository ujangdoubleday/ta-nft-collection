import { WalletButton } from '@/components/features/wallet/components/WalletButton';
import { Logo } from './Logo';
import { MobileNav, NavLinks } from './NavLinks';

export function Navbar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-background">
      <div className="h-full mx-auto px-4 sm:px-6 flex items-center justify-between max-w-9xl">
        <div className="flex items-center gap-6 h-full">
          <Logo />
          <NavLinks />
        </div>

        <div className="flex items-center gap-3">
          <WalletButton />
          <MobileNav />
        </div>
      </div>
    </div>
  );
}

export function NavbarSpacer() {
  return <div className="h-16"></div>;
}
