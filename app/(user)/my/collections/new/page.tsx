import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create New Collection | NFT Marketplace',
  description: 'Create a new NFT collection',
};

export default function CreateCollectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create New Collection</h1>
        <p className="text-zinc-400">Deploy a new NFT collection contract to the blockchain.</p>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Coming Soon</h2>
          <p className="text-zinc-400">
            Collection creation form is under development and will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}
