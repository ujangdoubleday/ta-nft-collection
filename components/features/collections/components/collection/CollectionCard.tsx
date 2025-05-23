"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Win98Window } from "@/components/ui/win98";

export type CollectionCardProps = {
  id: string;
  name: string;
  description: string;
  count: number;
  thumbnail: string;
};

export function CollectionCard({
  id,
  name,
  description,
  count,
  thumbnail,
}: CollectionCardProps) {
  return (
    <Win98Window key={id} title={name} className="overflow-hidden">
      <div className="p-3 flex gap-3">
        <div className="win98-shadow-inset h-20 w-20 bg-white flex-shrink-0 flex items-center justify-center">
          <img src={thumbnail} alt={name} className="max-h-16 max-w-16" />
        </div>
        <div className="text-black">
          <p className="text-xs mb-1">{description}</p>
          <p className="text-xs mb-2">
            <strong>Items:</strong> {count}
          </p>
          <div className="flex gap-2">
            <Link href={`/collections/${id}`}>
              <Button size="sm" className="text-xs h-6 py-0 px-2">
                View Gallery
              </Button>
            </Link>
            <Link href={`/collections/${id}/mint`}>
              <Button size="sm" className="text-xs h-6 py-0 px-2">
                Create New
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Win98Window>
  );
}
