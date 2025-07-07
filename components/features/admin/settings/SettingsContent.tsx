'use client';

import React, { useState, useEffect } from 'react';
import { SettingsHeader } from './SettingsHeader';
import { CreationFeeSettings } from './CreationFeeSettings';
import { EmergencyActions } from './EmergencyActions';

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

      <div className="flex flex-col lg:flex-row gap-6 mt-8">
        <div className="lg:w-[50%] order-1">
          <CreationFeeSettings isLoading={isLoading} />
        </div>

        <div className="lg:w-[50%] order-2">
          <EmergencyActions isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
