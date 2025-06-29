import { Win98Window } from '@/components/ui/organisms/Win98Window';

export const DashboardStats = () => {
  return (
    <Win98Window title="Statistics" icon="/assets/icons/window/info.png" className="h-full">
      <div className="p-4">
        <h2 className="text-lg font-bold mb-2">Platform Statistics</h2>
        <ul className="space-y-2">
          <li>Total Collections: Loading...</li>
          <li>Total NFTs: Loading...</li>
          <li>Active Users: Loading...</li>
        </ul>
      </div>
    </Win98Window>
  );
};
