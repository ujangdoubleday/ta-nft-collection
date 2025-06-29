import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { DashboardStats } from './DashboardStats';
import { DashboardActions } from './DashboardActions';
import { DashboardActivity } from './DashboardActivity';

export const DashboardLayout = () => {
  return (
    <Win98Window title="Admin Dashboard" icon="/assets/icons/window/info.png" className="mb-4">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardStats />
          <DashboardActions />
        </div>

        <DashboardActivity />
      </div>
    </Win98Window>
  );
};
