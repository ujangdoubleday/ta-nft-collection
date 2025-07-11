'use client';

import { Container } from '@/components/features/layout/core/Container';
import { Footer } from '@/components/features/layout/core/Footer';
import { AuthGuard } from '@/components/features/layout/auth';
import { useEffect } from 'react';
import { Navbar } from '@/components/features/layout/core/Navbar';
import { Submenu } from '@/components/features/layout/core/Submenu';
import { useAdminNavigation } from '@/lib/navigation/useNavigation';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/lib/hooks/use-admin';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { isAdmin } = useAdmin();
  const { links } = useAdminNavigation();

  // Add scroll detection with improved logo animation
  useEffect(() => {
    const handleScroll = () => {
      // Add or remove .scrolled class based on scroll position
      if (window.scrollY > 64) {
        // Height of the navbar
        document.documentElement.classList.add('scrolled');

        // Ensure logo animations are smooth
        const logoElements = document.querySelectorAll('.logo-wrapper');
        logoElements.forEach((logo) => {
          logo.classList.add('logo-animating');
        });
      } else {
        document.documentElement.classList.remove('scrolled');

        // Remove animation class after transition completes
        setTimeout(() => {
          const logoElements = document.querySelectorAll('.logo-wrapper');
          logoElements.forEach((logo) => {
            if (!document.documentElement.classList.contains('scrolled')) {
              logo.classList.remove('logo-animating');
            }
          });
        }, 300);
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
      showUsername: false,
      showAddress: false,
      enableUsernameEdit: false,
      showAddressInDropdown: true,
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
