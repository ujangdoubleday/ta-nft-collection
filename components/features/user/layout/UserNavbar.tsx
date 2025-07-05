'use client';

import React from 'react';
import { Container } from '@/components/core/layout/container';
import Link from 'next/link';
import { LogOut, Copy, Check, User, Slash, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAddress } from '@/lib/hooks/use-address';
import { useWallet } from '@/lib/hooks/wallet';
import { shortenAddress } from '@/lib/utils/formatting';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { Logo } from '@/components/core/navigation/Logo';
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
} from '@/components/ui/molecules/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/molecules/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/atoms/input';
import { useTrpc } from '@/lib/hooks/use-trpc';
import { useQueryClient } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';

// Define the breadcrumb item type
interface BreadcrumbItem {
  href: string;
  label: string;
  isCurrentPage?: boolean;
}

export function UserNavbar() {
  const { data: address } = useAddress();
  const { disconnect } = useWallet();
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [collectionAddress, setCollectionAddress] = useState<string | null>(null);
  const [nftId, setNftId] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const trpc = useTrpc();
  const queryClient = useQueryClient();

  // Use React Query through TRPC to fetch username
  const { data: usernameData } = trpc.user.getUsername.useQuery(
    { address: address || '' },
    {
      enabled: !!address,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  const username = usernameData?.username || '';

  // Parse path to extract collection address and NFT ID
  useEffect(() => {
    const pathParts = pathname.split('/').filter((path) => path);

    // Reset state
    setCollectionAddress(null);
    setNftId(null);

    // Check for collection address
    if (pathParts.length >= 3 && pathParts[1] === 'collections' && pathParts[2] !== 'new') {
      setCollectionAddress(pathParts[2]);

      // Check for NFT ID
      if (pathParts.length >= 5 && pathParts[3] === 'nfts' && pathParts[4] !== 'mint') {
        setNftId(pathParts[4]);
      }
    }
  }, [pathname]);

  const handleLogout = async () => {
    signOut({ callbackUrl: '/' });
    await disconnect();
  };

  const copyToClipboard = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Use React Query mutation
  const setUsernameMutation = trpc.user.setUsername.useMutation({
    onSuccess: () => {
      toast.success('Username set successfully');
      setDialogOpen(false);
      // Invalidate username query to trigger a refetch
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

    setUsernameMutation.mutate({
      address,
      username: newUsername,
    });
  };

  // Generate simplified breadcrumbs based on current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [];

    // Only show breadcrumbs for collection address and NFT ID
    if (collectionAddress) {
      // Add collection address
      breadcrumbs.push({
        href: `/my/collections/${collectionAddress}`,
        label: collectionAddress,
      });

      // Add NFT ID if present
      if (nftId) {
        breadcrumbs.push({
          href: `/my/collections/${collectionAddress}/nfts/${nftId}`,
          label: `NFT #${nftId}`,
          isCurrentPage: true,
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="bg-[#0A0A0A] pt-2 w-full px-4 transition-all duration-300 navbar">
      <Container>
        <div className="flex justify-between">
          <div className="flex items-center">
            <Breadcrumb>
              <BreadcrumbList className="text-white">
                {/* Logo - always visible */}
                <BreadcrumbItem>
                  <BreadcrumbLink asChild className="text-white hover:text-white flex items-center">
                    <Link href="/my">
                      <Logo />
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator className="text-zinc-600">
                  <Slash />
                </BreadcrumbSeparator>

                {/* User address - always visible */}
                <BreadcrumbItem>
                  <BreadcrumbLink
                    asChild
                    className="text-white font-medium flex items-center gap-1.5"
                  >
                    <Link href="/my">
                      <User className="h-4 w-4 mr-1" />
                      {username ||
                        (address ? `user-${shortenAddress(address, 4)}` : 'Connecting...')}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                {/* Collection address and NFT ID - conditional */}
                {breadcrumbs.length > 0 && (
                  <BreadcrumbSeparator className="text-zinc-600">
                    <Slash />
                  </BreadcrumbSeparator>
                )}

                {breadcrumbs.map((crumb: BreadcrumbItem, index: number) => (
                  <React.Fragment key={crumb.href}>
                    <BreadcrumbItem>
                      {crumb.isCurrentPage ? (
                        <BreadcrumbPage className="text-white flex items-center gap-1.5">
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          asChild
                          className="text-white font-medium font-lg flex items-center gap-1.5"
                        >
                          <Link href={crumb.href}>{crumb.label}</Link>
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
          </div>

          <div className="flex items-center">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-center p-2 rounded-full hover:bg-[#1f1f1f] transition-colors">
                  <User className="h-6 w-6 text-white" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 p-2 bg-[#0A0A0A] border border-[#1f1f1f] text-white"
                >
                  <div className="px-3 py-2 mb-2">
                    <p className="text-sm text-gray-400 mb-1">Username</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">{username || 'Not set'}</span>
                      <DialogTrigger asChild>
                        <button
                          className="p-1.5 rounded hover:bg-[#1f1f1f] transition-colors"
                          title="Edit username"
                        >
                          <Edit className="h-4 w-4 text-gray-400" />
                        </button>
                      </DialogTrigger>
                    </div>
                  </div>
                  <div className="px-3 py-2 mb-2">
                    <p className="text-sm text-gray-400 mb-1">Wallet Address</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">
                        {address ? shortenAddress(address) : '0x...'}
                      </span>
                      <button
                        onClick={copyToClipboard}
                        className="p-1.5 rounded hover:bg-[#1f1f1f] transition-colors"
                        title="Copy address"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-white" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <hr className="my-2 border-[#1f1f1f]" />
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer hover:bg-[#1f1f1f] transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Disconnect Wallet</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DialogContent title="Set Username">
                <div className="py-4">
                  <p className="text-sm text-gray-400 mb-4">
                    Choose a username to display instead of your wallet address.
                  </p>
                  <Input
                    placeholder="Enter username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-[#1f1f1f] border-zinc-700"
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={setUsernameMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSetUsername} disabled={setUsernameMutation.isPending}>
                    {setUsernameMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default UserNavbar;
