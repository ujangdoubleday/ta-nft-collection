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
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="bg-black text-white rounded-xl p-6 w-full max-w-sm text-center shadow-lg border border-white/10">
        <ShieldAlert className="h-10 w-10 mx-auto mb-4 text-white" />
        <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
        <p className="text-sm mb-4">You are not the owner of this collection.</p>
        <Button asChild variant="ghost" className="border-white text-white hover:bg-white/10">
          <Link href={backUrl}>Back</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotOwnerMessage;
