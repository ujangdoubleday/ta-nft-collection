'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface NotOwnerMessageProps {
  collectionAddress: string;
  isAdmin?: boolean;
}

export const NotOwnerMessage: React.FC<NotOwnerMessageProps> = ({
  collectionAddress,
  isAdmin = false,
}) => {
  const backUrl = isAdmin
    ? `/admin/collections/${collectionAddress}`
    : `/user/collections/${collectionAddress}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] px-3 sm:px-4 py-6 sm:py-8">
      <div className="bg-black text-white rounded-lg sm:rounded-xl p-4 sm:p-6 w-full max-w-[280px] sm:max-w-sm text-center shadow-lg border border-white/10">
        <ShieldAlert className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 sm:mb-4 text-white" />
        <h2 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">Access Denied</h2>
        <p className="text-xs sm:text-sm mb-3 sm:mb-4">You are not the owner of this collection.</p>
        <Button
          asChild
          variant="ghost"
          className="border-white text-white hover:bg-white/10 text-xs sm:text-sm h-8 sm:h-9"
        >
          <Link href={backUrl}>Back</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotOwnerMessage;
