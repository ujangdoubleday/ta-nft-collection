'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/atoms/button';
import { Win98Window } from '@/components/ui/organisms/Win98Window';

export function EmptyCollectionMessage() {
  return (
    <Win98Window
      title="Collection: Empty"
      icon="/assets/icons/window/gallery.png"
      className="max-w-12xl mx-auto"
    >
      <div className="p-4 text-center">
        <p className="text-black text-sm mb-4">
          You don&apos;t have any collections yet. Create your first NFT collection!
        </p>
        <Link href="/collections/new">
          <Button>Create Your First Collection</Button>
        </Link>
      </div>
    </Win98Window>
  );
}
