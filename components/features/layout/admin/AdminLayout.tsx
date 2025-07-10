'use client';

import React from 'react';
import { Container } from '@/components/features/layout/core';
import { Footer } from '@/components/features/layout/core';
import { AuthGuard } from '@/components/features/layout/auth';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/features/layout/core';
import { Submenu } from '@/components/features/layout/core';
import { useAdminNavigation } from '@/lib/navigation/useNavigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  // Call useAdminNavigation directly at the top level
  // We no longer need to pass isOwner since we now show all links
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
