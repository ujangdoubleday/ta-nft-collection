'use client';

import { WalletModalContent } from '@/components/features/wallet/components/WalletModalContent';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { formatAddress } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useWalletModal } from './useWalletModal';
import { toast } from 'sonner';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

export const WalletButton = () => {
  const [_showHelp, setShowHelp] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const {
    isWalletModalOpen,
    copied,
    walletModalStep,
    showSuccessNotification,
    showErrorNotification,
    errorMessage,
    successMessage,
    address,
    isConnected,
    isConnecting,
    isAuthenticated,
    isAuthenticating,
    isDisconnecting,
    chainId,
    getNetworkName,
    copyAddress,
    handleConnect,
    handleAuthenticate,
    handleCancelSign,
    handleDisconnect,
    handleWalletButtonClick,
    handleDialogOpenChange,
    handleCloseSuccessNotification,
    handleCloseErrorNotification,
    logMessages,
  } = useWalletModal();

  // Menentukan title berdasarkan step wallet
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show toast notifications when state changes
  useEffect(() => {
    if (isMounted && showSuccessNotification && !isDisconnecting) {
      toast.success(successMessage);
      handleCloseSuccessNotification();
    }
  }, [showSuccessNotification, successMessage, isDisconnecting, isMounted]);

  useEffect(() => {
    if (isMounted && showErrorNotification && !isDisconnecting) {
      toast.error(errorMessage);
      handleCloseErrorNotification();
    }
  }, [showErrorNotification, errorMessage, isDisconnecting, isMounted]);

  if (!isMounted) return null;

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isWalletModalOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          <Button
            onClick={() => handleWalletButtonClick()}
            variant="outline"
            className="bg-white text-zinc-900 border border-zinc-200 text-[15px] hover:bg-zinc-100 hover:text-zinc-900 font-medium shadow-sm"
          >
            {isConnected && isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-[15px] font-medium">{formatAddress(address || '')}</span>
              </div>
            ) : (
              <div className="flex items-center">
                <span className="hidden xs:inline font-medium">Connect Wallet</span>
                <span className="xs:hidden">Connect</span>
              </div>
            )}
          </Button>
        </DialogTrigger>
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
};
