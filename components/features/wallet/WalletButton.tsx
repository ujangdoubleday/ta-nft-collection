import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { formatAddress } from "@/lib/utils";
import { WalletModalContent } from "@/components/features/wallet/WalletModalContent";
import { useWalletModal } from "./useWalletModal";
import {
  Win98SuccessNotification,
  Win98ErrorNotification,
} from "@/components/layout/notifications";

export const WalletButton = () => {
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

  return (
    <>
      <Dialog open={isWalletModalOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          <Button
            onClick={handleWalletButtonClick}
            className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-black text-xs h-8 hover:bg-[#c0c0c0] hover-active press-effect"
          >
            {isConnected && isAuthenticated ? (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs">
                  {formatAddress(address || "").substring(0, 6)}
                </span>
              </div>
            ) : (
              <div>
                <span className="hidden xs:inline">Connect Wallet</span>
                <span className="xs:inline sm:hidden">Connect</span>
              </div>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4 max-w-md sm:max-w-md text-black shadow-md">
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
        </DialogContent>
      </Dialog>

      {showSuccessNotification && (
        <Win98SuccessNotification
          message="Wallet Connected Successfully"
          onClose={handleCloseSuccessNotification}
        />
      )}

      {showErrorNotification && (
        <Win98ErrorNotification
          message={errorMessage}
          onClose={handleCloseErrorNotification}
        />
      )}
    </>
  );
};
