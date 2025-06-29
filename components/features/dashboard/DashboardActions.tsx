'use client';

import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/atoms/button';

export const DashboardActions = () => {
  const router = useRouter();

  return (
    <Win98Window title="Quick Actions" icon="/assets/icons/window/info.png" className="h-full">
      <div className="p-4">
        <h2 className="text-lg font-bold mb-2">Actions</h2>
        <div className="space-y-2">
          <Button onClick={() => router.push('/dashboard/collections')} className="w-full">
            Manage Collections
          </Button>
          <Button onClick={() => router.push('/dashboard/users')} className="w-full">
            Manage Users
          </Button>
          <Button onClick={() => router.push('/dashboard/settings')} className="w-full">
            System Settings
          </Button>
        </div>
      </div>
    </Win98Window>
  );
};
