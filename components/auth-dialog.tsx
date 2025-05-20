"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/lib/hooks/useWallet";
import { Win98Spinner } from "@/components/ui/win98-spinner";

export function AuthenticationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    isConnected,
    isAuthenticated,
    isAuthenticating,
    authenticate,
    error,
  } = useWallet();

  // Tampilkan dialog jika terkoneksi tapi belum terautentikasi
  useEffect(() => {
    if (isConnected && !isAuthenticated) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isConnected, isAuthenticated]);

  const handleAuthenticate = async () => {
    const success = await authenticate();
    if (success) {
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        title="Wallet Authentication"
        className="win98-modal bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080]"
      >
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-base mb-2 font-bold">Signature Required</h3>
            <p className="text-sm mb-3">
              Please sign the message with your wallet to prove ownership. This
              won't cost any gas fees.
            </p>
            <div className="win98-shadow-inset bg-white p-3 mb-4 text-xs font-mono">
              <p>Welcome to NFT Pixel Studio!</p>
              <br />
              <p>This signature proves you own this wallet address.</p>
              <p>
                This request will not trigger a blockchain transaction or cost
                any gas fees.
              </p>
            </div>
            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          </div>

          <div className="flex justify-between">
            <Button
              className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:brightness-95 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:brightness-95 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white flex items-center gap-2 relative min-w-[120px]"
              onClick={handleAuthenticate}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <>
                  <span>Waiting...</span>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Win98Spinner />
                  </span>
                </>
              ) : (
                "Sign Message"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
