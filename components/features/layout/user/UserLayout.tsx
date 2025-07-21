'use client';

import React from 'react';
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
import { Menu, X, User, Slash, LogOut, Copy, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { Logo } from '@/components/features/layout/public/navigation/Logo';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { shortenAddress } from '@/lib/utils/formatting';
import { useWallet } from '@/lib/hooks/wallet';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { disconnect } = useWallet();
  const [copied, setCopied] = useState(false);

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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Animation variants for the menu icon
  const topBarVariants = {
    open: { rotate: 45, y: 7 },
    closed: { rotate: 0, y: 0 },
  };

  const middleBarVariants = {
    open: { opacity: 0 },
    closed: { opacity: 1 },
  };

  const bottomBarVariants = {
    open: { rotate: -45, y: -5 },
    closed: { rotate: 0, y: 0 },
  };

  // Generate breadcrumbs
  const generateBreadcrumbs = () => {
    const breadcrumbs = [];

    // Add User breadcrumb
    breadcrumbs.push({
      href: '/user',
      label: 'User',
      icon: <User className="h-4 w-4 mr-1" />,
      isCurrentPage: pathname === '/user',
    });

    // For user collections
    if (pathname.startsWith('/user/collections')) {
      if (collectionAddress) {
        breadcrumbs.push({
          href: `/user/collections/${collectionAddress}`,
          label: shortenAddress(collectionAddress, 6),
          isCurrentPage: pathname === `/user/collections/${collectionAddress}`,
        });

        // Add NFT detail page breadcrumb
        if (pathname.includes('/nfts/')) {
          const nftId = pathname.split('/').pop();
          breadcrumbs.push({
            href: pathname,
            label: `NFT #${nftId}`,
            isCurrentPage: true,
          });
        }

        // Add settings page breadcrumb
        if (pathname.includes('/settings')) {
          breadcrumbs.push({
            href: pathname,
            label: 'Settings',
            isCurrentPage: true,
          });
        }

        // Add mint page breadcrumb
        if (pathname.includes('/mint')) {
          breadcrumbs.push({
            href: pathname,
            label: 'Mint',
            isCurrentPage: true,
          });
        }
      } else if (pathname.includes('/new')) {
        breadcrumbs.push({
          href: '/user/collections/new',
          label: 'New Collection',
          isCurrentPage: true,
        });
      } else {
        breadcrumbs.push({
          href: '/user/collections',
          label: 'Collections',
          isCurrentPage: true,
        });
      }
    } else if (pathname.includes('/nfts')) {
      breadcrumbs.push({
        href: '/user/nfts',
        label: 'NFTs',
        isCurrentPage: true,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Navbar configuration without breadcrumbs for mobile
  const navbarConfig = {
    logo: {
      showDefault: false, // We'll handle the logo manually
    },
    user: {
      showUsername: false, // Hide username on mobile
      showAddress: false, // Hide address on mobile
      enableUsernameEdit: true,
    },
    breadcrumbs: {
      enabled: false, // We'll handle breadcrumbs manually
    },
  };

  // Provide collection context to children
  const contextValue: CollectionContextType = {
    isOwner,
    collectionAddress,
    isLoading,
  };

  // Handle logout
  const handleLogout = async () => {
    toast.info('Signing out...');
    await disconnect();
    toast.success('Signed out successfully');
    window.location.href = '/';
  };

  // Copy address to clipboard
  const copyToClipboard = async (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent event bubbling
    e.preventDefault();
    e.stopPropagation();

    if (userAddress) {
      try {
        await navigator.clipboard.writeText(userAddress);
        setCopied(true);
        toast.success('Address copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = userAddress;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
          setCopied(true);
          toast.success('Address copied to clipboard');
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          toast.error('Failed to copy address');
          console.error('Failed to copy: ', err);
        }

        document.body.removeChild(textArea);
      }
    }
  };

  return (
    <CollectionContext.Provider value={contextValue}>
      <div className="bg-[#0A0A0A] navigation-container">
        {/* Custom mobile navbar */}
        <div className="md:hidden relative" style={{ zIndex: 10000 }}>
          <Container>
            <div className="flex items-center justify-between py-4">
              {/* Hamburger menu on the left */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center justify-center focus:outline-none relative z-[10001]"
                aria-label="Toggle menu"
                style={{ background: 'transparent' }}
              >
                <div className="w-6 h-5 flex flex-col justify-between">
                  <motion.span
                    className="w-full h-0.5 bg-white rounded-full"
                    variants={topBarVariants}
                    animate={isMobileMenuOpen ? 'open' : 'closed'}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.span
                    className="w-full h-0.5 bg-white rounded-full"
                    variants={middleBarVariants}
                    animate={isMobileMenuOpen ? 'open' : 'closed'}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.span
                    className="w-full h-0.5 bg-white rounded-full"
                    variants={bottomBarVariants}
                    animate={isMobileMenuOpen ? 'open' : 'closed'}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </button>

              {/* Logo in the center */}
              <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
                <Logo linkDisabled={false} />
              </div>

              {/* User icon on the right with dropdown */}
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center justify-center focus:outline-none">
                    <User className="h-6 w-6 text-white" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 p-2 bg-[#0A0A0A] border border-[#1f1f1f] text-white shadow-lg"
                    style={{ zIndex: 10002, backdropFilter: 'none' }}
                    sideOffset={5}
                  >
                    {userAddress && (
                      <div className="px-3 py-2 mb-2">
                        <p className="text-sm opacity-60 mb-1">Wallet Address</p>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm">
                            {shortenAddress(userAddress, 6)}
                          </span>
                          <button
                            onClick={(e) => copyToClipboard(e)}
                            onTouchEnd={(e) => copyToClipboard(e)}
                            className="p-1.5 rounded transition-colors hover:bg-[#1f1f1f] active:bg-[#2f2f2f]"
                            title="Copy address"
                            type="button"
                          >
                            {copied ? (
                              <Check className="h-4 w-4 text-white" />
                            ) : (
                              <Copy className="h-4 w-4 opacity-60" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <hr className="border-[#1f1f1f] my-2" />

                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer transition-colors hover:bg-[#1f1f1f]"
                      onClick={() => handleLogout()}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Disconnect Wallet</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Container>

          {/* Breadcrumbs below navbar on mobile - Improved scrollability */}
          <Container className="pb-2 px-2 border-b border-[#1f1f1f] overflow-x-auto">
            <Breadcrumb>
              <BreadcrumbList className="text-white whitespace-nowrap">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.href}>
                    <BreadcrumbItem>
                      {crumb.isCurrentPage ? (
                        <BreadcrumbPage className="flex items-center gap-1.5 text-sm">
                          {crumb.icon}
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          asChild
                          className="font-medium flex items-center gap-1.5 text-sm"
                        >
                          <Link href={crumb.href}>
                            {crumb.icon}
                            {crumb.label}
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator className="text-zinc-600">
                        <Slash className="h-4 w-4" />
                      </BreadcrumbSeparator>
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </Container>
        </div>

        {/* Desktop navbar */}
        <div className="hidden md:block">
          <Navbar
            config={{
              logo: {
                showDefault: true,
                href: '/',
              },
              user: {
                showUsername: false,
                showAddress: true,
                enableUsernameEdit: false,
              },
              breadcrumbs: {
                enabled: true,
              },
            }}
            className="mb-0 pb-0"
          />
        </div>

        {/* Desktop Submenu - Hidden on mobile */}
        <div className="hidden md:block">
          <Submenu
            links={links}
            className="mt-0 pt-0"
            isLoading={isLoading && !!collectionAddress}
          />
        </div>

        {/* Mobile Menu - Content-only overlay - Improved animation and accessibility */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="fixed bg-[#0A0A0A] backdrop-blur-lg z-[9999] flex items-center justify-center md:hidden"
              style={{
                position: 'fixed',
                top: '4rem', // Start below navbar (navbar height is 4rem)
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: 'calc(100vh - 4rem)', // Subtract navbar height
              }}
              initial={{ opacity: 0, x: '-100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '-100%' }}
              transition={{ duration: 0.2 }}
            >
              <motion.nav className="flex flex-col items-center justify-center w-full h-full overflow-y-auto">
                {links.map((link, index) => {
                  const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

                  return (
                    <div
                      key={link.href}
                      className="w-full text-center py-4"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link
                        href={link.href}
                        className={`text-xl sm:text-2xl font-medium flex items-center justify-center gap-3 ${
                          isActive ? 'text-white' : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        <span className="text-xl">{link.icon}</span>
                        <span>{link.label}</span>
                      </Link>
                    </div>
                  );
                })}
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="content-wrapper">
        <Container className="py-4 sm:py-6 px-3 sm:px-4 md:px-6 mx-auto max-w-full sm:max-w-[84rem] flex-grow">
          <AuthGuard>{children}</AuthGuard>
        </Container>
      </div>
      <Footer />
    </CollectionContext.Provider>
  );
}
