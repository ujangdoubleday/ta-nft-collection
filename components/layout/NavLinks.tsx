import { usePathname } from "next/navigation";
import { Win98NavLink } from "@/components/ui/win98";

export const NavLinks = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="hidden md:flex items-center gap-4">
      <Win98NavLink href="/" isActive={isActive("/")}>
        Home
      </Win98NavLink>

      <Win98NavLink
        href="/my-collections"
        isActive={isActive("/my-collections")}
      >
        My Collections
      </Win98NavLink>

      <Win98NavLink href="/about" isActive={isActive("/about")}>
        About
      </Win98NavLink>

      <Win98NavLink href="/contact" isActive={isActive("/contact")}>
        Contact
      </Win98NavLink>
    </nav>
  );
};
