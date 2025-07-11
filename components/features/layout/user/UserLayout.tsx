'use client';

import { Container } from '@/components/features/layout/core/Container';
import { Footer } from '@/components/features/layout/core/Footer';
import { AuthGuard } from '@/components/features/layout/auth';
import { useEffect } from 'react';
import { Navbar } from '@/components/features/layout/core/Navbar';
import { Submenu } from '@/components/features/layout/core/Submenu';
import { useNavigation } from '@/lib/navigation/useNavigation';
import { usePathname } from 'next/navigation';

interface UserLayoutProps {
  children: React.ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  const pathname = usePathname();

  // Get navigation links from the custom hook - we no longer need to pass isOwner
  const { links } = useNavigation();

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

  // Navbar configuration
  const navbarConfig = {
    logo: {
      showDefault: true,
      href: '/',
    },
    user: {
      showUsername: true,
      showAddress: true,
      enableUsernameEdit: true,
    },
    breadcrumbs: {
      enabled: true,
    },
  };

  return (
    <>
      <div className="bg-[#0A0A0A] navigation-container">
        <Navbar config={navbarConfig} className="mb-0 pb-0" />
        <Submenu links={links} className="mt-0 pt-0" />
      </div>
      <div className="content-wrapper">
        <Container className="py-6 px-6 md:px-3 lg:px-6 mx-auto max-w-[84rem] flex-grow">
          <AuthGuard>{children}</AuthGuard>
        </Container>
      </div>
      <Footer />
    </>
  );
}
