"use client";

import { CollectionDetail } from "@/components/features/collections";

// Define types for collection items
type CollectionItem = {
  id: string;
  name: string;
  type: string;
  image: string;
  attributes: {
    rarity?: string;
    pixels?: string;
    dimensions?: string;
    complexity?: string;
    era?: string;
    style?: string;
    category?: string;
    resolution?: string;
  };
};

type Collection = {
  id: string;
  name: string;
  description: string;
  items: CollectionItem[];
};

interface ClientCollectionDetailProps {
  collectionId: string;
  collection: Collection;
}

export const ClientCollectionDetail = ({
  collectionId,
  collection,
}: ClientCollectionDetailProps) => {
  return (
    <>
      <CollectionDetail collectionId={collectionId} collection={collection} />
    </>
  );
};
