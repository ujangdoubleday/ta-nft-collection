'use client';

import { usePathname, useRouter } from 'next/navigation';
import { User, Copy, Check, LogOut } from 'lucide-react';
import { Container } from './Container';
import { useState, ReactNode, useCallback, useRef, useEffect } from 'react';
import { Logo } from '@/components/features/layout/public/navigation/Logo';
import { useAddress } from '@/lib/hooks/use-address';
import { useWallet } from '@/lib/hooks/wallet';
import { shortenAddress } from '@/lib/utils/formatting';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, Tab } from '@heroui/tabs';

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
  const router = useRouter();
  const { data: address } = useAddress();
  const { disconnect } = useWallet();
  const [copied, setCopied] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [hoverPosition, setHoverPosition] = useState<{
    left: number;
    width: number;
    opacity: number;
  } | null>(null);

  // Find the active tab index based on the current pathname
  const getActiveTabIndex = useCallback(() => {
    const activeIndex = links.findIndex((link) => {
      if (link.isActive) {
        return link.isActive(pathname);
      }
      return defaultIsActive(pathname, link.href);
    });
    return activeIndex >= 0 ? activeIndex : 0;
  }, [links, pathname]);

  const handleTabChange = (index: number) => {
    if (links[index]) {
      router.push(links[index].href);
    }
  };

  // Handle hover effect
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!tabsRef.current) return;

      const tabsElement = tabsRef.current;
      const tabElements = Array.from(tabsElement.querySelectorAll('[role="tab"]'));

      // Find which tab is being hovered
      let foundHover = false;
      for (const tab of tabElements) {
        const rect = tab.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          setHoverPosition({
            left: rect.left - tabsElement.getBoundingClientRect().left,
            width: rect.width,
            opacity: 1,
          });
          foundHover = true;
          break;
        }
      }

      // If not hovering any tab, fade out the hover indicator
      if (!foundHover && hoverPosition) {
        setHoverPosition({
          ...hoverPosition,
          opacity: 0,
        });
      }
    },
    [hoverPosition],
  );

  const handleMouseLeave = useCallback(() => {
    if (hoverPosition) {
      setHoverPosition({
        ...hoverPosition,
        opacity: 0,
      });
    }
  }, [hoverPosition]);

  useEffect(() => {
    const currentTabsRef = tabsRef.current;
    if (currentTabsRef) {
      currentTabsRef.addEventListener('mousemove', handleMouseMove);
      currentTabsRef.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (currentTabsRef) {
        currentTabsRef.removeEventListener('mousemove', handleMouseMove);
        currentTabsRef.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [handleMouseMove, handleMouseLeave]);

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

  const submenuClasses = `submenu bg-[#0A0A0A] border-b border-[#1f1f1f] w-full px-4 transition-all h-[2.27rem] duration-300 ${className}`;

  return (
    <div className={submenuClasses}>
      <Container className={containerClassName}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showLogo && (
              <div className="submenu-logo flex-shrink-0 flex items-center opacity-0 transition-opacity duration-300">
                {logoComponent || <Logo linkDisabled={false} isClone={true} />}
              </div>
            )}

            <div ref={tabsRef} className="relative w-full">
              {/* Custom hover background that follows the mouse */}
              {hoverPosition && (
                <div
                  className="absolute rounded-md bg-[#1f1f1f] transition-all duration-300 ease-out"
                  style={{
                    left: `${hoverPosition.left}px`,
                    width: `${hoverPosition.width}px`,
                    height: '28px',
                    top: '2px',
                    opacity: hoverPosition.opacity,
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}
                />
              )}

              <Tabs
                selectedKey={getActiveTabIndex().toString()}
                onSelectionChange={(key) => handleTabChange(parseInt(key as string))}
                aria-label="Navigation"
                variant="underlined"
                classNames={{
                  tabList:
                    'gap-1 w-full relative rounded-none p-0 border-none transition-all duration-300',
                  cursor: 'w-full h-[2px] bg-white bottom-[-5px]',
                  tab: 'max-w-fit px-2 py-2 transition-all duration-300 ease-out mb-2 z-10 hover:text-white relative',
                  tabContent:
                    'group-data-[selected=true]:text-white text-gray-400 transition-all duration-300 hover:text-white',
                }}
              >
                {links.map((link, index) => (
                  <Tab
                    key={index.toString()}
                    title={
                      <div className="flex items-center gap-2 text-sm font-sans">
                        <span className="flex-shrink-0">{link.icon}</span>
                        <span className="whitespace-nowrap">{link.label}</span>
                      </div>
                    }
                    className="hover-effect active-effect"
                  />
                ))}
              </Tabs>
            </div>
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
                        onClick={() => copyToClipboard()}
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
                    onClick={() => handleLogout()}
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
