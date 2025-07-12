'use client';

import { FilterIcon, Plus, RefreshCw } from 'lucide-react';
import { trpc } from '@/lib/api/trpc/client';
import { useAddress } from '@/lib/hooks/use-address';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface CollectionsHeaderProps {
  role?: 'admin' | 'user';
  onFilterToggle?: (isOpen: boolean) => void;
}

export function CollectionsHeader({ role = 'user', onFilterToggle }: CollectionsHeaderProps) {
  const router = useRouter();
  const utils = trpc.useContext();
  const { data: address } = useAddress();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Determine the base path based on role
  const basePath = role === 'admin' ? '/admin/collections' : '/user/collections';

  // Set the title based on role - admin sees all collections, user sees their own
  const title = role === 'admin' ? 'All Collections' : 'My Collections';

  const handleRefresh = async () => {
    if (!address || isRefreshing) return;

    setIsRefreshing(true);
    // toast.info('Refreshing collections...');

    try {
      // Invalidate and refetch collections data
      await Promise.all([
        utils.collection.getEnrichedCreatorCollections.invalidate({ creatorAddress: address }),
        utils.collection.getCreatorCollections.invalidate({ creatorAddress: address }),
        // Fix: Use the correct method name
        utils.factoryConfig.getAllCollections.invalidate(),
        utils.collection.getMultipleCollectionOwners.invalidate(),
        // Call revalidate API with path parameter and page type
        fetch(`/api/revalidate?path=${basePath}&type=page`),
      ]);

      // Use router.refresh() to refresh the current page
      router.refresh();
      toast.success('Collections refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing collections:', error);
      toast.error('Failed to refresh collections. Please try again.');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000); // Add slight delay to show the refresh animation
    }
  };

  const handleCreateClick = () => {
    router.push(`${basePath}/new`);
  };

  const handleFilterClick = () => {
    const newState = !isFilterOpen;
    setIsFilterOpen(newState);
    if (onFilterToggle) {
      onFilterToggle(newState);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <button
              onClick={() => handleCreateClick()}
              className="bg-white text-black hover:bg-zinc-200 py-2 px-3 rounded-md transition-colors text-sm font-medium flex items-center gap-2"
              aria-label="Create new collection"
            >
              <Plus className="h-4 w-4" />
              Create Collection
            </button>
          )}

          <Button
            onClick={() => handleFilterClick()}
            variant="outline"
            className={`flex items-center gap-2 text-sm ${
              isFilterOpen ? 'opacity-70' : ''
            } bg-white text-black hover:bg-zinc-200 hover:text-black`}
          >
            <Filter className="h-4 w-4" />
            {isFilterOpen ? 'Hide Filters' : 'Filter'}
          </Button>

          <button
            onClick={() => handleRefresh()}
            disabled={isRefreshing}
            className={`bg-white text-black hover:bg-zinc-200 py-2 px-3 rounded-md transition-colors text-sm font-medium flex items-center gap-2 ${
              isRefreshing ? 'opacity-70' : ''
            }`}
            aria-label="Refresh collections"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="h-px w-full bg-[#1f1f1f] mt-6"></div>
    </div>
  );
}
