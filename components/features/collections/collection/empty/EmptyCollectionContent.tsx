'use client';

import { Button } from '@/components/ui/atoms/button';
import { Win98Window } from '@/components/ui/organisms/Win98Window';

interface EmptyCollectionContentProps {
  onAddNewAction: () => void;
}

export function EmptyCollectionContent({ onAddNewAction }: EmptyCollectionContentProps) {
  return (
    <Win98Window
      title="Collections"
      icon="/assets/icons/window/gallery.png"
      className="max-w-12xl mx-auto"
    >
      <div className="p-4 text-center">
        <p className="text-black text-sm mb-4">
          Your gallery is empty. Start your creative journey today!
        </p>
        <Button
          className="hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
          onClick={onAddNewAction}
        >
          Create Your First Artwork
        </Button>
      </div>
    </Win98Window>
  );
}
