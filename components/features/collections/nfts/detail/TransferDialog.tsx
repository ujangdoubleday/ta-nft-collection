'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import { useWallet } from '@/lib/hooks/wallet';
import { useNFTTransfer } from '@/lib/blockchain/hooks/useNFTTransfer';
import { Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TransferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipientAddress: string;
  onAddressChange: (address: string) => void;
  contractAddress: string;
  tokenId: string;
  ownerAddress: string;
}

export function TransferDialog({
  isOpen,
  onClose,
  recipientAddress,
  onAddressChange,
  contractAddress,
  tokenId,
  ownerAddress,
}: TransferDialogProps) {
  const { address } = useWallet();
  const { transferNFT, isLoading, isWaiting, isSuccess, transactionHash, error } = useNFTTransfer();

  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Watch for success state
  if (isSuccess && !transferSuccess) {
    setTransferSuccess(true);

    // Refresh the page after a brief delay to show updated owner
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  const handleTransfer = async () => {
    if (!recipientAddress) {
      setTransferError('Please enter a recipient address');
      return;
    }

    if (!recipientAddress.startsWith('0x')) {
      setTransferError('Please enter a valid Ethereum address');
      return;
    }

    if (!address) {
      setTransferError('Please connect your wallet first');
      return;
    }

    if (address.toLowerCase() !== ownerAddress.toLowerCase()) {
      setTransferError('Only the owner can transfer this NFT');
      return;
    }

    setTransferError(null);
    setTransferSuccess(false);

    try {
      // Call the blockchain to transfer the NFT
      const result = await transferNFT(contractAddress, ownerAddress, recipientAddress, tokenId);

      if (result.error) {
        setTransferError(`Blockchain error: ${result.error.message}`);
        return;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setTransferError(`Error: ${errorMessage}`);
    }
  };

  const buttonDisabled = isLoading || isWaiting;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        title="Transfer NFT"
        className="bg-[#0A0A0A] border border-[#1f1f1f] text-white"
      >
        <DialogHeader>
          <DialogDescription className="text-zinc-400">
            Enter the wallet address of the recipient to transfer this NFT.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <label className="block text-sm text-zinc-400 mb-2">Recipient Address</label>
          <Input
            id="recipient"
            type="text"
            className="bg-black border border-zinc-800 text-white"
            placeholder="0x..."
            value={recipientAddress}
            onChange={(e) => onAddressChange(e.target.value)}
            disabled={buttonDisabled}
          />

          {transferError && (
            <div className="bg-red-900/20 border border-red-900/30 text-red-400 px-4 py-3 rounded mt-4">
              {transferError}
            </div>
          )}

          {transferSuccess && (
            <div className="bg-green-900/20 border border-green-900/30 text-green-400 px-4 py-3 rounded mt-4">
              NFT transferred successfully! Page will refresh shortly.
            </div>
          )}

          {transactionHash && !transferSuccess && (
            <Alert className="mt-4 bg-black/40 border border-zinc-800">
              <AlertDescription className="flex items-center justify-between">
                <span className="text-xs text-zinc-300 truncate">
                  Transaction: {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                </span>
                <a
                  href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center"
                >
                  View <ExternalLink size={12} className="ml-1" />
                </a>
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            className="hover:bg-zinc-800"
            variant="ghost"
            onClick={() => onClose()}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleTransfer()}
            disabled={buttonDisabled}
            className="bg-white text-black hover:bg-zinc-300 hover:text-black"
          >
            {isLoading || isWaiting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isLoading ? 'Requesting Transfer...' : 'Waiting for Confirmation...'}</span>
              </div>
            ) : (
              'Transfer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
