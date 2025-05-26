'use client';

import { Button } from '@/components/ui/button';

interface CollectionFormActionsProps {
  onCancel: () => void;
  showConfirmation?: boolean;
  isSubmitting?: boolean;
}

export function CollectionFormActions({
  onCancel,
  showConfirmation = false,
  isSubmitting = false,
}: CollectionFormActionsProps) {
  return (
    <div className="flex justify-end mt-6 space-x-4 bg-[#c0c0c0] p-3 border-t-2 border-[#808080]">
      <Button
        type="button"
        variant="outline"
        className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset] px-6"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        className={`bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset] px-6 ${
          showConfirmation ? 'bg-[#008080] text-white hover:bg-[#006666]' : ''
        }`}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating...' : showConfirmation ? 'Confirm Creation' : 'Create Collection'}
      </Button>
    </div>
  );
}
