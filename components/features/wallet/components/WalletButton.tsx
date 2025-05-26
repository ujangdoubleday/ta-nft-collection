import { WalletModalContent } from '@/components/features/wallet/components/WalletModalContent';
import {
  Win98ErrorNotification,
  Win98SuccessNotification,
} from '@/components/layout/notifications';
import { Button } from '@/components/ui/button';
import {
  Win98Dialog,
  Win98DialogContent,
  Win98DialogTrigger,
} from '@/components/ui/win98/Win98Dialog';
import { formatAddress } from '@/lib/utils';
import { useState } from 'react';
import { useWalletModal } from './useWalletModal';

export const WalletButton = () => {
  const [_showHelp, setShowHelp] = useState(false);

  const {
    isWalletModalOpen,
    copied,
    walletModalStep,
    showSuccessNotification,
    showErrorNotification,
    errorMessage,
    address,
    isConnected,
    isConnecting,
    isAuthenticated,
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
    handleCloseSuccessNotification,
    handleCloseErrorNotification,
  } = useWalletModal();

  const _triggerMetaMask = async () => {
    try {
      // Attempt to force MetaMask to show
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setShowHelp(false);
      } else {
        alert('MetaMask tidak terinstall. Silakan install MetaMask dan refresh halaman.');
      }
    } catch (err) {
      console.error('Error triggering MetaMask:', err);
    }
  };

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
                <span className="text-sm">{formatAddress(address || '').substring(0, 6)}</span>
              </div>
            ) : (
              <div>
                <span className="hidden xs:inline">Connect Wallet</span>
                <span className="xs:inline sm:hidden">Connect</span>
              </div>
            )}
          </Button>
        </Win98DialogTrigger>
        <Win98DialogContent title="Wallet Connection" className="max-w-md sm:max-w-md">
          <WalletModalContent
            step={walletModalStep}
            address={address}
            chainId={chainId}
            isConnecting={isConnecting}
            isAuthenticating={isAuthenticating}
            copied={copied}
            getNetworkName={getNetworkName}
            onConnect={handleConnect}
            onAuthenticate={handleAuthenticate}
            onCopyAddress={copyAddress}
            onDisconnect={handleDisconnect}
            onCancelSign={handleCancelSign}
          />
        </Win98DialogContent>
      </Win98Dialog>

      {showSuccessNotification && (
        <Win98SuccessNotification
          message="Wallet Connected Successfully"
          onClose={handleCloseSuccessNotification}
        />
      )}

      {showErrorNotification && (
        <Win98ErrorNotification message={errorMessage} onClose={handleCloseErrorNotification} />
      )}
    </>
  );
};
