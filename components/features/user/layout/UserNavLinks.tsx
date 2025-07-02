'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Grid3x3, Home } from 'lucide-react';

export function UserNavLinks() {
  const pathname = usePathname();

  const links = [
    {
      href: '/my',
      label: 'Dashboard',
      icon: <Home className="h-4 w-4" />,
    },
    {
      href: '/my/collections',
      label: 'Collections',
      icon: <Grid3x3 className="h-4 w-4" />,
    },
    {
      href: '/my/profile',
      label: 'Profile',
      icon: <User className="h-4 w-4" />,
    },
  ];

  return (
    <nav className="hidden md:flex items-center gap-6">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium flex items-center gap-1 transition-colors ${
              isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
