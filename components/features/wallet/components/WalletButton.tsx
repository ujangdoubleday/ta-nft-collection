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
            className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-black text-sm h-8 hover:bg-[#c0c0c0] hover-active press-effect"
          >
            {isConnected && isAuthenticated ? (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-bold">
                  {formatAddress(address || '').substring(0, 6)}
                </span>
              </div>
            ) : (
              <div>
                <span className="hidden xs:inline font-bold">Connect Wallet</span>
                <span className="xs:inline sm:hidden">Connect</span>
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
