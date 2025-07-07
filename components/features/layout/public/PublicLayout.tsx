'use client';

import { Navbar } from '@/components/core/navigation';

interface PublicLayoutMainProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutMainProps) {
  return (
    <div className="flex-col animate-fade-in">
      <Navbar />
      {children}
    </div>
  );
}
