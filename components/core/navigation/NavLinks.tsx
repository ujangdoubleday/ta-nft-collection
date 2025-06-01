import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Win98NavLink } from '@/components/ui/organisms/Win98NavLink';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/molecules/dropdown-menu';
import { Menu } from 'lucide-react';

// Shared links data
const useNavLinks = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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
    { href: '/collections', label: 'My Collections' },
  ];

  return { links, pathname, isActive, isOpen, setIsOpen };
};

// Mobile menu component
export const MobileNav = () => {
  const { links, pathname, isOpen, setIsOpen } = useNavLinks();

  return (
    <div className="md:hidden flex items-center">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger className="bg-[#c0c0c0] p-1 border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:bg-[#d2d2d2] h-8 w-8 flex items-center justify-center">
          <Menu className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {links.map((link) => (
            <DropdownMenuItem key={link.href} asChild onClick={() => setIsOpen(false)}>
              <Link
                href={link.href}
                className={`w-full ${pathname === link.href ? 'font-bold' : ''}`}
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

// Desktop navigation component
export const NavLinks = () => {
  const { links, isActive } = useNavLinks();

  return (
    <nav className="hidden md:flex items-center gap-2">
      {links.map((link) => (
        <Win98NavLink
          key={link.href}
          href={link.href}
          isActive={isActive(link.href)}
          className="text-sm px-2"
        >
          {link.label}
        </Win98NavLink>
      ))}
    </nav>
  );
};
