'use client';

import React from 'react';
import { UsersHeader } from './UsersHeader';
import { BlocklistContent } from './BlocklistContent';

export function UsersContent() {
  return (
    <div className="animate-fade-in">
      <UsersHeader />
      <div className="mt-8">
        <BlocklistContent />
      </div>
    </div>
  );
}
