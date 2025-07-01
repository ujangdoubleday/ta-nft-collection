'use client';

import { WalletModalContent } from '@/components/features/wallet/components/WalletModalContent';
import {
  Win98ErrorNotification,
  Win98SuccessNotification,
  Win98Notification,
} from '@/components/features/layout/notifications';
import { Button } from '@/components/ui/atoms/button';
import { Win98Dialog, Win98DialogContent, Win98DialogTrigger } from '@/components/ui/organisms';
import { formatAddress } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useWalletModal } from './useWalletModal';

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <Win98Dialog open={isWalletModalOpen} onOpenChange={handleDialogOpenChange}>
        <Win98DialogTrigger asChild>
          <Button
            onClick={handleWalletButtonClick}
            className="bg-zinc-800/50 text-white border border-zinc-700/50 rounded-md text-[15px] py-1 px-3 h-8 hover:bg-zinc-700/50 transition-colors font-sans"
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
        </Win98DialogTrigger>
        <Win98DialogContent title="Wallet Connection" className="max-w-md sm:max-w-md">
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
        </Win98DialogContent>
      </Win98Dialog>

      {showSuccessNotification && !isDisconnecting && (
        <Win98SuccessNotification
          message={successMessage}
          onClose={handleCloseSuccessNotification}
        />
      )}

      {showErrorNotification && !isDisconnecting && (
        <Win98ErrorNotification message={errorMessage} onClose={handleCloseErrorNotification} />
      )}
    </>
  );
};
