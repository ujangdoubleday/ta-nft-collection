'use client';

import { useRouter } from 'next/navigation';
import { PlusCircle, Grid3x3, Image } from 'lucide-react';

export function DashboardActions() {
  const router = useRouter();

  const actions = [
    {
      title: 'Create Collection',
      description: 'Create a new NFT collection',
      icon: <PlusCircle className="h-5 w-5" />,
      onClick: () => router.push('/user/collections/new'),
      primary: true,
    },
    {
      title: 'View Collections',
      description: 'Browse your existing collections',
      icon: <Grid3x3 className="h-5 w-5" />,
      onClick: () => router.push('/user/collections'),
      primary: false,
    },
    {
      title: 'View NFTs',
      description: 'Browse all your owned NFTs',
      icon: <Image className="h-5 w-5" />,
      onClick: () => router.push('/user/nfts'),
      primary: false,
    },
  ];

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Quick Actions</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
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
      className={`flex flex-col items-start p-3 sm:p-4 rounded-lg border transition-all text-left h-full
        ${
          primary
            ? 'bg-[#0A0A0A] text-white border-[#1f1f1f] hover:bg-zinc-900 hover:border-zinc-600'
            : 'bg-[#0A0A0A] text-white border-[#1f1f1f] hover:border-gray-700 hover:bg-zinc-900'
        }`}
    >
      <div
        className={`p-1.5 sm:p-2 rounded-full mb-2 sm:mb-3 ${primary ? 'bg-[#1f1f1f]' : 'bg-[#1f1f1f]'}`}
      >
        {icon}
      </div>
      <h3 className="font-medium text-sm sm:text-base mb-0.5 sm:mb-1 text-white">{title}</h3>
      <p className={`text-xs sm:text-sm ${primary ? 'text-gray-300' : 'text-gray-400'}`}>
        {description}
      </p>
    </button>
  );
}
