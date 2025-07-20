'use client';

import { useState, useEffect } from 'react';
import { Search, UserCheck, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export interface CollectionFilters {
  search: string;
  ownerFilter: 'all' | 'owned' | 'not-owned';
}

interface FilterPanelProps {
  isOpen: boolean;
  role?: 'admin' | 'user';
  onFilterChange: (filters: CollectionFilters) => void;
  initialFilters?: CollectionFilters;
}

export function FilterPanel({
  isOpen,
  role = 'user',
  onFilterChange, // Keeping this for backward compatibility
  initialFilters,
}: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get values from URL or initial filters
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || initialFilters?.search || '',
  );
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'owned' | 'not-owned'>(
    (searchParams.get('filter') as 'all' | 'owned' | 'not-owned') ||
      initialFilters?.ownerFilter ||
      'all',
  );

  // Sync with URL changes when the component is mounted or URL changes
  useEffect(() => {
    const searchFromURL = searchParams.get('search') || '';
    const filterFromURL = (searchParams.get('filter') as 'all' | 'owned' | 'not-owned') || 'all';

    // Only update state if values are different to prevent unnecessary re-renders
    if (searchFromURL !== searchQuery) {
      setSearchQuery(searchFromURL);
    }

    if (filterFromURL !== ownerFilter) {
      setOwnerFilter(filterFromURL);
    }
  }, [searchParams]);

  // Update URL with current filters
  const updateURL = (params: { search?: string; filter?: string }) => {
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

    // Update or remove filter parameter
    if (params.filter !== undefined) {
      if (params.filter !== 'all') {
        newParams.set('filter', params.filter);
      } else {
        newParams.delete('filter'); // Don't include 'all' in URL to keep it cleaner
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
        ownerFilter: (params.filter as any) || ownerFilter,
      });
    }
  };

  // Handle filter changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    updateURL({ search: newValue });
  };

  const handleOwnerFilterChange = (value: 'all' | 'owned' | 'not-owned') => {
    setOwnerFilter(value);
    updateURL({ filter: value });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="mb-4 sm:mb-6 bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-3 sm:p-4 animate-in fade-in duration-300">
      <div className="space-y-3 sm:space-y-4">
        {/* Search filter */}
        <div className="relative">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500" />
          <Input
            placeholder="Search collections..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-8 sm:pl-10 py-1.5 sm:py-2 h-8 sm:h-10 text-xs sm:text-sm bg-[#0A0A0A] border-[#1f1f1f] text-white"
          />
        </div>

        {/* Owner filter */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            onClick={() => handleOwnerFilterChange('all')}
            className={`py-1 px-2 sm:px-3 rounded-md text-xs sm:text-sm flex items-center gap-1 ${
              ownerFilter === 'all'
                ? 'bg-white text-black'
                : 'bg-[#1f1f1f] text-white hover:bg-zinc-800'
            }`}
          >
            <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            All
          </button>
          <button
            onClick={() => handleOwnerFilterChange('owned')}
            className={`py-1 px-2 sm:px-3 rounded-md text-xs sm:text-sm flex items-center gap-1 ${
              ownerFilter === 'owned'
                ? 'bg-white text-black'
                : 'bg-[#1f1f1f] text-white hover:bg-zinc-800'
            }`}
          >
            <UserCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            Owned by me
          </button>
          <button
            onClick={() => handleOwnerFilterChange('not-owned')}
            className={`py-1 px-2 sm:px-3 rounded-md text-xs sm:text-sm flex items-center gap-1 ${
              ownerFilter === 'not-owned'
                ? 'bg-white text-black'
                : 'bg-[#1f1f1f] text-white hover:bg-zinc-800'
            }`}
          >
            <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            Not owned by me
          </button>
        </div>
      </div>
    </div>
  );
}
