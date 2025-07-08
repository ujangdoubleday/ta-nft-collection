'use client';

import React, { useState, useEffect } from 'react';
import { SettingsHeader } from './SettingsHeader';
import { OwnershipManagement } from './OwnershipManagement';

export function SettingsContent() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="animate-fade-in">
      <SettingsHeader />

      <div className="flex flex-col gap-6 mt-8">
        <OwnershipManagement isLoading={isLoading} />
      </div>
    </div>
  );
}
