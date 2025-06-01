import { WalletButton } from '@/components/features/wallet/components/WalletButton';
import { Logo } from './Logo';
import { MobileNav, NavLinks } from './NavLinks';

export function Navbar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-12 bg-[#c0c0c0] border-b border-[#808080] shadow-md">
      <div className="h-full mx-auto px-2 sm:px-3 md:px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <Logo />
          <NavLinks />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <WalletButton />
          <MobileNav />
        </div>
      </div>
    </div>
  );
}

export function NavbarSpacer() {
  return <div className="h-12"></div>;
}
