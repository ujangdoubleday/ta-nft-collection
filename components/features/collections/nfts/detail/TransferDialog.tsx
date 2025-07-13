'use client';

import { useState, useEffect } from 'react';
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
import Spinner from '@/components/ui/spinner';
import { toast } from 'sonner';

// Valid characters for Ethereum address (0-9, a-f, A-F)
const ETH_ADDRESS_REGEX = /^0x[0-9a-fA-F]*$/;
const ETH_ADDRESS_LENGTH = 42; // 0x + 40 hex characters

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
  const [addressError, setAddressError] = useState('');
  const [hasShownSuccessToast, setHasShownSuccessToast] = useState(false);

  // Watch for success state using useEffect to prevent multiple toasts
  useEffect(() => {
    if (isSuccess && !hasShownSuccessToast) {
      // Show success toast only once
      toast.success('NFT transferred successfully!');
      setHasShownSuccessToast(true);

      // Close the dialog and refresh the page after a brief delay
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    }
  }, [isSuccess, hasShownSuccessToast, onClose]);

  // Reset the success toast flag when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setHasShownSuccessToast(false);
    }
  }, [isOpen]);

  // Validate Ethereum address format
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Always allow empty input (for clearing)
    if (value === '') {
      onAddressChange('');
      setAddressError('');
      return;
    }

    // Always ensure address starts with 0x
    if (!value.startsWith('0x')) {
      setAddressError('Address must start with 0x');
      return;
    }

    // Check if the address contains only valid hex characters
    if (!ETH_ADDRESS_REGEX.test(value)) {
      setAddressError('Address can only contain 0-9, a-f, A-F');
      return;
    }

    // Check address length
    if (value.length > ETH_ADDRESS_LENGTH) {
      setAddressError(`Address cannot exceed ${ETH_ADDRESS_LENGTH} characters`);
      return;
    }

    // Valid input
    onAddressChange(value);
    setAddressError('');

    // Show warning if address is incomplete
    if (value.length < ETH_ADDRESS_LENGTH) {
      setAddressError(`Address should be ${ETH_ADDRESS_LENGTH} characters long`);
    }
  };

  const handleTransfer = async () => {
    if (!recipientAddress) {
      toast.error('Please enter a recipient address');
      return;
    }

    if (
      recipientAddress.length !== ETH_ADDRESS_LENGTH ||
      !ETH_ADDRESS_REGEX.test(recipientAddress)
    ) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (address.toLowerCase() !== ownerAddress.toLowerCase()) {
      toast.error('Only the owner can transfer this NFT');
      return;
    }

    try {
      // Call the blockchain to transfer the NFT
      const result = await transferNFT(contractAddress, ownerAddress, recipientAddress, tokenId);

      if (result.error) {
        // Simplified error handling
        if (
          result.error.message.includes('User rejected the request') ||
          result.error.message.includes('user rejected transaction') ||
          result.error.message.includes('User denied transaction signature')
        ) {
          toast.error('Transaction was rejected. Please approve the transaction to continue.');
        } else if (result.error.message.includes('insufficient funds')) {
          toast.error('Insufficient funds in your wallet to complete this transaction.');
        } else if (result.error.message.includes('gas')) {
          toast.error('Error with transaction gas. Please check your wallet settings.');
        } else {
          // For other errors, show a simpler message
          toast.error('Transaction failed. Please try again.');
        }
        return;
      }
    } catch (err) {
      // Simplified error handling for caught exceptions
      if (err instanceof Error) {
        if (
          err.message.includes('User rejected the request') ||
          err.message.includes('user rejected transaction') ||
          err.message.includes('User denied transaction signature')
        ) {
          toast.error('Transaction was rejected. Please approve the transaction to continue.');
        } else if (err.message.includes('insufficient funds')) {
          toast.error('Insufficient funds in your wallet to complete this transaction.');
        } else if (err.message.includes('gas')) {
          toast.error('Error with transaction gas. Please check your wallet settings.');
        } else {
          toast.error('Transaction failed. Please try again.');
        }
      } else {
        toast.error('An unknown error occurred. Please try again.');
      }
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
            className={`bg-black border ${addressError ? 'border-red-700' : 'border-zinc-800'} text-white`}
            placeholder="0x..."
            value={recipientAddress}
            onChange={handleAddressChange}
            disabled={buttonDisabled}
          />
          {addressError && <p className="text-xs text-red-400 mt-1">{addressError}</p>}

          {transactionHash && (
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
            disabled={
              buttonDisabled || !!addressError || recipientAddress.length !== ETH_ADDRESS_LENGTH
            }
            className="bg-white text-black hover:bg-zinc-300 hover:text-black"
          >
            {isLoading || isWaiting ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner size="sm" color="black" />
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
