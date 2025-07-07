'use client';

import { Navbar } from './navigation';

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
