"use client";

import Link from "next/link";
import { Button } from "@/components/ui/atoms/button";

export function EmptyCollectionMessage() {
  return (
    <div className="p-4 text-center">
      <p className="text-black text-sm mb-4">
        Your gallery is empty. Start your creative journey today!
      </p>
      <Link href="/collections/new">
        <Button>Create Your First Collection</Button>
      </Link>
    </div>
  );
}

