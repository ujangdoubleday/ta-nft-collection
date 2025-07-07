'use client';

import React, { useState, useEffect } from 'react';
import { MetaMaskIcon } from '@/components/shared/media';
import { useWalletModal } from '@/components/features/wallet/components/useWalletModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/molecules/dialog';
import { WalletModalContent } from '@/components/features/wallet/components/WalletModalContent';
import Spinner from '@/components/ui/spinner';
import { useSession } from 'next-auth/react';

export default function UnauthorizedPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [localStorageAuth, setLocalStorageAuth] = useState<{
    address: string;
    time: string;
  } | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callback = searchParams.get('callback') || '/my';

  // Add NextAuth session hook
  const { data: session, status } = useSession();

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

    // Check localStorage for authentication data
    try {
      const storedAddress = localStorage.getItem('lastAuthAddress');
      const storedTime = localStorage.getItem('lastAuthTime');

      if (storedAddress && storedTime) {
        const authTime = new Date(storedTime);
        const now = new Date();

        // If auth was in last 4 hours, consider it valid
        if (now.getTime() - authTime.getTime() < 4 * 60 * 60 * 1000) {
          setLocalStorageAuth({
            address: storedAddress,
            time: storedTime,
          });
        }
      }
    } catch (e) {
      // Silent error handling for localStorage
    }
  }, []);

  // Enhanced redirect logic with session check
  useEffect(() => {
    if (!isMounted) return;

    // Check auth from multiple sources
    const isFullyAuthenticated =
      (isConnected && isAuthenticated && session?.user?.address) ||
      (isConnected && address && localStorageAuth?.address === address);

    if (isFullyAuthenticated) {
      // Try to fix the session if using localStorage fallback
      if (!session?.user?.address && localStorageAuth?.address) {
        setTimeout(() => {
          // Force page reload to retry session fetch before navigating
          window.location.reload();
        }, 500);
        return;
      }

      // Use window.location for more reliable redirect in production
      if (typeof window !== 'undefined') {
        window.location.href = callback;
      }
    }
  }, [isMounted, isConnected, isAuthenticated, session, address, localStorageAuth, callback]);

  // Additional effect to handle session loading
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated' && session?.user?.address) {
      if (typeof window !== 'undefined') {
        window.location.href = callback;
      } else {
        router.replace(callback);
      }
    }
  }, [status, session, callback, router]);

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

  // Show different states based on session and wallet status
  const isLoadingSession = status === 'loading';
  const isSessionAuthenticated = status === 'authenticated' && session?.user?.address;
  const isWalletAuthenticated = isConnected && isAuthenticated;
  const isLocalStorageAuthenticated =
    isConnected && address && localStorageAuth?.address === address;

  // Use any valid authentication method
  const isAnyAuthMethod =
    isSessionAuthenticated || (isWalletAuthenticated && isConnected) || isLocalStorageAuthenticated;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-lg animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 text-white">Authentication Required</h1>
        </div>

        <div className="space-y-6">
          {process.env.NODE_ENV === 'production' && localStorageAuth && (
            <div className="p-3 bg-green-900/30 border border-green-800 rounded text-xs text-green-300 mb-4">
              <div>Found saved authentication data.</div>
              <div>Connect the same wallet to continue.</div>
            </div>
          )}

          {isLoadingSession || isAnyAuthMethod ? (
            <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg text-center">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-white font-medium">
                  {isLoadingSession ? 'Loading...' : 'Wallet Connected'}
                </span>
              </div>
              <p className="text-zinc-400 text-sm">
                {isLoadingSession ? 'Checking authentication...' : 'Redirecting you...'}
              </p>
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
