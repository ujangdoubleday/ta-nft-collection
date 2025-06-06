'use client';

import { Button } from '@/components/ui/atoms/button';

interface EmptyCollectionContentProps {
  onAddNew: () => void;
}

export function EmptyCollectionContent({ onAddNew }: EmptyCollectionContentProps) {
  return (
    <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-6 bg-white text-center">
      <p className="text-black text-sm mb-3">
        This collection is empty. Start creating your digital artwork!
      </p>
      <Button
        className="hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
        onClick={onAddNew}
      >
        Create Your First Artwork
      </Button>
    </div>
  );
}
