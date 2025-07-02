'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Grid3x3, Home, Menu, X, LogOut } from 'lucide-react';
import { useWallet } from '@/lib/hooks/wallet';
import { useRouter } from 'next/navigation';

export function UserMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { disconnect } = useWallet();
  const router = useRouter();

  const links = [
    {
      href: '/my',
      label: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
    },
    {
      href: '/my/collections',
      label: 'Collections',
      icon: <Grid3x3 className="h-5 w-5" />,
    },
    {
      href: '/my/profile',
      label: 'Profile',
      icon: <User className="h-5 w-5" />,
    },
  ];

  const handleLogout = async () => {
    await disconnect();
    router.push('/');
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-300 hover:text-white p-2">
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-64 bg-zinc-800 border-l border-zinc-700 shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-zinc-700">
              <div className="text-white font-bold">NFT Dashboard</div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <nav className="flex flex-col gap-2">
                {links.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 py-3 px-4 rounded-md transition-colors ${
                        isActive
                          ? 'bg-zinc-700 text-white'
                          : 'text-zinc-300 hover:bg-zinc-700/50 hover:text-white'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.icon}
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 border-t border-zinc-700">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 py-3 px-4 w-full rounded-md text-zinc-300 hover:bg-zinc-700/50 hover:text-white transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
