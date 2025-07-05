'use client';

import { useState } from 'react';
import { useNFTBurn } from '@/lib/blockchain/hooks';
import { useWallet } from '@/lib/hooks/wallet';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/molecules/dialog';
import { NFTItem } from './types';

interface BurnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nft: NFTItem;
}

export function BurnDialog({ isOpen, onClose, nft }: BurnDialogProps) {
  const { address } = useWallet();
  const { burnNFT, isLoading, isWaiting, isSuccess, transactionHash, error } = useNFTBurn();

  const [burnError, setBurnError] = useState<string | null>(null);
  const [burnSuccess, setBurnSuccess] = useState(false);

  // Watch for success state
  if (isSuccess && !burnSuccess) {
    setBurnSuccess(true);

    // Redirect to collection page after a brief delay
    setTimeout(() => {
      // Extract collection address from URL and redirect
      const pathParts = window.location.pathname.split('/');
      const collectionAddress = pathParts[pathParts.indexOf('collections') + 1];
      window.location.href = `/my/collections/${collectionAddress}/nfts`;
    }, 2000);
  }

  const handleBurn = async () => {
    if (!address) {
      setBurnError('Please connect your wallet first');
      return;
    }

    if (address.toLowerCase() !== nft.owner.toLowerCase()) {
      setBurnError('Only the owner can burn this NFT');
      return;
    }

    setBurnError(null);
    setBurnSuccess(false);

    try {
      // Extract contract address from nft
      const contractAddress = nft.id.split('/')[0];

      // Call the blockchain to burn the NFT
      const result = await burnNFT(contractAddress, nft.tokenId);

      if (result.error) {
        setBurnError(`Blockchain error: ${result.error.message}`);
        return;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setBurnError(`Error: ${errorMessage}`);
    }
  };

  const buttonDisabled = isLoading || isWaiting;
  const buttonLabel = isLoading
    ? 'Requesting Burn...'
    : isWaiting
      ? 'Waiting for Confirmation...'
      : 'Burn NFT';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent title="Burn NFT">
        <DialogHeader>
          <DialogDescription>
            Are you sure you want to burn this NFT? This action cannot be undone and will
            permanently remove the token from circulation.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-red-900/20 border border-red-700/40 text-red-400 px-3 py-2 rounded text-sm mb-4">
            <p className="font-semibold mb-1">Warning:</p>
            <p>
              Burning an NFT is permanent. The token will be sent to a null address and cannot be
              recovered.
            </p>
          </div>

          {burnError && (
            <div className="mt-2 bg-red-900/20 border border-red-700/40 text-red-400 px-3 py-2 rounded text-sm">
              {burnError}
            </div>
          )}

          {burnSuccess && (
            <div className="mt-2 bg-green-900/20 border border-green-700/40 text-green-400 px-3 py-2 rounded text-sm">
              NFT burned successfully! Redirecting to collection page shortly.
            </div>
          )}

          {transactionHash && !burnSuccess && (
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
            disabled={buttonDisabled && burnSuccess}
          >
            Cancel
          </button>
          <button
            onClick={handleBurn}
            disabled={buttonDisabled}
            className={`flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors ${
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
