'use client';

import React, { useState, useEffect } from 'react';
import { CollectionSettingsHeader } from './CollectionSettingsHeader';
import { CollectionOwnershipManagement } from './CollectionOwnershipManagement';

interface CollectionSettingsContentProps {
  address: string;
  role?: 'admin' | 'user';
}

export function CollectionSettingsContent({
  address,
  role = 'user',
}: CollectionSettingsContentProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="animate-fade-in">
      <CollectionSettingsHeader address={address} role={role} />

      <div className="flex flex-col gap-6 mt-8">
        <CollectionOwnershipManagement address={address} isLoading={isLoading} role={role} />
      </div>
    </div>
  );
}
