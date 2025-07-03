'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  GalleryVertical,
  Images,
  ImagePlus,
  Home,
  Copy,
  Check,
  LogOut,
  Settings,
  LayoutGrid,
  PenTool,
} from 'lucide-react';
import { Container } from '@/components/core/layout/container';
import { useState, useEffect } from 'react';
import { Logo } from '@/components/core/navigation/Logo';
import { useAddress } from '@/lib/hooks/use-address';
import { useWallet } from '@/lib/hooks/wallet';
import { shortenAddress } from '@/lib/utils/formatting';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/molecules/dropdown-menu';

export function UserSubmenu() {
  const pathname = usePathname();
  const { data: address } = useAddress();
  const { disconnect } = useWallet();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const [hoverBg, setHoverBg] = useState<{ left: number; width: number } | null>(null);
  const [collectionAddress, setCollectionAddress] = useState<string | null>(null);

  // Check if we're in a specific collection page
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

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const linkEl = e.currentTarget;
    const parentEl = navRef.current;
    if (!linkEl || !parentEl) return;

    const { left: parentLeft } = parentEl.getBoundingClientRect();
    const { left, width } = linkEl.getBoundingClientRect();
    setHoverBg({ left: left - parentLeft, width });
  };

  const handleMouseLeave = () => {
    setHoverBg(null);
  };

  // Default main navigation links
  const mainLinks = [
    {
      href: '/my',
      label: 'Overview',
      icon: <Home className="h-4 w-4" />,
    },
    {
      href: '/my/collections',
      label: 'Collections',
      icon: <GalleryVertical className="h-4 w-4" />,
    },
    {
      href: '/my/collections/new',
      label: 'Create Collections',
      icon: <ImagePlus className="h-4 w-4" />,
    },
    {
      href: '/my/nfts',
      label: 'NFTs',
      icon: <Images className="h-4 w-4" />,
    },
  ];

  // Collection specific submenu links
  const collectionLinks = collectionAddress
    ? [
        {
          href: `/my/collections/${collectionAddress}`,
          label: 'Details',
          icon: <LayoutGrid className="h-4 w-4" />,
        },
        {
          href: `/my/collections/${collectionAddress}/mint`,
          label: 'Mint NFT',
          icon: <PenTool className="h-4 w-4" />,
        },
        {
          href: `/my/collections/${collectionAddress}/nfts`,
          label: 'NFTs',
          icon: <Images className="h-4 w-4" />,
        },
        {
          href: `/my/collections/${collectionAddress}/settings`,
          label: 'Settings',
          icon: <Settings className="h-4 w-4" />,
        },
      ]
    : [];

  // Choose which links to display based on the current path
  const links = collectionAddress ? collectionLinks : mainLinks;

  // Function to check if link is active with proper path matching
  const isLinkActive = (href: string) => {
    // For dashboard, only active if pathname is exactly '/my'
    if (href === '/my') {
      return pathname === '/my';
    }

    // Special case for collections/new - don't highlight collections when on new page
    if (href === '/my/collections' && pathname === '/my/collections/new') {
      return false;
    }

    // Special case for the Create Collections link
    if (href === '/my/collections/new') {
      return pathname === '/my/collections/new';
    }

    // For collection-specific pages
    if (collectionAddress) {
      if (href.includes('/nfts/mint')) {
        return pathname.includes('/nfts/mint');
      }

      if (href.includes('/nfts') && !pathname.includes('/nfts/mint')) {
        return pathname.includes('/nfts') && !pathname.includes('/nfts/mint');
      }

      if (href.includes('/settings')) {
        return pathname.includes('/settings');
      }

      // For the main collection details page
      if (href === `/my/collections/${collectionAddress}`) {
        return pathname === `/my/collections/${collectionAddress}`;
      }
    }

    // For other links, check if pathname starts with the href
    return pathname === href || (pathname.startsWith(`${href}/`) && href !== '/my/collections/new');
  };

  return (
    <div className="submenu bg-[#0A0A0A] border-b border-[#1f1f1f] w-full px-4 h-10 transition-all duration-300">
      <Container>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="submenu-logo flex-shrink-0 flex items-center opacity-0 transition-opacity duration-300">
              <Logo />
            </div>

            <nav
              ref={navRef}
              className="relative gap-2 flex items-center overflow-x-auto transition-all duration-300"
              onMouseLeave={handleMouseLeave}
            >
              {/* Hover effect background */}
              {hoverBg && (
                <span
                  className="absolute top-0 h-full bg-[#1f1f1f] rounded transition-all duration-200 ease-in-out z-0"
                  style={{
                    left: hoverBg.left,
                    width: hoverBg.width,
                  }}
                />
              )}

              {/* Links */}
              {links.map((link) => {
                const isActive = isLinkActive(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onMouseEnter={handleMouseEnter}
                    className={`relative z-10 text-sm font-mb font-sans inline-flex items-center gap-2 transition-all duration-300 px-2 ${
                      isActive
                        ? 'text-white border-b-2 border-white mt-[0.57rem] pb-[0.57rem]'
                        : 'text-gray-400 hover:text-white hover:bg-[#1f1f1f] rounded py-1'
                    }`}
                  >
                    <span className="flex-shrink-0">{link.icon}</span>
                    <span className="whitespace-nowrap">{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="submenu-user flex-shrink-0 flex items-center opacity-0 transition-opacity duration-300">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center p-2 rounded-full hover:bg-[#1f1f1f] transition-colors">
                <User className="h-6 w-6 text-white" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 p-2 bg-[#0A0A0A] border border-[#1f1f1f] text-white z-50"
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

export default UserSubmenu;
