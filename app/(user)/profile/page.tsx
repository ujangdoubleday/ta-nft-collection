import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile | NFT Marketplace',
  description: 'View and manage your profile settings',
};

export default function UserProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-zinc-400">Manage your profile settings and wallet information.</p>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Coming Soon</h2>
          <p className="text-zinc-400">
            Profile management features are under development and will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}
