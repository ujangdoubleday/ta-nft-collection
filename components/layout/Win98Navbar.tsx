"use client";

import { Logo } from "./Logo";
import { Win98NavLinks } from "./Win98NavLinks";

export function Win98NavbarSpacer() {
  return <div className="h-14" />;
}

export function Win98Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#c0c0c0] border-b-2 border-[#808080]">
      <div className="flex items-center justify-between px-4 py-2">
        <Logo />
        <Win98NavLinks />
      </div>
    </header>
  );
}
