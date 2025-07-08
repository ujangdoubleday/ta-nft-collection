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
    href: '/my',
    label: 'Overview',
    icon: React.createElement(Home, { className: 'h-4 w-4' }),
    isActive: (pathname) => pathname === '/my',
  },
  {
    href: '/my/collections',
    label: 'Collections',
    icon: React.createElement(GalleryVertical, { className: 'h-4 w-4' }),
    isActive: (pathname) => {
      if (pathname === '/my/collections/new') return false;
      return pathname === '/my/collections' || pathname.startsWith('/my/collections/');
    },
  },
  {
    href: '/my/collections/new',
    label: 'Create Collections',
    icon: React.createElement(ImagePlus, { className: 'h-4 w-4' }),
    isActive: (pathname) => pathname === '/my/collections/new',
  },
  {
    href: '/my/nfts',
    label: 'NFTs',
    icon: React.createElement(Images, { className: 'h-4 w-4' }),
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
    icon: React.createElement(Images, { className: 'h-4 w-4' }),
    isActive: (pathname) => {
      if (pathname === '/admin/collections/new') return false;
      return pathname === '/admin/collections' || pathname.startsWith('/admin/collections/');
    },
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
export const createCollectionNavigationLinks = (collectionAddress: string): NavigationLink[] => [
  {
    href: `/my/collections/${collectionAddress}`,
    label: 'Details',
    icon: React.createElement(LayoutGrid, { className: 'h-4 w-4' }),
    isActive: (pathname) => pathname === `/my/collections/${collectionAddress}`,
  },
  {
    href: `/my/collections/${collectionAddress}/mint`,
    label: 'Mint NFT',
    icon: React.createElement(PenTool, { className: 'h-4 w-4' }),
    isActive: (pathname) => pathname.includes('/mint'),
  },
  {
    href: `/my/collections/${collectionAddress}/nfts`,
    label: 'NFTs',
    icon: React.createElement(Images, { className: 'h-4 w-4' }),
    isActive: (pathname) => pathname.includes('/nfts') && !pathname.includes('/mint'),
  },
  {
    href: `/my/collections/${collectionAddress}/settings`,
    label: 'Settings',
    icon: React.createElement(Settings, { className: 'h-4 w-4' }),
    isActive: (pathname) => pathname.includes('/settings'),
  },
];
