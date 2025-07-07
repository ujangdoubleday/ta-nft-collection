'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface ErrorStateProps {
  contractAddress: string;
  error?: Error | null;
}

export const ErrorState = ({ contractAddress, error }: ErrorStateProps) => {
  return (
    <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
      <Link
        href="/my/collections"
        className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-sm mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Collections
      </Link>
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-2">Collection Not Found</h2>
        <p className="text-zinc-400">
          {error?.message || `The collection with address ${contractAddress} could not be found.`}
        </p>
      </div>
    </div>
  );
};
