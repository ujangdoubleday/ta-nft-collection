'use client';

import { Navbar, NavbarSpacer } from '@/components/core/navigation';

interface PublicLayoutMainProps {
  children: React.ReactNode;
}

export function PublicLayoutMain({ children }: PublicLayoutMainProps) {
  return (
    <div className="flex-col animate-fade-in">
      <Navbar />
      {children}
    </div>
  );
}
