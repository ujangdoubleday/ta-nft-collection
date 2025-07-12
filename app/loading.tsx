import React from 'react';
import Spinner from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner size="md" color="white" />
    </div>
  );
}
