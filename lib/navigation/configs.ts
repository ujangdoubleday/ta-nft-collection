import React from 'react';
import {
  User,
  GalleryVertical,
  Images,
  ImagePlus,
  Home,
  LayoutGrid,
  PenTool,
  Settings,
  Users,
  ShieldAlert,
  Banknote,
} from 'lucide-react';
import { NavigationLink } from '@/components/features/layout/core/Submenu';

// Main navigation links
export const mainNavigationLinks: NavigationLink[] = [
  {
    href: '/user',
    label: 'Overview',
    icon: React.createElement(Home, { className: 'h-4 w-4' }),
    isActive: (pathname) => pathname === '/user',
  },
  {
    href: '/user/collections',
    label: 'Collections',
    icon: React.createElement(GalleryVertical, { className: 'h-4 w-4' }),
    isActive: (pathname) => {
      if (pathname === '/user/collections/new') return false;
      return pathname === '/user/collections' || pathname.startsWith('/user/collections/');
    },
  },
  {
    href: '/user/collections/new',
    label: 'Create Collections',
    icon: React.createElement(ImagePlus, { className: 'h-4 w-4' }),
    isActive: (pathname) => pathname === '/user/collections/new',
  },
  {
    href: '/user/nfts',
    label: 'NFTs',
    icon: React.createElement(Images, { className: 'h-4 w-4' }),
    isActive: (pathname) => pathname === '/user/nfts' || pathname.startsWith('/user/nfts/'),
  },
];

// Admin navigation links
export const adminNavigationLinks: NavigationLink[] = [
  {
    href: '/admin',
    label: 'Overview',
    icon: React.createElement(Home, { className: 'h-4 w-4' }),
    isActive: (pathname) => pathname === '/admin',
  },
  {
    href: '/admin/collections',
    label: 'All Collections',
    icon: React.createElement(GalleryVertical, { className: 'h-4 w-4' }),
    isActive: (pathname) => {
      if (pathname === '/admin/collections/new') return false;
      return pathname === '/admin/collections' || pathname.startsWith('/admin/collections/');
    },
  },
  {
    href: '/admin/nfts',
    label: 'All NFTs',
    icon: React.createElement(Images, { className: 'h-4 w-4' }),
    isActive: (pathname) => pathname === '/admin/nfts' || pathname.startsWith('/admin/nfts/'),
  },
  {
    href: '/admin/users',
    label: 'Users',
    icon: React.createElement(Users, { className: 'h-4 w-4' }),
    isActive: (pathname) => pathname === '/admin/users' || pathname.startsWith('/admin/users/'),
  },
  {
    href: '/admin/fees',
    label: 'Fees',
    icon: React.createElement(Banknote, { className: 'h-4 w-4' }),
    isActive: (pathname) => pathname === '/admin/fees' || pathname.startsWith('/admin/fees/'),
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: React.createElement(Settings, { className: 'h-4 w-4' }),
    isActive: (pathname) =>
      pathname === '/admin/settings' || pathname.startsWith('/admin/settings/'),
  },
  {
    href: '/admin/emergency',
    label: 'Emergency Actions',
    icon: React.createElement(ShieldAlert, { className: 'h-4 w-4' }),
    isActive: (pathname) =>
      pathname === '/admin/emergency' || pathname.startsWith('/admin/emergency/'),
  },
];

// Collection specific navigation links generator
export const createCollectionNavigationLinks = (collectionAddress: string): NavigationLink[] => {
  // Semua link ditampilkan tanpa memperhatikan apakah user adalah owner atau tidak
  return [
    {
      href: `/user/collections/${collectionAddress}`,
      label: 'Details',
      icon: React.createElement(LayoutGrid, { className: 'h-4 w-4' }),
      isActive: (pathname) => pathname === `/user/collections/${collectionAddress}`,
    },
    {
      href: `/user/collections/${collectionAddress}/nfts`,
      label: 'NFTs',
      icon: React.createElement(Images, { className: 'h-4 w-4' }),
      isActive: (pathname) => pathname.includes('/nfts') && !pathname.includes('/mint'),
    },
    {
      href: `/user/collections/${collectionAddress}/mint`,
      label: 'Mint NFT',
      icon: React.createElement(PenTool, { className: 'h-4 w-4' }),
      isActive: (pathname) => pathname.includes('/mint'),
    },
    {
      href: `/user/collections/${collectionAddress}/settings`,
      label: 'Settings',
      icon: React.createElement(Settings, { className: 'h-4 w-4' }),
      isActive: (pathname) => pathname.includes('/settings'),
    },
  ];
};

// Admin collection specific navigation links generator
export const createAdminCollectionNavigationLinks = (
  collectionAddress: string,
): NavigationLink[] => {
  // Semua link ditampilkan tanpa memperhatikan apakah admin adalah owner atau tidak
  return [
    {
      href: `/admin/collections/${collectionAddress}`,
      label: 'Details',
      icon: React.createElement(LayoutGrid, { className: 'h-4 w-4' }),
      isActive: (pathname) => pathname === `/admin/collections/${collectionAddress}`,
    },
    {
      href: `/admin/collections/${collectionAddress}/nfts`,
      label: 'NFTs',
      icon: React.createElement(Images, { className: 'h-4 w-4' }),
      isActive: (pathname) => pathname.includes('/nfts') && !pathname.includes('/mint'),
    },
    {
      href: `/admin/collections/${collectionAddress}/mint`,
      label: 'Mint NFT',
      icon: React.createElement(PenTool, { className: 'h-4 w-4' }),
      isActive: (pathname) => pathname.includes('/mint'),
    },
    {
      href: `/admin/collections/${collectionAddress}/settings`,
      label: 'Settings',
      icon: React.createElement(Settings, { className: 'h-4 w-4' }),
      isActive: (pathname) => pathname.includes('/settings'),
    },
  ];
};

// Test function untuk debugging - minimal logging
export const testAdminCollectionLinks = (address: string) => {
  const links = createAdminCollectionNavigationLinks(address);
  return links;
};
