'use client';

import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { CreationFeeSettings } from './CreationFeeSettings';
import { Button } from '@/components/ui/atoms/button';

export const SystemSettingsContent = () => {
  return (
    <Win98Window title="System Settings" icon="/assets/icons/window/form.png" className="mb-4">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">System Configuration</h1>

        {/* Creation Fee Settings */}
        <div className="mb-6">
          <CreationFeeSettings />
        </div>
      </div>
    </Win98Window>
  );
};
