'use client';

import React, { useState, useEffect } from 'react';
import { UsersHeader } from './UsersHeader';
import { BlocklistContent } from './BlocklistContent';
import { UsersTable } from './UsersTable';

export function UsersContent() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="animate-fade-in">
      <UsersHeader />

      <div className="flex flex-col gap-8 mt-8">
        <div>
          <UsersTable isLoading={isLoading} />
        </div>

        <div>
          <BlocklistContent isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
