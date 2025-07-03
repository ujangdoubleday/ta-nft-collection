'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Trash2, Clock, User, Tag, FileText, Send } from 'lucide-react';
import { shortenAddress } from '@/lib/utils/formatting';

// Add dialog imports
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/molecules/dialog';

// Sample NFT data - in a real app, this would come from an API or blockchain
const SAMPLE_NFT = {
  id: '1',
  tokenId: '1',
  name: 'Pixel Art #1',
  description:
    'A unique pixel art NFT inspired by retro gaming aesthetics. This piece showcases vibrant colors and intricate pixel details that pay homage to the golden era of 8-bit gaming.',
  imageUrl: '/assets/images/nfts/pixel-art/pixel-1.svg',
  owner: '0x1234567890abcdef1234567890abcdef12345678',
  creator: '0x7890abcdef1234567890abcdef1234567890abcd',
  mintedAt: '2023-10-20',
  attributes: [
    { trait_type: 'Background', value: 'Black' },
    { trait_type: 'Style', value: 'Pixel Art' },
    { trait_type: 'Colors', value: '16-bit' },
    { trait_type: 'Theme', value: 'Retro Gaming' },
  ],
};

interface NFTDetailContentProps {
  address: string;
  id: string;
}

export function NFTDetailContent({ address, id }: NFTDetailContentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [nft, setNft] = useState<typeof SAMPLE_NFT | null>(null);

  // Add state for dialogs
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isBurnDialogOpen, setIsBurnDialogOpen] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [isBurning, setIsBurning] = useState(false);

  // Simulate loading NFT data
  useEffect(() => {
    const timer = setTimeout(() => {
      setNft(SAMPLE_NFT);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [address, id]);

  // Add transfer function
  const handleTransfer = async () => {
    if (!recipientAddress || !recipientAddress.startsWith('0x')) {
      alert('Please enter a valid Ethereum address');
      return;
    }

    setIsTransferring(true);
    try {
      // Here you would call your transfer function
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      alert(`NFT transferred to ${recipientAddress}`);
      setIsTransferDialogOpen(false);
      setRecipientAddress('');
    } catch (error) {
      console.error('Transfer failed:', error);
      alert('Transfer failed. Please try again.');
    } finally {
      setIsTransferring(false);
    }
  };

  // Add burn function
  const handleBurn = async () => {
    setIsBurning(true);
    try {
      // Here you would call your burn function
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      alert('NFT burned successfully');
      setIsBurnDialogOpen(false);
    } catch (error) {
      console.error('Burn failed:', error);
      alert('Burn failed. Please try again.');
    } finally {
      setIsBurning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-[#1f1f1f] rounded w-1/4 mb-4"></div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2 aspect-square bg-[#1f1f1f] rounded"></div>
          <div className="w-full md:w-1/2 space-y-4">
            <div className="h-10 bg-[#1f1f1f] rounded w-3/4"></div>
            <div className="h-20 bg-[#1f1f1f] rounded w-full"></div>
            <div className="h-40 bg-[#1f1f1f] rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        <Link
          href={`/my/collections/${address}/nfts`}
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Collection NFTs
        </Link>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-2">NFT Not Found</h2>
          <p className="text-zinc-400">
            The NFT with ID {id} could not be found in collection {address}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* NFT Image */}
        <div className="w-full md:w-1/2">
          <div className="relative aspect-square bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg overflow-hidden">
            <Image
              src={nft.imageUrl}
              alt={nft.name}
              fill
              className="object-contain"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                (e.target as HTMLImageElement).src =
                  '/assets/images/placeholders/image-placeholder.svg';
              }}
            />
          </div>

          <div className="flex justify-center mt-4 gap-2">
            <button
              className="flex items-center gap-2 bg-[#0A0A0A] border border-[#1f1f1f] hover:bg-[#1f1f1f] hover:border-zinc-600 text-white py-2 px-4 rounded-md transition-colors text-sm"
              onClick={() => setIsTransferDialogOpen(true)}
            >
              <Send className="h-4 w-4" />
              Transfer
            </button>
            <button
              className="flex items-center gap-2 bg-[#0A0A0A] border border-[#1f1f1f] hover:bg-[#1f1f1f] hover:border-zinc-600 text-white py-2 px-4 rounded-md transition-colors text-sm"
              onClick={() => setIsBurnDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Burn
            </button>
          </div>
        </div>

        {/* NFT Details */}
        <div className="w-full md:w-1/2">
          <h1 className="text-2xl font-bold text-white mb-2">{nft.name}</h1>
          <p className="text-zinc-400 mb-6">{nft.description}</p>

          <div className="space-y-4">
            <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Tag className="h-4 w-4 text-white" />
                <h3 className="text-white font-medium">Token Details</h3>
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Token ID</span>
                  <span className="text-white">{nft.tokenId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Contract</span>
                  <span className="text-white font-mono">{shortenAddress(address, 6)}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-white" />
                <h3 className="text-white font-medium">Ownership</h3>
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Creator</span>
                  <span className="text-white font-mono">{shortenAddress(nft.creator, 6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Owner</span>
                  <span className="text-white font-mono">{shortenAddress(nft.owner, 6)}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-white" />
                <h3 className="text-white font-medium">History</h3>
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Minted</span>
                  <span className="text-white">{new Date(nft.mintedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {nft.attributes && nft.attributes.length > 0 && (
              <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-white" />
                  <h3 className="text-white font-medium">Attributes</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {nft.attributes.map((attr, index) => (
                    <div key={index} className="bg-[#1f1f1f] rounded-md p-2 text-center">
                      <p className="text-zinc-400 text-xs">{attr.trait_type}</p>
                      <p className="text-white text-sm font-medium">{attr.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
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
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsTransferDialogOpen(false)}
              className="flex items-center justify-center px-4 py-2 border border-zinc-600 text-zinc-200 rounded-md hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleTransfer}
              disabled={isTransferring || !recipientAddress}
              className={`flex items-center font-semibold justify-center px-4 py-2 bg-white text-black rounded-md hover:bg-zinc-300 transition-colors ${
                isTransferring || !recipientAddress ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isTransferring ? 'Transferring...' : 'Transfer'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Burn Dialog */}
      <Dialog open={isBurnDialogOpen} onOpenChange={setIsBurnDialogOpen}>
        <DialogContent title="Burn NFT">
          <DialogHeader>
            <DialogDescription>
              Are you sure you want to burn this NFT? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-zinc-800 border border-zinc-700 rounded-md p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-zinc-700 rounded-md overflow-hidden relative">
                  <Image src={nft.imageUrl} alt={nft.name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="text-white font-medium">{nft.name}</h4>
                  <p className="text-zinc-400 text-sm">Token ID: {nft.tokenId}</p>
                </div>
              </div>
              <p className="text-red-400 text-sm">
                Burning this NFT will permanently remove it from your wallet and the blockchain.
              </p>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsBurnDialogOpen(false)}
              className="flex items-center justify-center px-4 py-2 border border-zinc-600 text-zinc-200 rounded-md hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBurn}
              disabled={isBurning}
              className={`flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ${
                isBurning ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isBurning ? 'Burning...' : 'Burn NFT'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
