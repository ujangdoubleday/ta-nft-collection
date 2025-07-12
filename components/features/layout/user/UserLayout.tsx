'use client';

import { Container } from '@/components/features/layout/core/Container';
import { Footer } from '@/components/features/layout/core/Footer';
import { AuthGuard } from '@/components/features/layout/auth';
import { useEffect, useState, createContext, useContext } from 'react';
import { Navbar } from '@/components/features/layout/core/Navbar';
import { Submenu } from '@/components/features/layout/core/Submenu';
import { useNavigation } from '@/lib/navigation/useNavigation';
import { usePathname } from 'next/navigation';
import { trpc } from '@/lib/api/trpc/client';
import { useAddress } from '@/lib/hooks/use-address';

// Create context for collection ownership
export interface CollectionContextType {
  isOwner: boolean;
  collectionAddress: string | null;
  isLoading: boolean;
}

export const CollectionContext = createContext<CollectionContextType>({
  isOwner: false,
  collectionAddress: null,
  isLoading: true,
});

// Hook to use the collection context
export const useCollectionContext = () => useContext(CollectionContext);

interface UserLayoutProps {
  children: React.ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  const pathname = usePathname();
  const { data: userAddress } = useAddress();
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Extract collection address from pathname
  const pathParts = pathname.split('/');
  const collectionAddress =
    pathParts.length >= 4 &&
    pathParts[1] === 'user' &&
    pathParts[2] === 'collections' &&
    pathParts[3] !== 'new'
      ? pathParts[3]
      : null;

  // Check if user is owner of the collection
  const { data: ownerData } = trpc.collection.getCollectionOwner.useQuery(
    { collectionAddress: collectionAddress || '' },
    {
      enabled: !!collectionAddress && !!userAddress,
    },
  );

  // Update ownership status when data changes
  useEffect(() => {
    if (ownerData && userAddress) {
      setIsOwner(ownerData.toLowerCase() === userAddress.toLowerCase());
      setIsLoading(false);
    } else if (!collectionAddress) {
      // Not on a collection page
      setIsOwner(false);
      setIsLoading(false);
    } else if (ownerData === undefined && collectionAddress) {
      // Still loading
      setIsLoading(true);
    } else {
      // No match or error
      setIsOwner(false);
      setIsLoading(false);
    }
  }, [ownerData, userAddress, collectionAddress]);

  // Get navigation links from the custom hook with ownership status
  const { links } = useNavigation({ isOwner });

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
      showUsername: true,
      showAddress: true,
      enableUsernameEdit: true,
    },
    breadcrumbs: {
      enabled: true,
    },
  };

  // Provide collection context to children
  const contextValue: CollectionContextType = {
    isOwner,
    collectionAddress,
    isLoading,
  };

  return (
    <CollectionContext.Provider value={contextValue}>
      <div className="bg-[#0A0A0A] navigation-container">
        <Navbar config={navbarConfig} className="mb-0 pb-0" />
        <Submenu links={links} className="mt-0 pt-0" isLoading={isLoading && !!collectionAddress} />
      </div>
      <div className="content-wrapper">
        <Container className="py-6 px-6 md:px-3 lg:px-6 mx-auto max-w-[84rem] flex-grow">
          <AuthGuard>{children}</AuthGuard>
        </Container>
      </div>
      <Footer />
    </CollectionContext.Provider>
  );
}
