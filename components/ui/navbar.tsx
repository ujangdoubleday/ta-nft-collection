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
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle } from "lucide-react";
import { useWallet } from "@/lib/hooks/useWallet";
import { Win98Spinner } from "@/components/ui/win98-spinner";
import { Copy, Check } from "lucide-react";
import { MetaMaskIcon } from "@/components/ui/metamask-icon";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const isMyCollectionPage = pathname.startsWith("/my-collections");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/my-collections/search?q=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
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

  // Handle disconnect with state reset
  const handleDisconnect = () => {
    disconnect();
    resetWalletStates();
  };

  // Handle wallet button click
  const handleWalletButtonClick = () => {
    if (!isConnected) {
      // Reset state sebelum memulai proses koneksi baru
      resetWalletStates();
      setIsWalletModalOpen(true);
    } else {
      // Jika sudah terkoneksi, toggle dialog Account Details
      setIsWalletModalOpen(!isWalletModalOpen);
    }
  };

  // Handle dialog close
  const handleDialogOpenChange = (open: boolean) => {
    setIsWalletModalOpen(open);

    // Jika dialog ditutup saat "sign" step dan belum authenticate, anggap user cancel
    if (!open && walletModalStep === "sign" && !isAuthenticated) {
      disconnect(); // Putuskan koneksi untuk memastikan user harus connect lagi
      setErrorMessage("Authentication Cancelled");
      setShowErrorNotification(true);
      setWalletModalStep("connect");

      // Sembunyikan notifikasi error setelah 5 detik
      setTimeout(() => {
        setShowErrorNotification(false);
        setErrorMessage("");
      }, 5000);
    } else if (!open && walletModalStep === "connect") {
      // Jika user menutup dialog saat "connect" step, reset state
      resetWalletStates();
    }
  };

  // Render content berdasarkan step
  const renderModalContent = () => {
    if (error) {
      return <div className="text-red-600 text-sm mb-4">{error}</div>;
    }

    switch (walletModalStep) {
      case "connect":
        return (
          <>
            <p className="text-black text-sm mb-4">
              Connect your wallet to start creating and collecting NFTs.
            </p>
            <div className="grid gap-4">
              <Button
                className="w-full justify-start gap-2 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:brightness-95 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white relative"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                <MetaMaskIcon className="w-6 h-6" />
                Metamask
                {isConnecting && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Win98Spinner />
                  </span>
                )}
              </Button>
            </div>
          </>
        );

      case "sign":
        return (
          <div className="space-y-4">
            <h3 className="text-base mb-2 font-bold">Signature Required</h3>
            <p className="text-sm mb-3">
              Please sign the message with your wallet to prove ownership. This
              won't cost any gas fees.
            </p>
            <div className="win98-shadow-inset bg-white p-3 mb-4 text-xs font-mono">
              <p>Welcome to NFT Pixel Studio!</p>
              <br />
              <p>
                This signature proves you own this wallet address: {address}
              </p>
              <p>
                This request will not trigger a blockchain transaction or cost
                any gas fees.
              </p>
            </div>

            <Button
              className="w-full justify-center bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:brightness-95 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
              onClick={handleAuthenticate}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <>
                  <span>Waiting for signature...</span>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Win98Spinner />
                  </span>
                </>
              ) : (
                "Sign Message"
              )}
            </Button>

            <Button
              className="w-full justify-center bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:brightness-95 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
              onClick={handleCancelSign}
            >
              Cancel & Disconnect
            </Button>
          </div>
        );

      case "details":
        return (
          <div className="space-y-4">
            <div className="bg-white border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">Wallet Address</span>
                <button
                  onClick={copyAddress}
                  className="text-black text-xs bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-2 py-0.5 hover:brightness-95 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm font-mono break-all">{address}</p>
            </div>

            <div className="bg-white border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-3">
              <span className="text-xs text-gray-600 block mb-1">Network</span>
              <div className="flex items-center gap-2">
                <span className="text-green-600">●</span>
                <span className="text-sm">{getNetworkName(chainId)}</span>
              </div>
            </div>

            <div className="bg-white border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-3">
              <span className="text-xs text-gray-600 block mb-1">Status</span>
              <div className="flex items-center gap-2">
                <span className="text-green-600">●</span>
                <span className="text-sm">Authenticated</span>
              </div>
            </div>

            <Button
              className="w-full justify-center bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:brightness-95 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </div>
        );
    }
  };

  return (
    <header className="bg-[#c0c0c0] border-b-[2px] border-b-[#808080] fixed top-0 left-0 right-0 z-[100] w-full shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
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
          <Dialog
            open={isWalletModalOpen}
            onOpenChange={handleDialogOpenChange}
          >
            <DialogTrigger asChild>
              <Button
                className="text-black text-xs h-7 py-0 px-3 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] transition-all hover:brightness-95 hover:translate-y-[1px] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white active:translate-y-[2px] relative min-w-[120px]"
                onClick={handleWalletButtonClick}
              >
                {isConnected ? (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">●</span>
                    {formatAddress(address!)}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="relative">
                      <span className="underline decoration-1">C</span>onnect
                      Wallet
                    </span>
                    {isConnecting && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Win98Spinner />
                      </span>
                    )}
                  </div>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent
              title={
                walletModalStep === "connect"
                  ? "Connect Wallet"
                  : walletModalStep === "sign"
                  ? "Wallet Authentication"
                  : "Account Details"
              }
              className="win98-modal bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] z-[200]"
            >
              <div className="p-4">{renderModalContent()}</div>
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
                  "text-black text-xs px-2 py-1 h-6 flex items-center gap-1 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:brightness-95 hover:translate-y-[1px] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white active:translate-y-[2px] whitespace-nowrap min-w-fit",
                  isActive("/my-collections/create") && "bg-[#d2d2d2]"
                )}
              >
                <svg
                  className="w-3 h-3 flex-shrink-0"
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
                <span className="whitespace-nowrap">Create Collection</span>
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

      {/* Success Notification - posisi di kanan bawah */}
      {showSuccessNotification && (
        <div className="fixed bottom-8 right-4 bg-[#c0c0c0] border-t-white border-l-white border-r-[#808080] border-b-[#808080] border-[2px] p-2 shadow-md w-64 z-[199] animate-slide-up md:w-80">
          <div className="win98-bar h-5 flex items-center px-2 mb-2">
            <span className="text-white text-xs font-semibold tracking-tight">
              Wallet Connected
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-600 text-base">●</span>
            <p className="text-black text-xs font-bold">
              Authentication Successful
            </p>
          </div>
          <p className="text-black text-xs mb-2">
            Your wallet has been successfully connected and authenticated. You
            now have access to create and trade NFTs with full security.
          </p>
          <div className="bg-white border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2 mb-2">
            <p className="text-xs font-mono break-all">
              {formatAddress(address || "")}
            </p>
          </div>
          <div className="flex justify-end">
            <button
              className="text-black text-xs bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-4 py-1 hover:brightness-95 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
              onClick={() => setShowSuccessNotification(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error Notification - posisi di kanan bawah */}
      {showErrorNotification && (
        <div className="fixed bottom-8 right-4 bg-[#c0c0c0] border-t-white border-l-white border-r-[#808080] border-b-[#808080] border-[2px] p-2 shadow-md w-64 z-[199] animate-slide-up md:w-80">
          <div className="win98-bar h-5 flex items-center px-2 mb-2">
            <span className="text-white text-xs font-semibold tracking-tight">
              {errorMessage === "Authentication Cancelled by User"
                ? "Wallet Disconnected"
                : "Wallet Error"}
            </span>
          </div>
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle
              className={`w-5 h-5 ${
                errorMessage === "Authentication Cancelled by User"
                  ? "text-yellow-600"
                  : "text-red-600"
              } flex-shrink-0 mt-1`}
            />
            <p className="text-black text-xs font-bold">{errorMessage}</p>
          </div>
          <p className="text-black text-xs mb-3 ml-7">
            {errorMessage === "Connection Cancelled"
              ? "You cancelled the wallet connection request. Please try again when you're ready to connect."
              : errorMessage === "Authentication Rejected"
              ? "You rejected the signature request. Authentication is required to use the application's features."
              : errorMessage === "Authentication Cancelled by User"
              ? "You clicked Cancel & Disconnect. You need to reconnect your wallet and complete authentication to access all features."
              : errorMessage === "Authentication Cancelled"
              ? "You cancelled the authentication process. Please authenticate to access all features."
              : "An error occurred with the wallet connection. Please try again or use a different wallet."}
          </p>
          <div className="flex justify-end">
            <button
              className="text-black text-xs bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-4 py-1 hover:brightness-95 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
              onClick={() => setShowErrorNotification(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

// Add a spacer div to prevent content from being hidden under the fixed navbar
export function NavbarSpacer() {
  return <div className="h-[calc(2.25rem+2px+2.25rem+2px+1.5rem)]" />;
}
