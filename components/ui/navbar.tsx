"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Container } from "@/components/ui/container";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  // Detect current active section
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-[#c0c0c0] border-b-[2px] border-b-[#808080] sticky top-0 z-40 transition-all duration-300 shadow-md">
      <Container>
        <div className="flex h-9 items-center justify-between">
          <div className="win98-bar w-full h-5 flex items-center px-2">
            <span className="text-white text-xs font-semibold tracking-tight">
              Pixel Vault: Digital Art Creator
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between py-1">
          <nav className="flex gap-1 overflow-x-auto px-1 py-1 win98-scrollbar">
            <Link
              href="/"
              className={cn(
                "text-black text-sm px-2 py-1 relative transition-all duration-200 hover:bg-[#d2d2d2]",
                isActive("/") && "bg-[#d2d2d2] font-semibold"
              )}
            >
              {isActive("/") && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-black animate-pulse"></span>
              )}
              Home
            </Link>
            <Link
              href="/about"
              className={cn(
                "text-black text-sm px-2 py-1 relative transition-all duration-200 hover:bg-[#d2d2d2]",
                isActive("/about") && "bg-[#d2d2d2] font-semibold"
              )}
            >
              {isActive("/about") && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-black animate-pulse"></span>
              )}
              About
            </Link>
            <Link
              href="/contact"
              className={cn(
                "text-black text-sm px-2 py-1 relative transition-all duration-200 hover:bg-[#d2d2d2]",
                isActive("/contact") && "bg-[#d2d2d2] font-semibold"
              )}
            >
              {isActive("/contact") && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-black animate-pulse"></span>
              )}
              Contact
            </Link>
            <Link
              href="/my-collections"
              className={cn(
                "text-black text-sm px-2 py-1 relative transition-all duration-200 hover:bg-[#d2d2d2]",
                isActive("/my-collections") && "bg-[#d2d2d2] font-semibold"
              )}
            >
              {isActive("/my-collections") && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-black animate-pulse"></span>
              )}
              Your Gallery
            </Link>
          </nav>
          <Button className="text-black text-xs h-7 py-0 px-2 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] transition-all hover:brightness-95 hover:translate-y-[1px] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white active:translate-y-[2px]">
            Connect Wallet
          </Button>
        </div>
      </Container>
    </header>
  );
}
