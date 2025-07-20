'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useAdmin } from '@/lib/hooks/use-admin';
import { useSession } from 'next-auth/react';
import { useNavbar } from './Navbar';
import { AnimatePresence, motion } from 'framer-motion';

// Shared links data
const useNavLinks = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { isTransparent } = useNavbar();
  const { isAdmin } = useAdmin();
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/' || pathname === '';
    }
    return pathname.startsWith(path);
  };

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  // Add admin link if user is admin but not authenticated
  // This removes the Admin link when admin is logged in
  if (isAdmin && !isAuthenticated) {
    links.push({ href: '/dashboard', label: 'Admin' });
  }

  return { links, pathname, isActive, isOpen, setIsOpen, isAuthenticated, isAdmin, isTransparent };
};

// Mobile menu component
export const MobileNav = () => {
  const { links, pathname, isOpen, setIsOpen } = useNavLinks();

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

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-[10001] p-2 focus:outline-none"
        aria-label="Toggle menu"
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <motion.span
            className="w-full h-0.5 bg-white rounded-full"
            variants={topBarVariants}
            animate={isOpen ? 'open' : 'closed'}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            className="w-full h-0.5 bg-white rounded-full"
            variants={middleBarVariants}
            animate={isOpen ? 'open' : 'closed'}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            className="w-full h-0.5 bg-white rounded-full"
            variants={bottomBarVariants}
            animate={isOpen ? 'open' : 'closed'}
            transition={{ duration: 0.3 }}
          />
        </div>
      </button>

      {/* Content-only Menu - Positioned below navbar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bg-black/95 backdrop-blur-lg z-[9998] flex items-center justify-center md:hidden"
            style={{
              position: 'fixed',
              top: '4rem', // Start below navbar (navbar height is 4rem)
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: 'calc(100vh - 4rem)', // Subtract navbar height from total height
            }}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          >
            <motion.nav className="flex flex-col items-center justify-center w-full h-full">
              {links.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: {
                      delay: 0.1 + index * 0.1,
                    },
                  }}
                  className="w-full text-center py-6"
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-3xl font-medium ${
                      pathname === link.href ? 'text-white' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Vercel-style Desktop navigation component
export const NavLinks = () => {
  const { links, pathname, isActive } = useNavLinks();
  const navRef = useRef<HTMLElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  return (
    <nav className="hidden md:flex items-center" ref={navRef}>
      <div className="flex items-center h-full gap-1">
        {links.map((link) => {
          const active = isActive(link.href);

          // Define styles for links
          const linkTextStyle = {
            color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
            textShadow: '0px 1px 2px rgba(0,0,0,0.5)',
            fontWeight: active ? 500 : 400,
          };

          return (
            <Link
              key={link.href}
              ref={(el) => {
                linkRefs.current[link.href] = el;
              }}
              href={link.href}
              className="group relative px-2 lg:px-3 py-3 text-sm lg:text-base transition-all duration-200"
            >
              {/* Hover background box (only shows on hover, never when active) */}
              <span className="absolute inset-x-0 top-2 bottom-2 -mx-1 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 bg-white/10" />

              {/* Text content */}
              <span className="relative z-10" style={linkTextStyle}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
