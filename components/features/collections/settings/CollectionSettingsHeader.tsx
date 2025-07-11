'use client';

interface CollectionSettingsHeaderProps {
  address: string;
  role?: 'admin' | 'user';
}

export function CollectionSettingsHeader({
  address,
  role = 'user',
}: CollectionSettingsHeaderProps) {
  // Determine the base path based on role
  const basePath = role === 'admin' ? '/admin/collections' : '/user/collections';

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-white mb-2">Collection Settings</h1>
      <p className="text-zinc-400">Manage ownership settings of your collection</p>
      <div className="h-px w-full bg-[#1f1f1f] mt-6"></div>
    </div>
  );
}
