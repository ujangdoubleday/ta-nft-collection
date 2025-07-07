'use client';

import { Container } from '@/components/features/layout/core';
import { Footer } from '@/components/features/layout/core';
import { AuthGuard } from '@/components/features/layout/auth';
import { useEffect } from 'react';
import { Navbar } from '@/components/features/layout/core';
import { Submenu } from '@/components/features/layout/core';
import { useAdminNavigation } from '@/lib/navigation/useNavigation';
import { User } from 'lucide-react';
import React from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  // Get admin navigation links
  const { links } = useAdminNavigation();

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
      href: '/admin',
    },
    user: {
      showUsername: false,
      showAddress: false,
      enableUsernameEdit: false,
      showAddressInDropdown: true,
    },
    breadcrumbs: {
      enabled: true,
      customBreadcrumbs: [
        {
          href: '/admin',
          label: 'Admin',
          icon: React.createElement(User, { className: 'h-4 w-4 mr-1' }),
        },
      ],
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
