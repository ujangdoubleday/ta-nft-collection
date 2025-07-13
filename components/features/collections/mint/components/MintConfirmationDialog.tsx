'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface MintConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  nftName: string;
  nftDescription: string;
  imagePreview: string | null;
  attributes: { trait_type: string; value: string }[];
}

export function MintConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  nftName,
  nftDescription,
  imagePreview,
  attributes,
}: MintConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  // Filter out empty attributes
  const validAttributes = attributes.filter((attr) => attr.trait_type && attr.value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Confirm NFT Minting"
        className="bg-[#0A0A0A] border border-[#1f1f1f] text-white"
      >
        <div className="mt-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* NFT Image */}
            <div className="w-full md:w-1/3">
              <div className="relative aspect-square bg-black/20 rounded-lg overflow-hidden border border-zinc-800">
                {imagePreview ? (
                  <img src={imagePreview} alt={nftName} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-zinc-500">No image</span>
                  </div>
                )}
              </div>
            </div>

            {/* NFT Details */}
            <div className="w-full md:w-2/3 space-y-2">
              <div>
                <h3 className="text-sm font-medium text-zinc-400">NFT Name</h3>
                <p className="text-white">{nftName}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-zinc-400">Description</h3>
                <p className="text-white text-sm line-clamp-2">{nftDescription}</p>
              </div>

              {validAttributes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-zinc-400">Attributes</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {validAttributes.map((attr, index) => (
                      <div key={index} className="bg-zinc-800 px-2 py-1 rounded-md text-xs">
                        <span className="text-zinc-400">{attr.trait_type}:</span>{' '}
                        <span className="text-white">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Verification note */}
          <div className="p-3 rounded-md border border-zinc-700 mt-4">
            <p className="text-sm text-zinc-300">
              Please verify that the image, name, description, and attributes are correct before
              minting. This action cannot be undone.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            className="hover:bg-zinc-800"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleConfirm()}
            className="bg-white text-black hover:bg-zinc-300 hover:text-black"
          >
            Mint NFT
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
