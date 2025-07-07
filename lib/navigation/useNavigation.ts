import React from 'react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  mainNavigationLinks,
  adminNavigationLinks,
  createCollectionNavigationLinks,
} from './configs';
import {
  User,
  GalleryVertical,
  Images,
  ImagePlus,
  Home,
  LayoutGrid,
  PenTool,
  Settings,
} from 'lucide-react';
import { NavigationLink } from '@/components/features/layout/core/Submenu';

export interface UseNavigationReturn {
  links: NavigationLink[];
  isCollectionPage: boolean;
  collectionAddress: string | null;
}

export function useNavigation(): UseNavigationReturn {
  const pathname = usePathname();
  const [collectionAddress, setCollectionAddress] = useState<string | null>(null);

  useEffect(() => {
    const pathParts = pathname.split('/');
    if (
      pathParts.length >= 4 &&
      pathParts[1] === 'my' &&
      pathParts[2] === 'collections' &&
      pathParts[3] !== 'new'
    ) {
      setCollectionAddress(pathParts[3]);
    } else {
      setCollectionAddress(null);
    }
  }, [pathname]);

  const links = collectionAddress
    ? createCollectionNavigationLinks(collectionAddress)
    : mainNavigationLinks;

  return {
    links,
    isCollectionPage: !!collectionAddress,
    collectionAddress,
  };
}

// Admin navigation hook
export function useAdminNavigation(): UseNavigationReturn {
  const pathname = usePathname();
  // Admin doesn't need collection address handling for now
  // We can add it later if needed for admin collection detail pages

  return {
    links: adminNavigationLinks,
    isCollectionPage: false,
    collectionAddress: null,
  };
}

// Alternative: Simple hook for custom navigation
export function useCustomNavigation(customLinks: NavigationLink[]) {
  return {
    links: customLinks,
    isCollectionPage: false,
    collectionAddress: null,
  };
}

// Helper functions for creating navigation links safely
export const createNavLink = (
  href: string,
  label: string,
  IconComponent: React.ComponentType<{ className?: string }>,
  isActive?: (pathname: string) => boolean,
): NavigationLink => ({
  href,
  label,
  icon: React.createElement(IconComponent, { className: 'h-4 w-4' }),
  isActive: isActive ? (pathname) => isActive(pathname) : undefined,
});

// Example usage with helper function
export const safeMainNavigationLinks: NavigationLink[] = [
  createNavLink('/my', 'Overview', Home, (pathname) => pathname === '/my'),
  createNavLink('/my/collections', 'Collections', GalleryVertical, (pathname) => {
    if (pathname === '/my/collections/new') return false;
    return pathname === '/my/collections' || pathname.startsWith('/my/collections/');
  }),
  createNavLink(
    '/my/collections/new',
    'Create Collections',
    ImagePlus,
    (pathname) => pathname === '/my/collections/new',
  ),
  createNavLink('/my/nfts', 'NFTs', Images),
];
