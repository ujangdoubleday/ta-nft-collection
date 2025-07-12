'use client';

import React from 'react';
import { Container } from './Container';
import Link from 'next/link';
import { LogOut, Copy, Check, User, Slash, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAddress } from '@/lib/hooks/use-address';
import { useWallet } from '@/lib/hooks/wallet';
import { shortenAddress } from '@/lib/utils/formatting';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { Logo } from '@/components/features/layout/public/navigation/Logo';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTrpc } from '@/lib/hooks/use-trpc';
import { useQueryClient } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';
import Spinner from '@/components/ui/spinner';

// Types
export interface BreadcrumbItem {
  href: string;
  label: string;
  isCurrentPage?: boolean;
  icon?: React.ReactNode;
}

export interface NavbarAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
}

export interface NavbarConfig {
  // Logo configuration
  logo?: {
    component?: React.ReactNode;
    href?: string;
    showDefault?: boolean;
  };

  // User section configuration
  user?: {
    showUsername?: boolean;
    showAddress?: boolean;
    enableUsernameEdit?: boolean;
    usernamePrefix?: string;
    addressDisplayLength?: number;
    showAddressInDropdown?: boolean;
  };

  // Breadcrumb configuration
  breadcrumbs?: {
    enabled?: boolean;
    customBreadcrumbs?: BreadcrumbItem[];
    pathPatterns?: Array<{
      pattern: RegExp;
      generator: (pathname: string) => BreadcrumbItem[];
    }>;
  };

  // Actions configuration
  actions?: NavbarAction[];

  // Style configuration
  style?: {
    backgroundColor?: string;
    textColor?: string;
    hoverColor?: string;
    borderColor?: string;
    padding?: string;
  };

  // Callbacks
  onLogout?: () => void;
  onUsernameSave?: (username: string) => Promise<void>;
  onAddressCopy?: (address: string) => void;
}

// Default configuration
const DEFAULT_CONFIG: NavbarConfig = {
  logo: {
    showDefault: true,
    href: '/',
  },
  user: {
    showUsername: true,
    showAddress: true,
    enableUsernameEdit: true,
    usernamePrefix: 'user-',
    addressDisplayLength: 6,
  },
  breadcrumbs: {
    enabled: true,
  },
  style: {
    backgroundColor: '#0A0A0A',
    textColor: 'white',
    hoverColor: '#1f1f1f',
    borderColor: '#1f1f1f',
    padding: '16px',
  },
};

// Hook for breadcrumb generation
export const useBreadcrumbGenerator = (config: NavbarConfig) => {
  const pathname = usePathname();

  return useEffect(() => {
    // Custom breadcrumb logic can be implemented here
  }, [pathname, config]);
};

// Main Navbar Component
export interface NavbarProps {
  config?: NavbarConfig;
  className?: string;
}

export function Navbar({ config, className = '' }: NavbarProps) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const { data: address } = useAddress();
  const { disconnect } = useWallet();
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const trpc = useTrpc();
  const queryClient = useQueryClient();

  // Get username if enabled
  const { data: usernameData } = trpc.user.getUsername.useQuery(
    { address: address || '' },
    {
      enabled: !!address && mergedConfig.user?.showUsername,
      staleTime: 5 * 60 * 1000,
    },
  );

  const username = usernameData?.username || '';

  // Generate breadcrumbs
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    // If custom breadcrumbs are provided, use them
    if (mergedConfig.breadcrumbs?.customBreadcrumbs) {
      return mergedConfig.breadcrumbs.customBreadcrumbs;
    }

    // Use pattern-based generation
    if (mergedConfig.breadcrumbs?.pathPatterns) {
      for (const pattern of mergedConfig.breadcrumbs.pathPatterns) {
        if (pattern.pattern.test(pathname)) {
          return pattern.generator(pathname);
        }
      }
    }

    // Default breadcrumb generation (original logic)
    const breadcrumbs: BreadcrumbItem[] = [];
    const pathParts = pathname.split('/').filter((path) => path);

    // For debugging
    console.log('Current pathname:', pathname);
    console.log('Path parts:', pathParts);

    // For user collections
    if (pathname.startsWith('/user')) {
      if (
        pathParts.length >= 3 &&
        pathParts[0] === 'user' &&
        pathParts[1] === 'collections' &&
        pathParts[2] !== 'new'
      ) {
        const collectionAddress = pathParts[2];
        breadcrumbs.push({
          href: `/user/collections/${collectionAddress}`,
          label: collectionAddress,
          isCurrentPage: pathParts.length === 3,
        });

        // Add mint page breadcrumb
        if (pathParts.length >= 4 && pathParts[3] === 'mint') {
          breadcrumbs.push({
            href: `/user/collections/${collectionAddress}/mint`,
            label: 'Mint',
            isCurrentPage: true,
          });
        }
        // Add settings page breadcrumb
        else if (pathParts.length >= 4 && pathParts[3] === 'settings') {
          breadcrumbs.push({
            href: `/user/collections/${collectionAddress}/settings`,
            label: 'Settings',
            isCurrentPage: true,
          });
        }
        // Add NFT detail page breadcrumb
        else if (pathParts.length >= 5 && pathParts[3] === 'nfts' && pathParts[4]) {
          const nftId = pathParts[4];
          breadcrumbs.push({
            href: `/user/collections/${collectionAddress}/nfts/${nftId}`,
            label: `NFT #${nftId}`,
            isCurrentPage: true,
          });
        }
      }
    }

    // For admin collections
    if (pathname.startsWith('/admin')) {
      // Add Admin breadcrumb first
      breadcrumbs.push({
        href: '/admin',
        label: 'Admin',
        isCurrentPage: pathParts.length === 1,
      });

      // Directly check for admin collection pattern
      if (pathParts.length >= 3 && pathParts[0] === 'admin' && pathParts[1] === 'collections') {
        // Skip if it's the "new" collection page
        if (pathParts[2] !== 'new') {
          const collectionAddress = pathParts[2];
          breadcrumbs.push({
            href: `/admin/collections/${collectionAddress}`,
            label: collectionAddress,
            isCurrentPage: pathParts.length === 3,
          });

          // Add mint page breadcrumb
          if (pathParts.length >= 4 && pathParts[3] === 'mint') {
            breadcrumbs.push({
              href: `/admin/collections/${collectionAddress}/mint`,
              label: 'Mint',
              isCurrentPage: true,
            });
          }
          // Add settings page breadcrumb
          else if (pathParts.length >= 4 && pathParts[3] === 'settings') {
            breadcrumbs.push({
              href: `/admin/collections/${collectionAddress}/settings`,
              label: 'Settings',
              isCurrentPage: true,
            });
          }
          // Add NFT detail page breadcrumb
          else if (pathParts.length >= 5 && pathParts[3] === 'nfts' && pathParts[4]) {
            const nftId = pathParts[4];
            breadcrumbs.push({
              href: `/admin/collections/${collectionAddress}/nfts/${nftId}`,
              label: `NFT #${nftId}`,
              isCurrentPage: true,
            });
          }
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Handle logout
  const handleLogout = async () => {
    if (mergedConfig.onLogout) {
      mergedConfig.onLogout();
    } else {
      signOut({ callbackUrl: '/' });
      await disconnect();
    }
  };

  // Handle address copy
  const copyToClipboard = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);

      if (mergedConfig.onAddressCopy) {
        mergedConfig.onAddressCopy(address);
      } else {
        toast.success('Address copied to clipboard');
      }

      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle username save
  const setUsernameMutation = trpc.user.setUsername.useMutation({
    onSuccess: () => {
      toast.success('Username set successfully');
      setDialogOpen(false);
      queryClient.invalidateQueries({
        queryKey: [['user', 'getUsername'], { input: { address } }],
      });
    },
    onError: () => {
      toast.error('Failed to set username');
    },
  });

  const handleSetUsername = async () => {
    if (!address) {
      toast.error('Wallet not connected');
      return;
    }

    if (newUsername.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    if (mergedConfig.onUsernameSave) {
      try {
        await mergedConfig.onUsernameSave(newUsername);
        setDialogOpen(false);
      } catch (error) {
        toast.error('Failed to set username');
      }
    } else {
      setUsernameMutation.mutate({
        address,
        username: newUsername,
      });
    }
  };

  const displayUsername =
    username ||
    (address ? `${mergedConfig.user?.usernamePrefix || 'user-'}${shortenAddress(address, 4)}` : '');

  return (
    <div
      className={`w-full -mt-2 transition-all duration-300 navbar ${className}`}
      style={{
        backgroundColor: mergedConfig.style?.backgroundColor,
        padding: mergedConfig.style?.padding,
      }}
    >
      <Container>
        <div className="flex justify-between">
          <div className="flex items-center">
            {mergedConfig.breadcrumbs?.enabled && (
              <Breadcrumb>
                <BreadcrumbList style={{ color: mergedConfig.style?.textColor }}>
                  {/* Logo */}
                  {mergedConfig.logo?.showDefault && (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          asChild
                          className="flex items-center"
                          style={{ color: mergedConfig.style?.textColor }}
                        >
                          <Link href={mergedConfig.logo?.href || '/'}>
                            {mergedConfig.logo?.component || <Logo linkDisabled={true} />}
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="text-zinc-600">
                        <Slash />
                      </BreadcrumbSeparator>
                    </>
                  )}

                  {/* User section */}
                  {(mergedConfig.user?.showUsername || mergedConfig.user?.showAddress) && (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          asChild
                          className="font-medium flex items-center gap-1.5"
                          style={{ color: mergedConfig.style?.textColor }}
                        >
                          <Link href="/user">
                            <User className="h-4 w-4 mr-1" />
                            {displayUsername}
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>

                      {breadcrumbs.length > 0 && (
                        <BreadcrumbSeparator className="text-zinc-600">
                          <Slash />
                        </BreadcrumbSeparator>
                      )}
                    </>
                  )}

                  {/* Dynamic breadcrumbs */}
                  {breadcrumbs.map((crumb: BreadcrumbItem, index: number) => (
                    <React.Fragment key={crumb.href}>
                      <BreadcrumbItem>
                        {crumb.isCurrentPage ? (
                          <BreadcrumbPage
                            className="flex items-center gap-1.5"
                            style={{ color: mergedConfig.style?.textColor }}
                          >
                            {crumb.icon}
                            {crumb.label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            asChild
                            className="font-medium flex items-center gap-1.5"
                            style={{ color: mergedConfig.style?.textColor }}
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
                          <Slash />
                        </BreadcrumbSeparator>
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Custom actions */}
            {mergedConfig.actions?.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={() => action.onClick()}
                className="flex items-center gap-2"
              >
                {action.icon}
                {action.label}
              </Button>
            ))}

            {/* User dropdown */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex items-center justify-center p-2 rounded-full transition-colors"
                  style={{
                    color: mergedConfig.style?.textColor,
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      mergedConfig.style?.hoverColor || '#1f1f1f';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <User className="h-6 w-6" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 p-2"
                  style={{
                    backgroundColor: mergedConfig.style?.backgroundColor,
                    borderColor: mergedConfig.style?.borderColor,
                    color: mergedConfig.style?.textColor,
                  }}
                >
                  {mergedConfig.user?.showUsername && (
                    <div className="px-3 py-2 mb-2">
                      <p className="text-sm opacity-60 mb-1">Username</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm">{username || 'Not set'}</span>
                        {mergedConfig.user?.enableUsernameEdit && (
                          <DialogTrigger asChild>
                            <button
                              className="p-1.5 rounded transition-colors"
                              style={{ backgroundColor: 'transparent' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  mergedConfig.style?.hoverColor || '#1f1f1f';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              title="Edit username"
                            >
                              <Edit className="h-4 w-4 opacity-60" />
                            </button>
                          </DialogTrigger>
                        )}
                      </div>
                    </div>
                  )}

                  {(mergedConfig.user?.showAddress || mergedConfig.user?.showAddressInDropdown) && (
                    <div className="px-3 py-2 mb-2">
                      <p className="text-sm opacity-60 mb-1">Wallet Address</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm">
                          {address
                            ? shortenAddress(address, mergedConfig.user?.addressDisplayLength)
                            : '0x...'}
                        </span>
                        <button
                          onClick={() => copyToClipboard()}
                          className="p-1.5 rounded transition-colors"
                          style={{ backgroundColor: 'transparent' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              mergedConfig.style?.hoverColor || '#1f1f1f';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="Copy address"
                        >
                          {copied ? (
                            <Check
                              className="h-4 w-4"
                              style={{ color: mergedConfig.style?.textColor }}
                            />
                          ) : (
                            <Copy className="h-4 w-4 opacity-60" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <hr style={{ borderColor: mergedConfig.style?.borderColor }} className="my-2" />

                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer transition-colors"
                    onClick={() => handleLogout()}
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        mergedConfig.style?.hoverColor || '#1f1f1f';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Disconnect Wallet</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {mergedConfig.user?.enableUsernameEdit && (
                <DialogContent
                  title="Set Username"
                  className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-md"
                >
                  <div className="py-4">
                    <p className="text-sm opacity-60 mb-4">
                      Choose a username to display instead of your wallet address.
                    </p>
                    <Input
                      placeholder="Enter username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1f1f1f] rounded-md py-2 px-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      disabled={setUsernameMutation.isPending}
                      className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-md py-2 px-3 text-white placeholder:text-zinc-500 focus:outline-none hover:bg-[#1f1f1f] hover:border-zinc-600 focus:ring-1 focus:ring-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleSetUsername()}
                      disabled={setUsernameMutation.isPending}
                    >
                      {setUsernameMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              )}
            </Dialog>
          </div>
        </div>
      </Container>
    </div>
  );
}

// Utility function to create custom breadcrumb generators
export const createBreadcrumbPattern = (
  pattern: RegExp,
  generator: (pathname: string) => BreadcrumbItem[],
) => ({
  pattern,
  generator,
});

// Export the original component as well for backward compatibility
export const UserNavbar = () => <Navbar />;

export default Navbar;
