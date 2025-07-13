'use client';

import React from 'react';
import { Users } from 'lucide-react';

export function UsersHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-white rounded-full p-2">
          <Users size={20} className="text-black" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-zinc-400 mt-1">Manage users and blocklisted addresses</p>
        </div>
      </div>
    </div>
  );
}
