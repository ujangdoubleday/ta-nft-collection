'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const LoadingState = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-8 w-1/2 mb-2" />
      <div className="h-px w-full bg-[#1f1f1f] mb-6"></div>
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <Skeleton className="w-full lg:w-1/3 aspect-square" />
          <div className="w-full lg:w-2/3 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
