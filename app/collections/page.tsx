"use client";

import { CollectionList } from "@/components/nft/collection-list";

export default function CollectionsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">NFT Collections</h1>
      <CollectionList />
    </div>
  );
}
