'use client';

import { Win98Taskbar } from '@/components/core/layout';
import { Navbar, NavbarSpacer } from '@/components/core/navigation';
import { Win98SubMenuBar } from '@/components/core/layout';
import { Win98WelcomeNotification } from '@/components/features/layout/notifications';

interface MainLayoutProps {
  children: React.ReactNode;
  showWelcome: boolean;
  onCloseWelcome: () => void;
}

export function MainLayout({ children, showWelcome, onCloseWelcome }: MainLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col pb-10 animate-fade-in">
      <Navbar />
      <NavbarSpacer />
      <Win98SubMenuBar />
      <div className="flex-1 pt-2 px-2 sm:px-4 md:px-6 win98-scrollbar overflow-auto">
        {children}
      </div>
      <Win98Taskbar />

      {showWelcome && <Win98WelcomeNotification onClose={onCloseWelcome} />}
    </div>
  );
}
