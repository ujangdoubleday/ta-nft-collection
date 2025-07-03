'use client';

import React from 'react';
import { Container } from '@/components/core/layout/container';
import Link from 'next/link';
import { LogOut, Copy, Check, User, Slash } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAddress } from '@/lib/hooks/use-address';
import { useWallet } from '@/lib/hooks/wallet';
import { shortenAddress } from '@/lib/utils/formatting';
import { useRouter, usePathname } from 'next/navigation';
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

// Define the breadcrumb item type
interface BreadcrumbItem {
  href: string;
  label: string;
  isCurrentPage?: boolean;
}

export function UserNavbar() {
  const { data: address } = useAddress();
  const { disconnect } = useWallet();
  const router = useRouter();
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [collectionAddress, setCollectionAddress] = useState<string | null>(null);
  const [nftId, setNftId] = useState<string | null>(null);

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
    toast.info('Signing out...');
    await disconnect();
    toast.success('Signed out successfully');
    router.push('/');
  };

  const copyToClipboard = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
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
                      {address ? `user-${shortenAddress(address, 4)}` : 'Connecting...'}
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
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center p-2 rounded-full hover:bg-[#1f1f1f] transition-colors">
                <User className="h-6 w-6 text-white" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 p-2 bg-[#0A0A0A] border border-[#1f1f1f] text-white"
              >
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
          </div>
        </div>
      </Container>
    </div>
  );
}

export default UserNavbar;
