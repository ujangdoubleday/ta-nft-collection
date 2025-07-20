'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  name: string;
  symbol: string;
  description: string;
  maxSupply: string;
  imagePreview: string | null;
  fee: string | undefined;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  name,
  symbol,
  description,
  maxSupply,
  imagePreview,
  fee,
}: ConfirmationDialogProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Confirm Collection Creation"
        className="bg-[#0A0A0A] border border-[#1f1f1f] text-white max-w-[90vw] sm:max-w-lg"
      >
        <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Collection Image */}
            <div className="w-full sm:w-1/3">
              <div className="relative aspect-square bg-black/20 rounded-lg overflow-hidden border border-zinc-800">
                {imagePreview ? (
                  <img src={imagePreview} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-zinc-500 text-xs sm:text-sm">No image</span>
                  </div>
                )}
              </div>
            </div>

            {/* Collection Details */}
            <div className="w-full sm:w-2/3 space-y-1.5 sm:space-y-2">
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-zinc-400">Collection Name</h3>
                <p className="text-sm sm:text-base text-white">{name}</p>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-medium text-zinc-400">Symbol</h3>
                <p className="text-sm sm:text-base text-white">{symbol}</p>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-medium text-zinc-400">Maximum Supply</h3>
                <p className="text-sm sm:text-base text-white">{maxSupply}</p>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-medium text-zinc-400">Description</h3>
                <p className="text-xs sm:text-sm text-white line-clamp-2">{description}</p>
              </div>
            </div>
          </div>

          {/* Fee information */}
          <div className="p-2.5 sm:p-3 rounded-md border border-zinc-700 mt-3 sm:mt-4">
            <p className="text-xs sm:text-sm text-zinc-300">
              You will be charged <span className="text-white font-medium">{fee || '0'} ETH</span>{' '}
              to create this collection.
            </p>
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-zinc-800">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 rounded border-zinc-600 bg-zinc-900 text-white focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-xs sm:text-sm text-zinc-300">
                I agree to the{' '}
                <a href="#" className="text-blue-400 hover:underline">
                  Terms of Service
                </a>{' '}
                and confirm that the information provided is correct. This action cannot be undone.
              </span>
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            className="hover:bg-zinc-800 text-xs sm:text-sm py-1.5 sm:py-2 h-auto"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleConfirm()}
            disabled={!agreedToTerms}
            className="bg-white text-black hover:bg-zinc-300 hover:text-black text-xs sm:text-sm py-1.5 sm:py-2 h-auto"
          >
            Confirm Creation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
