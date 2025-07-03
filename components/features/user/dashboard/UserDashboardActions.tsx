'use client';

import { useRouter } from 'next/navigation';
import { PlusCircle, Grid3x3, Settings, User } from 'lucide-react';

export function UserDashboardActions() {
  const router = useRouter();

  const actions = [
    {
      title: 'Create Collection',
      description: 'Create a new NFT collection',
      icon: <PlusCircle className="h-5 w-5" />,
      onClick: () => router.push('/my/collections/new'),
      primary: true,
    },
    {
      title: 'View Collections',
      description: 'Browse your existing collections',
      icon: <Grid3x3 className="h-5 w-5" />,
      onClick: () => router.push('/my/collections'),
      primary: false,
    },
    {
      title: 'Edit Profile',
      description: 'Update your profile settings',
      icon: <User className="h-5 w-5" />,
      onClick: () => router.push('/my/profile'),
      primary: false,
    },
    {
      title: 'Settings',
      description: 'Configure your account preferences',
      icon: <Settings className="h-5 w-5" />,
      onClick: () => router.push('/my/settings'),
      primary: false,
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <ActionCard key={index} {...action} />
        ))}
      </div>
    </div>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}

function ActionCard({ title, description, icon, onClick, primary = false }: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start p-4 rounded-lg border transition-all text-left h-full
        ${
          primary
            ? 'bg-[#0A0A0A] text-white border-[#1f1f1f] hover:bg-zinc-900'
            : 'bg-[#0A0A0A] text-white border-[#1f1f1f] hover:border-gray-700 hover:bg-zinc-900'
        }`}
    >
      <div className={`p-2 rounded-full mb-3 ${primary ? 'bg-[#1f1f1f]' : 'bg-[#1f1f1f]'}`}>
        {icon}
      </div>
      <h3 className="font-medium text-base mb-1 text-white">{title}</h3>
      <p className={`text-sm ${primary ? 'text-gray-300' : 'text-gray-400'}`}>{description}</p>
    </button>
  );
}
