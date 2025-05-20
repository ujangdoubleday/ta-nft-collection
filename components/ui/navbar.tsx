"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Detect current active section
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const isMyCollectionPage = pathname.startsWith("/my-collections");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/my-collections/search?q=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  return (
    <header className="bg-[#c0c0c0] border-b-[2px] border-b-[#808080] sticky top-0 z-40 transition-all duration-300 shadow-md w-full">
      <div className="flex h-9 items-center px-4">
        <div className="win98-bar w-full h-5 flex items-center px-2">
          <span className="text-white text-base font-bold tracking-wide">
            NFT Pixel Studio: Create & Collect Digital Art
          </span>
        </div>
      </div>
      <div className="flex flex-col px-4">
        {/* Main Menu Tabs */}
        <div className="flex items-center justify-between pb-2">
          <nav className="flex gap-0">
            <Link
              href="/"
              className={cn(
                "text-black text-xs px-2.5 py-1.5 relative transition-all duration-200 border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:brightness-95 whitespace-nowrap",
                isActive("/") &&
                  "bg-[#d2d2d2] border-t-[#808080] border-l-[#808080] border-r-white border-b-white translate-y-[2px]"
              )}
            >
              <span className="underline decoration-1">H</span>ome
            </Link>
            <Link
              href="/about"
              className={cn(
                "text-black text-xs px-2.5 py-1.5 relative transition-all duration-200 border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:brightness-95 whitespace-nowrap",
                isActive("/about") &&
                  "bg-[#d2d2d2] border-t-[#808080] border-l-[#808080] border-r-white border-b-white translate-y-[2px]"
              )}
            >
              <span className="underline decoration-1">A</span>bout
            </Link>
            <Link
              href="/contact"
              className={cn(
                "text-black text-xs px-2.5 py-1.5 relative transition-all duration-200 border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:brightness-95 whitespace-nowrap",
                isActive("/contact") &&
                  "bg-[#d2d2d2] border-t-[#808080] border-l-[#808080] border-r-white border-b-white translate-y-[2px]"
              )}
            >
              <span className="underline decoration-1">C</span>ontact
            </Link>
            <Link
              href="/my-collections"
              className={cn(
                "text-black text-xs px-2.5 py-1.5 relative transition-all duration-200 border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:brightness-95 whitespace-nowrap",
                isActive("/my-collections") &&
                  "bg-[#d2d2d2] border-t-[#808080] border-l-[#808080] border-r-white border-b-white translate-y-[2px]"
              )}
            >
              <span className="underline decoration-1">M</span>y Collection
            </Link>
          </nav>
          <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
            <DialogTrigger asChild>
              <Button className="text-black text-xs h-6 py-0 px-2 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] transition-all hover:brightness-95 hover:translate-y-[1px] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white active:translate-y-[2px]">
                Connect Wallet
              </Button>
            </DialogTrigger>
            <DialogContent className="win98-modal bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080]">
              <DialogHeader>
                <DialogTitle className="text-black text-lg font-bold">
                  Connect Wallet
                </DialogTitle>
                <DialogDescription className="text-black text-sm">
                  Choose your preferred wallet to connect
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Button
                  className="w-full justify-start gap-2 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:brightness-95 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
                  onClick={() => {
                    console.log("Connecting to MetaMask...");
                    setIsWalletModalOpen(false);
                  }}
                >
                  <img
                    src="/metamask-fox.svg"
                    alt="MetaMask"
                    className="w-6 h-6"
                  />
                  MetaMask
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Submenu - Only show on My Collection pages */}
        {isMyCollectionPage && (
          <div className="flex items-center border-t-[2px] border-t-[#808080] py-1.5">
            <nav className="flex items-center gap-2 px-2">
              <Button
                onClick={() => router.back()}
                className="text-black text-xs h-6 py-0 px-2 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:brightness-95 hover:translate-y-[1px] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white active:translate-y-[2px] flex items-center gap-1"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back
              </Button>

              <div className="h-4 w-[2px] bg-[#808080]"></div>

              <Link
                href="/my-collections/create"
                className={cn(
                  "text-black text-xs px-2 py-1 h-6 flex items-center gap-1 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:brightness-95 hover:translate-y-[1px] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white active:translate-y-[2px]",
                  isActive("/my-collections/create") && "bg-[#d2d2d2]"
                )}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Collection
              </Link>

              <div className="h-4 w-[2px] bg-[#808080]"></div>

              <form onSubmit={handleSearch} className="flex items-center gap-1">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search collections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-6 text-xs px-2 pr-8 bg-white border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white focus:outline-none focus:border-[#000080]"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                  >
                    <Search className="w-3 h-3" />
                  </button>
                </div>
              </form>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
