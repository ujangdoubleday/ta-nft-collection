'use client';

import React from 'react';
import { DialogHeader, DialogDescription } from '@/components/ui/dialog';
import { MetaMaskIcon } from '@/components/shared/MetaMaskIcon';
import { Copy, Check, LogOut, AlertTriangle } from 'lucide-react';
import { formatAddress } from '@/lib/utils';
import { LogMessage } from './useWalletModal';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';

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

export function WalletModalContent({
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
            <DialogDescription className="text-zinc-400 text-sm mb-4">
              Connect your wallet to access your NFT collections and create new digital assets.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col mt-4 space-y-4">
            <Button
              onClick={onConnectAction}
              disabled={isConnecting}
              size="lg"
              className="bg-white text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900 py-6 font-medium shadow-md border border-zinc-200"
            >
              {isConnecting ? (
                <>
                  <Spinner size="sm" color="black" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <MetaMaskIcon className="w-6 h-6" />
                  <span>Connect with MetaMask</span>
                </>
              )}
            </Button>
          </div>
        </>
      );

    case 'sign':
      return (
        <>
          <DialogHeader>
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
                  Sign in to MyNFTs with your Ethereum account. This signature doesn&apos;t cost gas
                  and securely identifies you.
                </span>
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={onAuthenticateAction}
                disabled={isAuthenticating}
                className="flex-1 bg-white text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900 border border-zinc-200"
              >
                {isAuthenticating ? (
                  <>
                    <Spinner size="sm" color="black" />
                    <span>Waiting for wallet...</span>
                  </>
                ) : (
                  <span>Sign Message</span>
                )}
              </Button>
              <Button
                onClick={onCancelSignAction}
                disabled={isAuthenticating}
                variant="outline"
                className="bg-transparent text-white hover:text-white hover:bg-zinc-800 border border-zinc-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </>
      );

    case 'checking':
      return (
        <>
          <DialogHeader>
            <DialogDescription className="text-zinc-400 text-sm mb-4">
              Signing for wallet confirmation...
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            <Spinner size="lg" color="white" text="Signing for wallet confirmation..." />
          </div>
        </>
      );

    case 'details':
      return (
        <>
          <DialogHeader>
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

            <Button
              onClick={onDisconnectAction}
              className="w-full bg-white text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900 border border-zinc-200"
            >
              <LogOut className="w-4 h-4" /> Disconnect Wallet
            </Button>
          </div>
        </>
      );

    default:
      return null;
  }
}
