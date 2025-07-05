'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/molecules/dialog';
import { useWallet } from '@/lib/hooks/wallet';
import { useNFTTransfer } from '@/lib/blockchain/hooks/useNFTTransfer';
import { Loader2 } from 'lucide-react';

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
  const buttonLabel = isLoading
    ? 'Requesting Transfer...'
    : isWaiting
      ? 'Waiting for Confirmation...'
      : 'Transfer';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent title="Transfer NFT">
        <DialogHeader>
          <DialogDescription>
            Enter the wallet address of the recipient to transfer this NFT.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <label htmlFor="recipient" className="block text-sm font-medium text-zinc-400 mb-2">
            Recipient Address
          </label>
          <input
            id="recipient"
            type="text"
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-zinc-600"
            placeholder="0x..."
            value={recipientAddress}
            onChange={(e) => onAddressChange(e.target.value)}
            disabled={buttonDisabled}
          />

          {transferError && (
            <div className="mt-2 bg-red-900/20 border border-red-700/40 text-red-400 px-3 py-2 rounded text-sm">
              {transferError}
            </div>
          )}

          {transferSuccess && (
            <div className="mt-2 bg-green-900/20 border border-green-700/40 text-green-400 px-3 py-2 rounded text-sm">
              NFT transferred successfully! Page will refresh shortly.
            </div>
          )}

          {transactionHash && !transferSuccess && (
            <div className="mt-2 bg-blue-900/20 border border-blue-700/40 text-blue-400 px-3 py-2 rounded text-sm">
              Transaction: {transactionHash.substring(0, 10)}...
              {transactionHash.substring(transactionHash.length - 6)}
            </div>
          )}
        </div>
        <DialogFooter>
          <button
            onClick={onClose}
            className="flex items-center justify-center px-4 py-2 border border-zinc-600 text-zinc-200 rounded-md hover:bg-zinc-800 transition-colors"
            disabled={buttonDisabled && transferSuccess}
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={buttonDisabled}
            className={`flex items-center justify-center gap-2 px-4 py-2 bg-white text-black rounded-md hover:bg-zinc-300 transition-colors ${
              buttonDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading || isWaiting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {buttonLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
