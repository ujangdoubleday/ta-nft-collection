'use client';

import React from 'react';

export function FeesHeader() {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Fee Management</h1>
          <p className="text-zinc-400">
            Configure creation fees for NFT collections and manage fee-related settings.
          </p>
        </div>
      </div>

      <div className="h-px w-full bg-[#1f1f1f] mt-6"></div>
    </div>
  );
}
