"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { cn, formatAddress } from "@/lib/utils";
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { useWallet } from "@/lib/hooks/wallet";
import { Win98Spinner, Win98NavLink } from "@/components/ui/win98";
import { Copy, Check } from "lucide-react";
import { MetaMaskIcon } from "@/components/ui/MetaMaskIcon";
import { WalletModalContent } from "@/components/features/wallet/WalletModalContent";
import {
  Win98SuccessNotification,
  Win98ErrorNotification,
} from "@/components/layout/notifications";

export function Navbar() {
  const pathname = usePathname();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const {
    address,
    isConnected,
    isConnecting,
    isAuthenticated,
    isAuthenticating,
    error,
    connect,
    disconnect,
    authenticate,
    chainId,
  } = useWallet();
  const [copied, setCopied] = useState(false);
  const [walletModalStep, setWalletModalStep] = useState<
    "connect" | "sign" | "details"
  >("connect");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Effect untuk mengatur step dialog berdasarkan status wallet
  useEffect(() => {
    if (isConnected) {
      if (isAuthenticated) {
        setWalletModalStep("details");
        // Jika baru saja terautentikasi, tutup dialog dan tampilkan notifikasi
        if (isWalletModalOpen && walletModalStep === "sign") {
          setIsWalletModalOpen(false);
          setShowSuccessNotification(true);

          // Sembunyikan notifikasi setelah 5 detik
          const timer = setTimeout(() => {
            setShowSuccessNotification(false);
          }, 5000);

          return () => clearTimeout(timer);
        }
      } else {
        setWalletModalStep("sign");
      }
    } else {
      setWalletModalStep("connect");
    }
  }, [isConnected, isAuthenticated, isWalletModalOpen]);

  // Effect untuk menangani error dari wallet
  useEffect(() => {
    if (error) {
      // Jika ada error dari wallet hook, tampilkan sebagai notifikasi
      setErrorMessage(
        error.includes("rejected") ||
          error.includes("denied") ||
          error.includes("canceled") ||
          error.includes("cancelled")
          ? "Connection Cancelled"
          : error
      );
      setShowErrorNotification(true);
      setIsWalletModalOpen(false); // Tutup dialog

      // Sembunyikan notifikasi error setelah 5 detik
      const timer = setTimeout(() => {
        setShowErrorNotification(false);
        setErrorMessage("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  // Detect current active section
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  // Function to copy address to clipboard
  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get network name from chainId
  const getNetworkName = (chainId: string | null) => {
    switch (chainId) {
      case "11155111":
        return "Sepolia Testnet";
      case "1":
        return "Ethereum Mainnet";
      case "5":
        return "Goerli Testnet";
      default:
        return "Unknown Network";
    }
  };

  // Reset all wallet-related states
  const resetWalletStates = () => {
    setIsWalletModalOpen(false);
    setWalletModalStep("connect");
    setShowSuccessNotification(false);
    setShowErrorNotification(false);
    setErrorMessage("");
  };

  // Handle connect and keep modal open
  const handleConnect = async () => {
    try {
      const success = await connect();
      if (!success) {
        // If connection failed but no error in state
        resetWalletStates();
      }
    } catch (err) {
      // This should not happen as errors are handled in the hook
      console.error("Unhandled error in connect:", err);
      resetWalletStates();
    }
  };

  // Handle authentication
  const handleAuthenticate = async () => {
    try {
      const success = await authenticate();
      if (!success) {
        // If authentication failed but no error in state
        disconnect(); // Pastikan disconnect wallet saat authentikasi gagal
        resetWalletStates();
      }
    } catch (err) {
      // This should not happen as errors are handled in the hook
      console.error("Unhandled error in authenticate:", err);
      disconnect(); // Pastikan disconnect wallet saat error
      resetWalletStates();
    }
  };

  // Handle cancel di dialog sign
  const handleCancelSign = () => {
    disconnect(); // Pastikan disconnect wallet
    setErrorMessage("Authentication Cancelled by User");
    setShowErrorNotification(true);
    resetWalletStates();

    // Sembunyikan notifikasi error setelah 5 detik
    setTimeout(() => {
      setShowErrorNotification(false);
      setErrorMessage("");
    }, 5000);
  };

  const handleDisconnect = () => {
    disconnect();
    setIsWalletModalOpen(false);
  };

  const handleWalletButtonClick = () => {
    if (isAuthenticated) {
      // Jika sudah authenticated, tampilkan modal wallet details langsung
      setWalletModalStep("details");
      setIsWalletModalOpen(true);
    } else if (isConnected) {
      // Jika connected tapi belum authenticated, tampilkan modal sign
      setWalletModalStep("sign");
      setIsWalletModalOpen(true);
    } else {
      // Tampilkan modal connect
      setWalletModalStep("connect");
      setIsWalletModalOpen(true);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    // Jika dialog ditutup oleh user
    if (!open) {
      // Jika wallet terhubung tapi belum terautentikasi, disconnect
      if (isConnected && !isAuthenticated) {
        disconnect();
      }
      setIsWalletModalOpen(false);
    } else {
      setIsWalletModalOpen(true);
    }
  };

  const handleCloseSuccessNotification = () => {
    setShowSuccessNotification(false);
  };

  const handleCloseErrorNotification = () => {
    setShowErrorNotification(false);
    setErrorMessage("");
  };

  // JSX untuk navbar
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#c0c0c0] border-b border-[#808080] shadow-md">
      <div className="h-full mx-auto px-2 sm:px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/">
            <div className="flex items-center">
              <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-1">
                <div className="bg-[#000080] px-1 py-0.5">
                  <span className="text-white text-lg font-bold">PV</span>
                </div>
              </div>
              <span className="ml-2 text-black font-bold hidden md:inline-block">
                Pixel Vault
              </span>
            </div>
          </Link>

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
        </div>

        <div className="flex items-center gap-3">
          {/* Connect Wallet Button */}
          <Dialog
            open={isWalletModalOpen}
            onOpenChange={handleDialogOpenChange}
          >
            <DialogTrigger asChild>
              <Button
                onClick={handleWalletButtonClick}
                className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-black text-xs h-8 hover:bg-[#c0c0c0] hover-active press-effect"
              >
                {isConnected && isAuthenticated ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>{formatAddress(address || "")}</span>
                  </div>
                ) : (
                  <span>Connect Wallet</span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4 max-w-md sm:max-w-md text-black shadow-md">
              <WalletModalContent
                step={walletModalStep}
                address={address}
                chainId={chainId}
                isConnecting={isConnecting}
                isAuthenticating={isAuthenticating}
                copied={copied}
                getNetworkName={getNetworkName}
                onConnect={handleConnect}
                onAuthenticate={handleAuthenticate}
                onCopyAddress={copyAddress}
                onDisconnect={handleDisconnect}
                onCancelSign={handleCancelSign}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Notifications */}
      {showSuccessNotification && (
        <Win98SuccessNotification
          message="Wallet Connected Successfully"
          onClose={handleCloseSuccessNotification}
        />
      )}

      {showErrorNotification && (
        <Win98ErrorNotification
          message={errorMessage}
          onClose={handleCloseErrorNotification}
        />
      )}
    </div>
  );
}

// Component for adding space after navbar
export function NavbarSpacer() {
  return <div className="h-14"></div>;
}
