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
    : `/my/collections/${collectionAddress}`;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <ShieldAlert className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-red-700 dark:text-red-400">Access Denied</h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          You don&apos;t have permission to access this page. Only the collection owner can perform
          this action.
        </p>
        <div className="flex justify-center">
          <Button asChild variant="outline">
            <Link href={backUrl}>Back to Collection</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotOwnerMessage;
