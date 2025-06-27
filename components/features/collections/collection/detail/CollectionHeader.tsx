'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface CollectionHeaderProps {
  description: string;
  contractAddress: string;
}

export function CollectionHeader({ description, contractAddress }: CollectionHeaderProps) {
  const router = useRouter();

  // Manual refresh function
  const refreshCollection = useCallback(async () => {
    try {
      // Call the revalidation API
      const revalidateResponse = await fetch('/api/revalidate?tag=nft');
      if (!revalidateResponse.ok) {
        console.error('Failed to revalidate collection detail page');
      }
    } catch (error) {
      console.error('Error revalidating collection detail page:', error);
    }

    // Force client-side refresh
    router.refresh();
  }, [router]);

  return (
    <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-3 bg-white mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">Collection Details</h2>
        <button
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 border border-gray-400 text-sm"
          onClick={refreshCollection}
        >
          Refresh
        </button>
      </div>
      <p className="text-black text-sm">{description}</p>
    </div>
  );
}
