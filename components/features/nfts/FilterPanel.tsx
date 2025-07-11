'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export interface NFTFilters {
  search: string;
  collectionFilter?: string;
}

interface FilterPanelProps {
  isOpen: boolean;
  role?: 'admin' | 'user';
  onFilterChange: (filters: NFTFilters) => void;
  initialFilters?: NFTFilters;
  collections?: { address: string; name: string }[];
}

export function NFTFilterPanel({
  isOpen,
  role = 'user',
  onFilterChange,
  initialFilters,
  collections = [],
}: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get values from URL or initial filters
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || initialFilters?.search || '',
  );
  const [collectionFilter, setCollectionFilter] = useState(
    searchParams.get('collection') || initialFilters?.collectionFilter || '',
  );

  // Sync with URL changes when the component is mounted or URL changes
  useEffect(() => {
    const searchFromURL = searchParams.get('search') || '';
    const collectionFromURL = searchParams.get('collection') || '';

    // Only update state if values are different to prevent unnecessary re-renders
    if (searchFromURL !== searchQuery) {
      setSearchQuery(searchFromURL);
    }

    if (collectionFromURL !== collectionFilter) {
      setCollectionFilter(collectionFromURL);
    }
  }, [searchParams]);

  // Update URL with current filters
  const updateURL = (params: { search?: string; collection?: string }) => {
    // Create a new URLSearchParams object based on the current URL search parameters
    const newParams = new URLSearchParams(searchParams.toString());

    // Update or remove search parameter
    if (params.search !== undefined) {
      if (params.search) {
        newParams.set('search', params.search);
      } else {
        newParams.delete('search');
      }
    }

    // Update or remove collection parameter
    if (params.collection !== undefined) {
      if (params.collection) {
        newParams.set('collection', params.collection);
      } else {
        newParams.delete('collection');
      }
    }

    // Create the new URL string
    const newURL = `${pathname}${newParams.toString() ? `?${newParams.toString()}` : ''}`;

    // Update the URL
    router.push(newURL);

    // Also notify via callback for backward compatibility
    if (onFilterChange) {
      onFilterChange({
        search: params.search !== undefined ? params.search : searchQuery,
        collectionFilter: params.collection !== undefined ? params.collection : collectionFilter,
      });
    }
  };

  // Handle filter changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    updateURL({ search: newValue });
  };

  const handleCollectionFilterChange = (value: string) => {
    setCollectionFilter(value);
    updateURL({ collection: value });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="mb-6 bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4 animate-in fade-in duration-300">
      <div className="space-y-4">
        {/* Search filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search NFTs..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 bg-[#0A0A0A] border-[#1f1f1f] text-white"
          />
        </div>

        {/* Collection filter */}
        {collections && collections.length > 0 && (
          <div>
            <h4 className="text-sm text-zinc-400 mb-2">Collection</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCollectionFilterChange('')}
                className={`py-1 px-3 rounded-md text-sm ${
                  collectionFilter === ''
                    ? 'bg-white text-black'
                    : 'bg-[#1f1f1f] text-white hover:bg-zinc-800'
                }`}
              >
                All Collections
              </button>
              {collections.map((collection) => (
                <button
                  key={collection.address}
                  onClick={() => handleCollectionFilterChange(collection.address)}
                  className={`py-1 px-3 rounded-md text-sm truncate max-w-[180px] ${
                    collectionFilter === collection.address
                      ? 'bg-white text-black'
                      : 'bg-[#1f1f1f] text-white hover:bg-zinc-800'
                  }`}
                  title={collection.name}
                >
                  {collection.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
