'use client';

import React from 'react';

export function FeesHeader() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold text-white">Fee Management</h1>
      <p className="text-zinc-400">
        Configure creation fees for NFT collections and manage fee-related settings.
      </p>
    </div>
  );
}
