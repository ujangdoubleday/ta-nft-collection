'use client';

import React from 'react';
import { SettingsHeader } from './SettingsHeader';
import { CreationFeeSettings } from './CreationFeeSettings';

export function SettingsContent() {
  return (
    <div className="animate-fade-in">
      <SettingsHeader />
      <div className="mt-8">
        <CreationFeeSettings />
      </div>
    </div>
  );
}
