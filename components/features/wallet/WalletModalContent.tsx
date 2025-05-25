"use client";

import React from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Win98Spinner } from "@/components/ui/win98";
import { MetaMaskIcon } from "@/components/ui/MetaMaskIcon";
import { Copy, Check } from "lucide-react";
import { formatAddress } from "@/lib/utils";

interface WalletModalContentProps {
  step: "connect" | "sign" | "details";
  address: string | null;
  chainId: string | null;
  isConnecting: boolean;
  isAuthenticating: boolean;
  copied: boolean;
  getNetworkName: (chainId: string | null) => string;
  onConnect: () => Promise<void>;
  onAuthenticate: () => Promise<void>;
  onCopyAddress: () => Promise<void>;
  onDisconnect: () => void;
  onCancelSign: () => void;
}

export function WalletModalContent({
  step,
  address,
  chainId,
  isConnecting,
  isAuthenticating,
  copied,
  getNetworkName,
  onConnect,
  onAuthenticate,
  onCopyAddress,
  onDisconnect,
  onCancelSign,
}: WalletModalContentProps) {
  switch (step) {
    case "connect":
      return (
        <>
          <DialogHeader>
            <DialogTitle className="text-black">Connect Wallet</DialogTitle>
            <DialogDescription className="pt-2 text-xs text-[#555]">
              Connect your wallet to access your NFT collections and create new
              digital assets.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col mt-4 space-y-4">
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="flex items-center justify-center gap-2 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-4 py-3 text-black text-sm press-effect"
            >
              {isConnecting ? (
                <>
                  <Win98Spinner />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <MetaMaskIcon className="w-5 h-5" />
                  <span>Connect with MetaMask</span>
                </>
              )}
            </button>
          </div>
        </>
      );

    case "sign":
      return (
        <>
          <DialogHeader>
            <DialogTitle className="text-black">Authenticate</DialogTitle>
            <DialogDescription className="pt-2 text-xs text-[#555]">
              Sign a message with your wallet to verify ownership and access
              your collections.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col mt-4">
            <div className="p-3 mb-4 bg-[#c0c0c0] border-[1px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white text-xs">
              <p className="mb-2">
                <strong>Wallet:</strong>{" "}
                <span className="font-mono">
                  {formatAddress(address || "")}
                </span>
              </p>
              <p className="mb-2">
                <strong>Network:</strong> <span>{getNetworkName(chainId)}</span>
              </p>
              <p>
                <strong>Message:</strong> Sign this message to access Pixel
                Vault. This is free and doesn&apos;t require gas.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onAuthenticate}
                disabled={isAuthenticating}
                className="flex-1 flex items-center justify-center gap-2 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-4 py-2 text-black text-sm press-effect"
              >
                {isAuthenticating ? (
                  <>
                    <Win98Spinner />
                    <span>Signing...</span>
                  </>
                ) : (
                  <>
                    <span>Sign Message</span>
                  </>
                )}
              </button>
              <button
                onClick={onCancelSign}
                disabled={isAuthenticating}
                className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-4 py-2 text-black text-sm press-effect"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      );

    case "details":
      return (
        <>
          <DialogHeader>
            <DialogTitle className="text-black">Wallet Details</DialogTitle>
            <DialogDescription className="pt-2 text-xs text-[#555]">
              Your wallet is connected and authenticated
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col mt-4">
            <div className="p-3 mb-4 bg-[#c0c0c0] border-[1px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs">
                  <strong>Address:</strong>
                </span>
                <div className="flex items-center">
                  <span className="font-mono text-xs mr-2">
                    {formatAddress(address || "")}
                  </span>
                  <button
                    onClick={onCopyAddress}
                    className="bg-[#c0c0c0] border-[1px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-1 hover-active press-effect"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs">
                  <strong>Network:</strong>
                </span>
                <span className="text-xs">{getNetworkName(chainId)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">
                  <strong>Status:</strong>
                </span>
                <span className="text-xs flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                  Connected
                </span>
              </div>
            </div>

            <button
              onClick={onDisconnect}
              className="w-full bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-4 py-2 text-black text-sm press-effect"
            >
              Disconnect Wallet
            </button>
          </div>
        </>
      );

    default:
      return null;
  }
}
