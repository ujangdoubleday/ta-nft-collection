'use client';

import { useState } from 'react';
import { CollectionsList } from '@/components/features/collections/CollectionsList';
import { CollectionsHeader } from '@/components/features/collections/CollectionsHeader';
import { FilterPanel, CollectionFilters } from '@/components/features/collections/FilterPanel';
import { Suspense } from 'react';

export function AdminCollectionsContent() {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  // No need to maintain state for filters as we use URL params

  const handleFilterToggle = (isOpen: boolean) => {
    setIsFilterPanelOpen(isOpen);
  };

  // For backward compatibility
  const handleFilterChange = (newFilters: CollectionFilters) => {
    console.log('Admin filter changed via callback:', newFilters);
    // We don't update state as we use URL params
  };

  // Default empty filters object for backward compatibility
  const emptyFilters: CollectionFilters = {
    search: '',
    ownerFilter: 'all',
  };

  return (
    <div className="space-y-6">
      <CollectionsHeader role="admin" onFilterToggle={handleFilterToggle} />
      <Suspense>
        <FilterPanel
          isOpen={isFilterPanelOpen}
          role="admin"
          onFilterChange={handleFilterChange}
          initialFilters={emptyFilters}
        />
        <CollectionsList role="admin" />
      </Suspense>
    </div>
  );
}
