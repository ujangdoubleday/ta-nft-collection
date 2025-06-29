import { Win98Window } from '@/components/ui/organisms/Win98Window';

export const DashboardActivity = () => {
  return (
    <Win98Window title="Recent Activity" icon="/assets/icons/window/info.png" className="mt-4">
      <div className="p-4">
        <h2 className="text-lg font-bold mb-2">Latest Activities</h2>
        <div className="border border-[#424242] p-2 bg-white min-h-[100px]">
          <p className="text-gray-500">No recent activities to display.</p>
        </div>
      </div>
    </Win98Window>
  );
};
