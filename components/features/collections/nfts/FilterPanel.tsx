'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface NFTFilters {
  search: string;
}

interface FilterPanelProps {
  isOpen: boolean;
  onFilterChange: (filters: NFTFilters) => void;
  initialFilters?: NFTFilters;
}

export function FilterPanel({ isOpen, onFilterChange, initialFilters }: FilterPanelProps) {
  // Get initial search value from props
  const [searchQuery, setSearchQuery] = useState(initialFilters?.search || '');

  // Handle filter changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);

    // Notify parent component about the filter change
    onFilterChange({
      search: newValue,
    });
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
      </div>
    </div>
  );
}
