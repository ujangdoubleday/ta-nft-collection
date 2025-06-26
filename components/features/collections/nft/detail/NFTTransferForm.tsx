'use client';

import { Button, Input } from '@/components/ui/atoms';
import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { useState, useEffect } from 'react';
import { useWallet } from '@/lib/hooks/wallet';
import { useNFTTransfer } from '@/lib/blockchain/hooks/useNFTTransfer';
import { useRouter } from 'next/navigation';

interface NFTTransferFormProps {
  contractAddress: string;
  tokenId: string;
  ownerAddress: string;
}

type ConsoleMessage = {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
};

export function NFTTransferForm({ contractAddress, tokenId, ownerAddress }: NFTTransferFormProps) {
  const router = useRouter();
  const { address } = useWallet();
  const { transferNFT, isLoading, isWaiting, isSuccess, transactionHash, transferEvents, reset } =
    useNFTTransfer();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Console messages
  const [showConsole, setShowConsole] = useState(false);
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);

  // Function to add a console message
  const addConsoleMessage = (
    message: string,
    type: 'info' | 'success' | 'error' | 'warning' = 'info',
  ) => {
    setConsoleMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random().toString(),
        message,
        type,
        timestamp: new Date(),
      },
    ]);
  };

  // Reset everything when component unmounts
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Watch for transfer events
  useEffect(() => {
    if (transferEvents && transferEvents.length > 0) {
      // Get the most recent event
      const latestEvent = transferEvents[transferEvents.length - 1];

      if (latestEvent.tokenId === tokenId) {
        addConsoleMessage(
          `Transfer event detected: Token #${latestEvent.tokenId} transferred on blockchain!`,
          'success',
        );

        // Add details about the transfer
        addConsoleMessage(
          `From: ${latestEvent.from.substring(0, 6)}...${latestEvent.from.substring(latestEvent.from.length - 4)}`,
          'info',
        );
        addConsoleMessage(
          `To: ${latestEvent.to.substring(0, 6)}...${latestEvent.to.substring(latestEvent.to.length - 4)}`,
          'info',
        );

        // If transfer event is detected and matches our transaction, mark as success
        if (recipientAddress.toLowerCase() === latestEvent.to.toLowerCase()) {
          setTransferSuccess(true);
          setIsSubmitting(false);
          addConsoleMessage('NFT transfer completed successfully!', 'success');

          // Refresh the page after a brief delay to show updated owner
          setTimeout(() => {
            // Force a hard refresh to update all blockchain data
            window.location.reload();
          }, 2000);
        }
      }
    }
  }, [transferEvents, tokenId, recipientAddress]);

  const handleTransfer = async () => {
    if (!recipientAddress) {
      setTransferError('Please enter a recipient address');
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

    // Reset and show console
    setConsoleMessages([]);
    setShowConsole(true);
    setIsSubmitting(true);
    setTransferError(null);
    setTransferSuccess(false);

    try {
      addConsoleMessage(`Initiating NFT transfer process...`, 'info');
      addConsoleMessage(`Preparing to transfer NFT ID: ${tokenId}`, 'info');
      addConsoleMessage(
        `From: ${ownerAddress.substring(0, 6)}...${ownerAddress.substring(ownerAddress.length - 4)}`,
        'info',
      );
      addConsoleMessage(
        `To: ${recipientAddress.substring(0, 6)}...${recipientAddress.substring(recipientAddress.length - 4)}`,
        'info',
      );
      addConsoleMessage(`Requesting wallet approval for safeTransferFrom...`, 'info');

      // Call the blockchain to transfer the NFT using safeTransferFrom
      const result = await transferNFT(contractAddress, ownerAddress, recipientAddress, tokenId);

      if (result.error) {
        setTransferError(`Blockchain error: ${result.error.message}`);
        setIsSubmitting(false);
        addConsoleMessage(`Transfer failed: ${result.error.message}`, 'error');
        return;
      }

      if (result.hash) {
        addConsoleMessage(`Transaction submitted to blockchain!`, 'success');
        addConsoleMessage(
          `Transaction hash: ${result.hash.substring(0, 10)}...${result.hash.substring(result.hash.length - 8)}`,
          'info',
        );
        addConsoleMessage(`Waiting for blockchain confirmation and Transfer event...`, 'info');

        // Note: We'll wait for the Transfer event to be detected before marking as success
        // This happens in the useEffect above that watches transferEvents
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setTransferError(`Error: ${errorMessage}`);
      setIsSubmitting(false);
      addConsoleMessage(`Error: ${errorMessage}`, 'error');
    }
  };

  const buttonDisabled = isSubmitting || isLoading || isWaiting;
  const buttonLabel = isLoading
    ? 'Requesting Transfer...'
    : isWaiting
      ? 'Waiting for Confirmation...'
      : isSubmitting
        ? 'Processing Transfer...'
        : 'Transfer NFT';

  return (
    <Win98Window title="Transfer NFT" icon="/assets/icons/window/gallery.png" className="mb-3">
      <p className="text-black text-sm mb-2">Transfer this NFT to another wallet address.</p>
      <div className="mb-2">
        <label className="text-black text-sm block mb-1">Recipient Address</label>
        <Input
          placeholder="Enter recipient wallet address"
          className="hover:border-[#0000ff] focus:border-[#0000ff] text-sm h-8 py-0"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          disabled={buttonDisabled}
        />
      </div>

      {transferError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-1 rounded mb-2 text-xs">
          {transferError}
        </div>
      )}

      {transferSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-1 rounded mb-2 text-xs">
          NFT transferred successfully! Page will refresh shortly.
        </div>
      )}

      {transactionHash && !transferSuccess && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-3 py-1 rounded mb-2 text-xs">
          Transaction: {transactionHash.substring(0, 10)}...
          {transactionHash.substring(transactionHash.length - 6)}
        </div>
      )}

      {/* Console Output */}
      {showConsole && consoleMessages.length > 0 && (
        <div className="border border-gray-300 bg-black text-green-500 p-2 mb-2 rounded font-mono text-xs h-40 overflow-y-auto">
          {consoleMessages.map((msg) => (
            <div
              key={msg.id}
              className={`
                ${msg.type === 'error' ? 'text-red-500' : ''}
                ${msg.type === 'success' ? 'text-green-400' : ''}
                ${msg.type === 'warning' ? 'text-yellow-500' : ''}
                ${msg.type === 'info' ? 'text-blue-400' : ''}
              `}
            >
              &gt; {msg.message}
            </div>
          ))}
          <div className="h-2"></div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          className="hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset] text-sm py-0 h-8"
          onClick={handleTransfer}
          disabled={buttonDisabled}
        >
          {buttonLabel}
        </Button>
      </div>
    </Win98Window>
  );
}
