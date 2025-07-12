'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NFTsHeaderProps {
  role?: 'admin' | 'user';
  onFilterToggle: (isOpen: boolean) => void;
}

export function NFTsHeader({ role = 'user', onFilterToggle }: NFTsHeaderProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleFilter = () => {
    const newState = !isFilterOpen;
    setIsFilterOpen(newState);
    onFilterToggle(newState);
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {role === 'admin' ? 'All NFTs' : 'My NFTs'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => toggleFilter()}
            variant="outline"
            className={`flex items-center gap-2 text-sm ${
              isFilterOpen ? 'bg-white text-black' : 'bg-[#0A0A0A] text-white border-[#1f1f1f]'
            }`}
          >
            <Filter className="h-4 w-4" />
            {isFilterOpen ? 'Hide Filters' : 'Filter'}
          </Button>
        </div>
      </div>
      <div className="h-px w-full bg-[#1f1f1f] mt-6"></div>
    </div>
  );
}
