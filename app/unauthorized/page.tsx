'use client';

import React, { useState, useEffect } from 'react';
import { MetaMaskIcon } from '@/components/shared/media';
import { useWalletModal } from '@/components/features/wallet/components/useWalletModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/molecules/dialog';
import { WalletModalContent } from '@/components/features/wallet/components/WalletModalContent';
import Spinner from '@/components/ui/spinner';

export default function UnauthorizedPage() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callback = searchParams.get('callback') || '/my';

  const {
    isWalletModalOpen,
    copied,
    walletModalStep,
    address,
    isConnected,
    isAuthenticated,
    isConnecting,
    isAuthenticating,
    chainId,
    getNetworkName,
    copyAddress,
    handleConnect,
    handleAuthenticate,
    handleCancelSign,
    handleDisconnect,
    handleWalletButtonClick,
    handleDialogOpenChange,
    logMessages,
  } = useWalletModal();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // When the wallet is connected and authenticated, redirect
  useEffect(() => {
    if (isMounted && isConnected && isAuthenticated) {
      router.replace(callback);
    }
  }, [isMounted, isConnected, isAuthenticated, callback, router]);

  // Get dialog title based on wallet step
  const getDialogTitle = () => {
    switch (walletModalStep) {
      case 'connect':
        return 'Connect Wallet';
      case 'sign':
        return 'Authenticate';
      case 'checking':
        return 'Wallet Verification';
      case 'details':
        return 'Wallet Details';
      default:
        return 'Connect Wallet';
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-lg animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 text-white">Authentication Required</h1>
        </div>

        <div className="space-y-6">
          {isConnected && isAuthenticated ? (
            <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg text-center">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-white font-medium">Wallet Connected</span>
              </div>
              <p className="text-zinc-400 text-sm">Redirecting you...</p>
              <div className="mt-3 flex justify-center">
                <Spinner size="md" color="white" />
              </div>
            </div>
          ) : (
            <button
              onClick={handleWalletButtonClick}
              className="w-full py-3 px-4 bg-white text-black hover:bg-zinc-200 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-3"
              aria-label="Connect wallet"
            >
              <MetaMaskIcon className="w-5 h-5" />
              <span>Connect Wallet</span>
            </button>
          )}

          <button
            onClick={() => router.push('/')}
            className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium border border-zinc-700 transition-all duration-300"
            aria-label="Back to homepage"
          >
            Back to Homepage
          </button>
        </div>
      </div>

      {/* Wallet Modal Dialog */}
      <Dialog open={isWalletModalOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent title={getDialogTitle()}>
          <WalletModalContent
            step={walletModalStep}
            address={address}
            chainId={chainId?.toString() || null}
            isConnecting={isConnecting}
            isAuthenticating={isAuthenticating}
            copied={copied}
            getNetworkNameAction={getNetworkName}
            onConnectAction={handleConnect}
            onAuthenticateAction={handleAuthenticate}
            onCopyAddressAction={copyAddress}
            onDisconnectAction={handleDisconnect}
            onCancelSignAction={handleCancelSign}
            logMessages={logMessages}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
