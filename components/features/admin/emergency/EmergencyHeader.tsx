'use client';

import React from 'react';

export function EmergencyHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Emergency Actions</h1>
        <p className="text-zinc-400 mt-1">Emergency actions for the platform</p>
      </div>
    </div>
  );
}
