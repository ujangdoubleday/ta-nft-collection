'use client';

import { Container } from '@/components/core/layout/container';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { UserNavLinks } from './UserNavLinks';
import { UserWallet } from './UserWallet';
import { UserMobileMenu } from './UserMobileMenu';

export function UserNavbar() {
  return (
    <div className="bg-zinc-800 border-b border-zinc-700 w-full">
      <Container>
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 text-white hover:text-zinc-300 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Home</span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <UserNavLinks />
            <UserWallet />
            <UserMobileMenu />
          </div>
        </div>
      </Container>
    </div>
  );
}

export default UserNavbar;
