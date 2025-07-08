'use client';

import React from 'react';

export function SettingsHeader() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold text-white">Ownership Management</h1>
      <p className="text-zinc-400">
        Manage contract ownership, including transferring and renouncing ownership rights.
      </p>
    </div>
  );
}
