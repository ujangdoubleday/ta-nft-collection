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
        className="bg-[#0A0A0A] border border-[#1f1f1f] text-white"
      >
        <div className="mt-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Collection Image */}
            <div className="w-full md:w-1/3">
              <div className="relative aspect-square bg-black/20 rounded-lg overflow-hidden border border-zinc-800">
                {imagePreview ? (
                  <img src={imagePreview} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-zinc-500">No image</span>
                  </div>
                )}
              </div>
            </div>

            {/* Collection Details */}
            <div className="w-full md:w-2/3 space-y-2">
              <div>
                <h3 className="text-sm font-medium text-zinc-400">Collection Name</h3>
                <p className="text-white">{name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-zinc-400">Symbol</h3>
                <p className="text-white">{symbol}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-zinc-400">Maximum Supply</h3>
                <p className="text-white">{maxSupply}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-zinc-400">Description</h3>
                <p className="text-white text-sm line-clamp-2">{description}</p>
              </div>
            </div>
          </div>

          {/* Fee information */}
          <div className=" p-3 rounded-md border border-zinc-700 mt-4">
            <p className="text-sm text-zinc-300">
              You will be charged <span className="text-white font-medium">{fee || '0'} ETH</span>{' '}
              to create this collection.
            </p>
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 rounded border-zinc-600 bg-zinc-900 text-white focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-sm text-zinc-300">
                I agree to the{' '}
                <a href="#" className="text-blue-400 hover:underline">
                  Terms of Service
                </a>{' '}
                and confirm that the information provided is correct. This action cannot be undone.
              </span>
            </label>
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
            disabled={!agreedToTerms}
            className="bg-white text-black hover:bg-zinc-300 hover:text-black"
          >
            Confirm Creation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
