"use client";

import { useCollections } from "@/lib/hooks/use-trpc";

export function CollectionList() {
  const { data: collections, isLoading, error } = useCollections();

  if (isLoading) {
    return <div className="p-4">Loading collections...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading collections: {error.message}
      </div>
    );
  }

  if (!collections || collections.length === 0) {
    return <div className="p-4">No collections found.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {collections.map((collection) => (
        <div
          key={collection.id}
          className="bg-white border border-gray-300 p-4 rounded shadow"
        >
          {collection.imageUrl && (
            <div className="w-full h-40 mb-4 bg-gray-200 rounded overflow-hidden">
              <img
                src={collection.imageUrl}
                alt={collection.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <h3 className="text-lg font-bold mb-2">{collection.name}</h3>
          {collection.description && (
            <p className="text-gray-600 mb-2">{collection.description}</p>
          )}
          <p className="text-sm text-gray-500">
            Contract: {collection.contractAddress.slice(0, 6)}...
            {collection.contractAddress.slice(-4)}
          </p>
        </div>
      ))}
    </div>
  );
}
