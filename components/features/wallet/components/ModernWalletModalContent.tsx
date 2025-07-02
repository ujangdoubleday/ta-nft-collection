'use client';

import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/molecules';
import { MetaMaskIcon } from '@/components/shared/media';
import { Copy, Check, LogOut, Loader2 } from 'lucide-react';
import { formatAddress } from '@/lib/utils';
import { LogMessage } from './useWalletModal';

interface WalletModalContentProps {
  step: 'connect' | 'sign' | 'checking' | 'details';
  address: string | null;
  chainId: string | null;
  isConnecting: boolean;
  isAuthenticating: boolean;
  copied: boolean;
  getNetworkNameAction: (chainId: string | null) => string;
  onConnectAction: () => Promise<void>;
  onAuthenticateAction: () => Promise<void>;
  onCopyAddressAction: () => Promise<void>;
  onDisconnectAction: () => void;
  onCancelSignAction: () => void;
  logMessages: LogMessage[];
}

export function ModernWalletModalContent({
  step,
  address,
  chainId,
  isConnecting,
  isAuthenticating,
  copied,
  getNetworkNameAction,
  onConnectAction,
  onAuthenticateAction,
  onCopyAddressAction,
  onDisconnectAction,
  onCancelSignAction,
  logMessages,
}: WalletModalContentProps) {
  const safeFormatAddress = (addr: string | null): string => {
    if (!addr) return '0x...';
    try {
      return formatAddress(addr);
    } catch (error) {
      return '0x...';
    }
  };

  switch (step) {
    case 'connect':
      return (
        <>
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold mb-2">Connect Wallet</DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm mb-4">
              Connect your wallet to access your NFT collections and create new digital assets.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col mt-4 space-y-4">
            <button
              onClick={onConnectAction}
              disabled={isConnecting}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all duration-300 rounded-lg px-5 py-3.5 font-medium text-white text-base shadow-md disabled:opacity-70"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <MetaMaskIcon className="w-6 h-6" />
                  <span>Connect with MetaMask</span>
                </>
              )}
            </button>
          </div>
        </>
      );

    case 'sign':
      return (
        <>
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold mb-2">Authenticate</DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm mb-4">
              Sign a message with your wallet to verify ownership and access your collections.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col mt-4">
            <div className="p-4 mb-5 bg-zinc-800 rounded-lg border border-zinc-700 text-zinc-300 text-sm">
              <p className="mb-3 flex justify-between items-center">
                <span className="text-zinc-400">Wallet:</span>
                <span className="font-mono font-medium">{safeFormatAddress(address)}</span>
              </p>
              <p className="mb-3 flex justify-between items-center">
                <span className="text-zinc-400">Network:</span>
                <span className="font-medium">{getNetworkNameAction(chainId)}</span>
              </p>
              <p className="text-zinc-300">
                <span className="block text-zinc-400 mb-1">Message:</span>
                <span className="block">
                  Sign in to MyNFTs with your Ethereum account. This signature doesn't cost gas and
                  securely identifies you.
                </span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onAuthenticateAction}
                disabled={isAuthenticating}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-colors disabled:opacity-70"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Waiting...</span>
                  </>
                ) : (
                  <span>Sign Message</span>
                )}
              </button>
              <button
                onClick={onCancelSignAction}
                disabled={isAuthenticating}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-70"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      );

    case 'checking':
      return (
        <>
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold mb-2">
              Wallet Verification
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm mb-4">
              Signing for wallet confirmation...
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-zinc-300 text-center">Signing for wallet confirmation...</p>
          </div>
        </>
      );

    case 'details':
      return (
        <>
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold mb-2">Wallet Details</DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm mb-4">
              Your wallet is connected and authenticated
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col mt-4">
            <div className="p-4 mb-5 bg-zinc-800 rounded-lg border border-zinc-700 text-zinc-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-zinc-400">Address:</span>
                <div className="flex items-center">
                  <span className="font-mono text-sm mr-2">{safeFormatAddress(address)}</span>
                  <button
                    onClick={onCopyAddressAction}
                    className="bg-zinc-700 hover:bg-zinc-600 rounded-md p-1.5 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-300" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-zinc-400">Network:</span>
                <span className="text-sm font-medium">{getNetworkNameAction(chainId)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Status:</span>
                <span className="text-sm flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  Connected
                </span>
              </div>
            </div>

            <button
              onClick={onDisconnectAction}
              className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" /> Disconnect Wallet
            </button>
          </div>
        </>
      );

    default:
      return null;
  }
}
