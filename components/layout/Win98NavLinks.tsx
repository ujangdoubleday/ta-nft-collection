"use client";

import { usePathname } from "next/navigation";
import { Win98NavLink, Win98Menu } from "@/components/ui/win98";

const mainLinks = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/my-collections",
    label: "My Collections",
  },
  {
    href: "/collections",
    label: "Explore",
  },
  {
    href: "/todos",
    label: "Todos",
  },
  {
    href: "/about",
    label: "About",
  },
  {
    href: "/contact",
    label: "Contact",
  },
  {
    href: "/demo-dialog",
    label: "Dialog Demo",
  },
];

export function Win98NavLinks() {
  const pathname = usePathname();

  // Windows 98 style menu items
  const fileMenuItems = [
    {
      id: "new",
      label: "New Collection",
      icon: "/assets/icons/new.png",
      onClick: () => (window.location.href = "/my-collections/create"),
    },
    {
      id: "open",
      label: "Open Collections",
      icon: "/assets/icons/folder.png",
      onClick: () => (window.location.href = "/my-collections"),
    },
    { id: "sep1", separator: true },
    { id: "exit", label: "Exit", onClick: () => (window.location.href = "/") },
  ];

  const demoMenuItems = [
    {
      id: "dialog",
      label: "Dialog Demo",
      onClick: () => (window.location.href = "/demo-dialog"),
    },
  ];

  const helpMenuItems = [
    {
      id: "about",
      label: "About",
      onClick: () => (window.location.href = "/about"),
    },
    {
      id: "contact",
      label: "Contact",
      onClick: () => (window.location.href = "/contact"),
    },
  ];

  return (
    <>
      {/* Desktop Navigation - Windows 98 Menu Style */}
      <div className="hidden md:flex items-center bg-[#c0c0c0] h-6 border-b border-[#808080] text-sm">
        <Win98Menu label="File" items={fileMenuItems} />
        <Win98Menu
          label="Collections"
          items={[
            {
              id: "explore",
              label: "Explore All",
              onClick: () => (window.location.href = "/collections"),
            },
            {
              id: "my",
              label: "My Collections",
              onClick: () => (window.location.href = "/my-collections"),
            },
            {
              id: "create",
              label: "Create New",
              onClick: () => (window.location.href = "/my-collections/create"),
            },
          ]}
        />
        <Win98Menu label="Demos" items={demoMenuItems} />
        <Win98Menu label="Help" items={helpMenuItems} />
      </div>

      {/* Mobile Navigation - Traditional Links */}
      <nav className="md:hidden">
        <ul className="flex items-center space-x-1">
          {mainLinks.map((link) => (
            <li key={link.href}>
              <Win98NavLink
                href={link.href}
                isActive={pathname === link.href}
                className="text-xs"
              >
                {link.label}
              </Win98NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
