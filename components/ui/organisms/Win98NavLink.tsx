"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Win98NavLinkProps {
  href: string;
  isActive: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Win98NavLink({
  href,
  isActive,
  className,
  children,
}: Win98NavLinkProps) {
  // Convert children to string if it's a simple text node
  const linkText = typeof children === "string" ? children : null;

  return (
    <Link href={href}>
      <span
        className={cn(
          "text-black hover:text-black/70 cursor-pointer",
          isActive && "font-bold", // Bold for active page instead of underline
          className
        )}
      >
        {linkText ? (
          <>
            <span className="underline">{linkText.charAt(0)}</span>
            {linkText.slice(1)}
          </>
        ) : (
          children
        )}
      </span>
    </Link>
  );
}
