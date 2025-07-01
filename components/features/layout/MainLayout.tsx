'use client';

import { Navbar, NavbarSpacer } from '@/components/core/navigation';

interface MainLayoutProps {
  children: React.ReactNode;
  showWelcome: boolean;
  onCloseWelcome: () => void;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col animate-fade-in font-sans">
      <Navbar />
      <div className="px-4 sm:px-6 md:px-8 mx-auto">{children}</div>
    </div>
  );
}
