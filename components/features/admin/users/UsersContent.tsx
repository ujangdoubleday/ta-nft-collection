'use client';

import React, { useState, useEffect } from 'react';
import { UsersHeader } from './UsersHeader';
import { BlocklistContent } from './BlocklistContent';

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

      <div className="mt-8 border-t border-zinc-800 pt-8">
        <BlocklistContent isLoading={isLoading} />
      </div>
    </div>
  );
}
