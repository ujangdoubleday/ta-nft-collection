import { WalletButton } from '@/components/features/wallet/components/WalletButton';
import { Logo } from './Logo';
import { MobileNav, NavLinks } from './NavLinks';
import { User } from 'lucide-react';
import Link from 'next/link';
import Spinner from '@/components/ui/spinner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-background">
      <div className="h-full mx-auto px-4 sm:px-6 flex items-center justify-between max-w-9xl">
        <div className="flex items-center gap-6 h-full logo-container">
          <Logo className="logo-primary" />
          <NavLinks />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => handleLogin(e)}
            className="bg-black text-white rounded-md border border-zinc-600 text-[15px] hover:bg-zinc-800 font-medium shadow-sm flex items-center justify-center w-9 h-9"
          >
            {isLoading ? <Spinner size="sm" /> : <User size={18} />}
          </button>
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
