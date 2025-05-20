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
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

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
        <div className="flex flex-col">
          {/* Main Menu */}
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
                <span className="underline decoration-1">H</span>ome
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
                <span className="underline decoration-1">A</span>bout
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
                <span className="underline decoration-1">C</span>ontact
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
                <span className="underline decoration-1">M</span>y Collection
              </Link>
            </nav>
            <Button className="text-black text-xs h-7 py-0 px-2 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] transition-all hover:brightness-95 hover:translate-y-[1px] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white active:translate-y-[2px]">
              Connect Wallet
            </Button>
          </div>

          {/* Submenu */}
          <div className="flex items-center border-t-[2px] border-t-[#808080] py-1">
            <nav className="flex gap-1 overflow-x-auto px-1 py-1 win98-scrollbar">
              <Link
                href="/my-collections/created"
                className={cn(
                  "text-black text-sm px-2 py-1 relative transition-all duration-200 hover:bg-[#d2d2d2]",
                  isActive("/my-collections/created") &&
                    "bg-[#d2d2d2] font-semibold"
                )}
              >
                {isActive("/my-collections/created") && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-black animate-pulse"></span>
                )}
                <span className="underline decoration-1">C</span>reated NFTs
              </Link>
              <Link
                href="/my-collections/collected"
                className={cn(
                  "text-black text-sm px-2 py-1 relative transition-all duration-200 hover:bg-[#d2d2d2]",
                  isActive("/my-collections/collected") &&
                    "bg-[#d2d2d2] font-semibold"
                )}
              >
                {isActive("/my-collections/collected") && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-black animate-pulse"></span>
                )}
                <span className="underline decoration-1">C</span>ollected NFTs
              </Link>
              <Link
                href="/my-collections/favorites"
                className={cn(
                  "text-black text-sm px-2 py-1 relative transition-all duration-200 hover:bg-[#d2d2d2]",
                  isActive("/my-collections/favorites") &&
                    "bg-[#d2d2d2] font-semibold"
                )}
              >
                {isActive("/my-collections/favorites") && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-black animate-pulse"></span>
                )}
                <span className="underline decoration-1">F</span>avorites
              </Link>
              <div className="h-4 w-[2px] bg-[#808080] mx-1"></div>
              <Link
                href="/my-collections/create"
                className={cn(
                  "text-black text-sm px-2 py-1 relative transition-all duration-200 hover:bg-[#d2d2d2]",
                  isActive("/my-collections/create") &&
                    "bg-[#d2d2d2] font-semibold"
                )}
              >
                {isActive("/my-collections/create") && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-black animate-pulse"></span>
                )}
                <span className="underline decoration-1">C</span>reate New NFT
              </Link>
            </nav>
          </div>
        </div>
      </Container>
      <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
        <DialogTrigger asChild>
          <Button className="text-black text-xs h-7 py-0 px-2 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] transition-all hover:brightness-95 hover:translate-y-[1px] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white active:translate-y-[2px]">
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
                // Add MetaMask connection logic here
                console.log("Connecting to MetaMask...");
                setIsWalletModalOpen(false);
              }}
            >
              <img src="/metamask-fox.svg" alt="MetaMask" className="w-6 h-6" />
              MetaMask
            </Button>
            <Button
              className="w-full justify-start gap-2 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:brightness-95 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
              onClick={() => {
                // Add WalletConnect logic here
                console.log("Connecting to WalletConnect...");
                setIsWalletModalOpen(false);
              }}
            >
              <img
                src="/walletconnect-logo.svg"
                alt="WalletConnect"
                className="w-6 h-6"
              />
              WalletConnect
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
