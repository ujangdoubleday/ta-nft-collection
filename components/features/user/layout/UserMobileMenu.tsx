'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Grid3x3, Home, Menu, X, LogOut } from 'lucide-react';
import { useWallet } from '@/lib/hooks/wallet';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
    toast.info('Signing out...');
    await disconnect();
    toast.success('Signed out successfully');
    router.push('/');
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white hover:text-gray-300"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col">
          <div className="flex justify-end p-4">
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-white hover:text-gray-300"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 pb-12">
            <ul className="space-y-4">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      pathname === link.href
                        ? 'bg-[#1f1f1f] text-white'
                        : 'text-gray-400 hover:text-white hover:bg-[#1f1f1f]'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-400 hover:text-white hover:bg-[#1f1f1f]"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Log Out</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
