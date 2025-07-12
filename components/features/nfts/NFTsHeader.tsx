'use client';

import { useState } from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/api/trpc/client';
import { useAddress } from '@/lib/hooks/use-address';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface NFTsHeaderProps {
  role?: 'admin' | 'user';
  onFilterToggle: (isOpen: boolean) => void;
  onRefresh?: () => Promise<void>;
  showAll?: boolean;
  isFilterOpen?: boolean;
}

export function NFTsHeader({
  role = 'user',
  onFilterToggle,
  onRefresh,
  showAll = false,
  isFilterOpen = false,
}: NFTsHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const utils = trpc.useContext();
  const { data: address } = useAddress();

  // Determine the base path based on role
  const basePath = role === 'admin' ? '/admin/nfts' : '/user/nfts';

  // Determine the title based on role and showAll flag
  const title = role === 'admin' ? 'All NFTs' : showAll ? 'All NFTs' : 'My NFTs';

  const toggleFilter = () => {
    onFilterToggle(!isFilterOpen);
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      // If parent component provides a refresh function, use it
      if (onRefresh) {
        await onRefresh();
      } else {
        // Otherwise do a default refresh
        if (address) {
          // Invalidate and refetch NFTs data
          await Promise.all([
            utils.factoryConfig.getAllCollections.invalidate(),
            utils.nft.getByOwner.invalidate({
              ownerAddress: address,
              contractAddresses: [],
            }),
            utils.nft.getAllNFTs.invalidate({
              contractAddresses: [],
              limit: 500,
            }),
            // Call revalidate API with path parameter and 'page' type
            fetch(`/api/revalidate?path=${basePath}&type=page`),
          ]);
        }
      }
      // Use router.refresh() to refresh the current page
      router.refresh();
      toast.info('NFTs refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing NFTs:', error);
      toast.error('Failed to refresh NFTs. Please try again.');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000); // Add slight delay to show the refresh animation
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => toggleFilter()}
            variant="outline"
            className={`flex items-center gap-2 text-sm ${
              isFilterOpen ? 'opacity-70' : ''
            } bg-white text-black hover:bg-zinc-200 hover:text-black`}
          >
            <Filter className="h-4 w-4" />
            {isFilterOpen ? 'Hide Filters' : 'Filter'}
          </Button>

          <Button
            onClick={() => handleRefresh()}
            disabled={isRefreshing}
            variant="outline"
            className={`flex items-center gap-2 text-sm ${
              isRefreshing ? 'opacity-70' : ''
            } bg-white text-black hover:bg-zinc-200 hover:text-black`}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      <div className="h-px w-full bg-[#1f1f1f] mt-6"></div>
    </div>
  );
}
