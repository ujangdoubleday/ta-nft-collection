'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, Pause } from 'lucide-react';

export function EmergencyActions() {
  const router = useRouter();

  const actions = [
    {
      title: 'Emergency Pause',
      description: 'Pause all contract operations',
      icon: <Pause className="h-5 w-5" />,
      onClick: () => router.push('/admin/emergency'),
      primary: false,
      warning: true,
    },
    {
      title: 'Emergency Controls',
      description: 'Access emergency system controls',
      icon: <AlertTriangle className="h-5 w-5" />,
      onClick: () => router.push('/admin/emergency'),
      primary: false,
      warning: true,
    },
  ];

  return (
    <div>
      <h2 className="text-mb font-bold text-white mb-3">Emergency Actions</h2>

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
  warning?: boolean;
}

function ActionCard({
  title,
  description,
  icon,
  onClick,
  primary = false,
  warning = false,
}: ActionCardProps) {
  return (
    <button
      onClick={() => onClick()}
      className={`flex flex-col items-start p-4 rounded-lg border transition-all text-left h-full
        ${
          warning
            ? 'bg-[#0A0A0A] text-red-400 border-red-900/30 hover:bg-red-950/20 hover:border-red-900/50'
            : primary
              ? 'bg-[#0A0A0A] text-white border-[#1f1f1f] hover:bg-zinc-900 hover:border-zinc-600'
              : 'bg-[#0A0A0A] text-white border-[#1f1f1f] hover:border-gray-700 hover:bg-zinc-900'
        }`}
    >
      <div className={`p-2 rounded-full mb-3 ${warning ? 'bg-red-900/30' : 'bg-[#1f1f1f]'}`}>
        {icon}
      </div>
      <h3 className="font-medium text-base mb-1 text-white">{title}</h3>
      <p
        className={`text-sm ${warning ? 'text-red-300' : primary ? 'text-gray-300' : 'text-gray-400'}`}
      >
        {description}
      </p>
    </button>
  );
}
