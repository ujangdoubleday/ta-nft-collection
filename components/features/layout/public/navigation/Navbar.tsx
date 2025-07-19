'use client';

import { WalletButton } from '@/components/features/wallet/components/WalletButton';
import { Logo } from './Logo';
import { MobileNav, NavLinks } from './NavLinks';
import { User } from 'lucide-react';
import Link from 'next/link';
import Spinner from '@/components/ui/spinner';
import { useState, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';

// Simple context with fixed value for transparency
export const NavbarContext = createContext({
  isTransparent: true,
});

export const useNavbar = () => useContext(NavbarContext);

export function Navbar() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push('/api/auth/login');
    }, 300);
  };

  // Fixed navbar style with transparency
  const navbarStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 9999,
    borderBottom: 'transparent',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '4rem',
  };

  const buttonStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  };

  return (
    <NavbarContext.Provider value={{ isTransparent: true }}>
      <div style={navbarStyle}>
        <div className="h-full mx-auto px-3 sm:px-6 flex items-center justify-between max-w-9xl">
          <div className="flex items-center gap-2 sm:gap-6 h-full logo-container">
            <Logo className="logo-primary" />
            <NavLinks />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={(e) => handleLogin(e)}
              className="text-white rounded-md border border-zinc-600 text-[15px] font-medium shadow-sm flex items-center justify-center w-8 sm:w-9 h-8 sm:h-9"
              style={buttonStyle}
            >
              {isLoading ? <Spinner size="sm" /> : <User size={18} />}
            </button>
            <WalletButton />
            <MobileNav />
          </div>
        </div>
      </div>
    </NavbarContext.Provider>
  );
}

export function NavbarSpacer() {
  return <div className="h-16"></div>;
}
