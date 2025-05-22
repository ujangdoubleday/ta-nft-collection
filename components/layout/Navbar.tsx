"use client";
import * as React from "react";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";
import { WalletButton } from "@/components/features/wallet/WalletButton";

// Main Navbar Component
export function Navbar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#c0c0c0] border-b border-[#808080] shadow-md">
      <div className="h-full mx-auto px-2 sm:px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo />
          <NavLinks />
        </div>

        <div className="flex items-center gap-3">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}

export function NavbarSpacer() {
  return <div className="h-14"></div>;
}
