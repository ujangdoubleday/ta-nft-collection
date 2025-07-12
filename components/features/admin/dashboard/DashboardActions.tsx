'use client';

import { useRouter } from 'next/navigation';
import { Grid3x3, Settings, Users, DollarSign } from 'lucide-react';

export function DashboardActions() {
  const router = useRouter();

  const actions = [
    {
      title: 'Manage Collections',
      description: 'View and manage all NFT collections',
      icon: <Grid3x3 className="h-5 w-5" />,
      onClick: () => router.push('/admin/collections'),
      primary: true,
    },
    {
      title: 'Manage Users',
      description: 'View and manage platform users',
      icon: <Users className="h-5 w-5" />,
      onClick: () => router.push('/admin/users'),
      primary: false,
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: <Settings className="h-5 w-5" />,
      onClick: () => router.push('/admin/settings'),
      primary: false,
    },
    {
      title: 'Fees',
      description: 'Manage platform fees and withdrawals',
      icon: <DollarSign className="h-5 w-5" />,
      onClick: () => router.push('/admin/fees'),
      primary: false,
    },
  ];

  return (
    <div>
      <h2 className="text-mb font-bold text-white mb-3">Quick Actions</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      onClick={() => onClick()}
      className={`flex flex-col items-start p-4 rounded-lg border transition-all text-left h-full
        ${
          primary
            ? 'bg-[#0A0A0A] text-white border-[#1f1f1f] hover:bg-zinc-900 hover:border-zinc-600'
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
