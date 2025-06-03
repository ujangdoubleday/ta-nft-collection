'use client';

import { Button } from '@/components/ui/atoms/button';
import { Save } from 'lucide-react';

interface NFTFormActionsProps {
  onCancel: () => void;
  isSubmitting?: boolean;
  showConfirmation?: boolean;
}

export function NFTFormActions({
  onCancel,
  isSubmitting = false,
  showConfirmation = false,
}: NFTFormActionsProps) {
  return (
    <div className="flex justify-between mt-6">
      <Button
        type="button"
        variant="outline"
        className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        className="flex items-center hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
        disabled={isSubmitting}
      >
        <Save className="h-4 w-4 mr-1" />
        {!showConfirmation ? 'Create NFT' : isSubmitting ? 'Processing...' : 'Confirm Create'}
      </Button>
    </div>
  );
}
