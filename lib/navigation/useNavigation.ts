'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  mainNavigationLinks,
  adminNavigationLinks,
  createCollectionNavigationLinks,
  createAdminCollectionNavigationLinks,
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

export interface UseNavigationProps {
  isOwner?: boolean;
}

export function useNavigation(props?: UseNavigationProps): UseNavigationReturn {
  const { isOwner = false } = props || {};
  const pathname = usePathname();
  const [collectionAddress, setCollectionAddress] = useState<string | null>(null);

  useEffect(() => {
    const pathParts = pathname.split('/');
    if (
      pathParts.length >= 4 &&
      pathParts[1] === 'user' &&
      pathParts[2] === 'collections' &&
      pathParts[3] !== 'new'
    ) {
      setCollectionAddress(pathParts[3]);
    } else {
      setCollectionAddress(null);
    }
  }, [pathname]);

  // Filter collection navigation links based on ownership status
  const links = collectionAddress
    ? createCollectionNavigationLinks(collectionAddress, isOwner)
    : mainNavigationLinks;

  return {
    links,
    isCollectionPage: !!collectionAddress,
    collectionAddress,
  };
}

// Updated admin navigation hook
export function useAdminNavigation(props?: UseNavigationProps): UseNavigationReturn {
  const { isOwner = false } = props || {};
  const pathname = usePathname();
  const [collectionAddress, setCollectionAddress] = useState<string | null>(null);

  useEffect(() => {
    const pathParts = pathname.split('/');

    if (
      pathParts.length >= 4 &&
      pathParts[1] === 'admin' &&
      pathParts[2] === 'collections' &&
      pathParts[3] !== 'new' &&
      pathParts[3] !== ''
    ) {
      const addressToUse = pathParts[3];
      setCollectionAddress(addressToUse);
    } else {
      setCollectionAddress(null);
    }
  }, [pathname]);

  // Filter admin collection navigation links based on ownership status
  const links = collectionAddress
    ? createAdminCollectionNavigationLinks(collectionAddress, isOwner)
    : adminNavigationLinks;

  return {
    links,
    isCollectionPage: !!collectionAddress,
    collectionAddress,
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
  createNavLink('/user', 'Overview', Home, (pathname) => pathname === '/user'),
  createNavLink('/user/collections', 'Collections', GalleryVertical, (pathname) => {
    if (pathname === '/user/collections/new') return false;
    return pathname === '/user/collections' || pathname.startsWith('/user/collections/');
  }),
  createNavLink(
    '/user/collections/new',
    'Create Collections',
    ImagePlus,
    (pathname) => pathname === '/user/collections/new',
  ),
  createNavLink('/user/nfts', 'NFTs', Images),
];

// Helper function untuk debugging
export const debugNavigation = (pathname: string, isOwner: boolean) => {
  const pathParts = pathname.split('/');
  console.log('Debug Navigation:', {
    pathname,
    pathParts,
    isOwner,
    isAdmin: pathParts[1] === 'admin',
    isCollections: pathParts[2] === 'collections',
    address: pathParts[3],
    isValidAddress: pathParts[3] !== 'new' && pathParts[3] !== '',
  });
};
