'use client';

import React from 'react';

export function SettingsHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <p className="text-zinc-400 mt-1">Configure platform-wide settings</p>
      </div>
    </div>
  );
}
