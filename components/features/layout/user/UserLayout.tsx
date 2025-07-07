'use client';

import { Container } from '@/components/core/layout/container';
import UserNavbar from '@/components/features/user/layout/UserNavbar';
import { UserFooter } from '@/components/features/user/layout/UserFooter';
import { UserAuthGuard } from '@/components/features/user/auth';
import UserSubmenu from '@/components/features/user/layout/UserSubmenu';
import { useEffect } from 'react';

interface UserLayoutProps {
  children: React.ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  // Add scroll detection
  useEffect(() => {
    const handleScroll = () => {
      // Add or remove .scrolled class based on scroll position
      if (window.scrollY > 64) {
        // Height of the navbar
        document.documentElement.classList.add('scrolled');
      } else {
        document.documentElement.classList.remove('scrolled');
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Initial call to set the correct state
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <div className="bg-[#0A0A0A]">
        <UserNavbar />
        <UserSubmenu />
      </div>
      <div className="content-wrapper">
        <Container className="py-6 px-6 md:px-3 lg:px-6 mx-auto max-w-[84rem] flex-grow">
          <UserAuthGuard>{children}</UserAuthGuard>
        </Container>
      </div>
      <UserFooter />
    </>
  );
}
