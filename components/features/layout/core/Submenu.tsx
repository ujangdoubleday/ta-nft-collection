'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Copy, Check, LogOut } from 'lucide-react';
import { Container } from './Container';
import { useState, useRef, ReactNode } from 'react';
import { Logo } from '@/components/features/layout/public/navigation/Logo';
import { useAddress } from '@/lib/hooks/use-address';
import { useWallet } from '@/lib/hooks/wallet';
import { shortenAddress } from '@/lib/utils/formatting';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Types for better type safety
export interface NavigationLink {
  href: string;
  label: string;
  icon: ReactNode;
  isActive?: (pathname: string) => boolean;
}

export interface SubmenuProps {
  links: NavigationLink[];
  showLogo?: boolean;
  showUserDropdown?: boolean;
  logoComponent?: ReactNode;
  onLogout?: () => void | Promise<void>;
  className?: string;
  containerClassName?: string;
}

// Default active link checker
const defaultIsActive = (pathname: string, href: string): boolean => {
  if (href === '/user') {
    return pathname === '/user';
  }

  if (href === '/admin') {
    return pathname === '/admin';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

export function Submenu(props: SubmenuProps) {
  const {
    links,
    showLogo = true,
    showUserDropdown = true,
    logoComponent,
    onLogout,
    className = '',
    containerClassName = '',
  } = props;

  const pathname = usePathname();
  const { data: address } = useAddress();
  const { disconnect } = useWallet();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const [hoverBg, setHoverBg] = useState<{ left: number; width: number } | null>(null);

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    } else {
      toast.info('Signing out...');
      await disconnect();
      toast.success('Signed out successfully');
      router.push('/');
    }
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

  // Function to check if link is active
  const isLinkActive = (link: NavigationLink) => {
    if (link.isActive) {
      return link.isActive(pathname);
    }
    return defaultIsActive(pathname, link.href);
  };

  const submenuClasses = `submenu bg-[#0A0A0A] border-b border-[#1f1f1f] w-full px-4 h-10 transition-all duration-300 ${className}`;

  return (
    <div className={submenuClasses}>
      <Container className={containerClassName}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showLogo && (
              <div className="submenu-logo flex-shrink-0 flex items-center opacity-0 transition-opacity duration-300">
                {logoComponent || <Logo />}
              </div>
            )}

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
                const isActive = isLinkActive(link);
                const linkClasses = `relative z-10 text-sm font-mb font-sans inline-flex items-center gap-2 transition-all duration-300 px-2 ${
                  isActive
                    ? 'text-white border-b-2 border-white mt-[0.57rem] pb-[0.57rem]'
                    : 'text-gray-400 hover:text-white hover:bg-[#1f1f1f] rounded py-1'
                }`;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onMouseEnter={handleMouseEnter}
                    className={linkClasses}
                  >
                    <span className="flex-shrink-0">{link.icon}</span>
                    <span className="whitespace-nowrap">{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {showUserDropdown && (
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
          )}
        </div>
      </Container>
    </div>
  );
}

export default Submenu;
