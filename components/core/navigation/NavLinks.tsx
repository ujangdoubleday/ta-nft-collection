import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/molecules/dropdown-menu';
import { Menu } from 'lucide-react';
import { useAdmin } from '@/lib/hooks/use-admin';
import { useSession } from 'next-auth/react';

// Shared links data
const useNavLinks = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin } = useAdmin();
  const { data: session } = useSession();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  // Add admin link if user is admin
  if (isAdmin) {
    links.push({ href: '/dashboard', label: 'Admin' });
  }

  return { links, pathname, isActive, isOpen, setIsOpen };
};

// Mobile menu component
export const MobileNav = () => {
  const { links, pathname, isOpen, setIsOpen } = useNavLinks();

  return (
    <div className="md:hidden flex items-center justify-center">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger className="bg-zinc-900/80 backdrop-blur-sm text-white p-2 border border-zinc-700/50 rounded-lg hover:bg-zinc-800/80 hover:border-zinc-600/70 transition-all duration-200">
          <Menu className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 bg-black/95 backdrop-blur-lg border border-zinc-800/60 text-white shadow-2xl rounded-xl mt-2"
        >
          {links.map((link) => (
            <DropdownMenuItem key={link.href} asChild onClick={() => setIsOpen(false)}>
              <Link
                href={link.href}
                className={`w-full px-4 py-3 text-white hover:bg-zinc-800/60 rounded-lg transition-all duration-200 ${
                  pathname === link.href
                    ? 'font-semibold bg-zinc-800/40 text-white'
                    : 'text-zinc-300'
                }`}
              >
                {link.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// Vercel-style Desktop navigation component
export const NavLinks = () => {
  const { links, pathname } = useNavLinks();
  const navRef = useRef<HTMLElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  return (
    <nav className="hidden md:flex items-center" ref={navRef}>
      <div className="flex items-center h-full gap-1">
        {links.map((link) => {
          const isActive =
            link.href === '/' ? pathname === link.href : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              ref={(el) => {
                linkRefs.current[link.href] = el;
              }}
              href={link.href}
              className={`group relative px-3 py-3 text-base transition-all duration-200 text-white font-medium
                ${isActive ? 'text-white' : 'text-zinc-300 hover:text-white'}
              `}
            >
              {/* Hover background box (shows on hover AND when active) */}
              <span
                className={`absolute inset-x-0 top-1.5 bottom-1.5 -mx-1 rounded-md transition-all duration-200
                  ${
                    isActive
                      ? 'group-hover:bg-zinc-700/50'
                      : 'bg-transparent group-hover:bg-zinc-700/50'
                  }
                `}
              />

              {/* Text content */}
              <span className="relative z-10">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
