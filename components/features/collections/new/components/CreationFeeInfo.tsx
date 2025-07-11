'use client';

interface CreationFeeInfoProps {
  address?: string | null;
  fee?: string | undefined;
}

export function CreationFeeInfo({ address, fee }: CreationFeeInfoProps) {
  return (
    <div className="mb-6 bg-[#0A0A0A] border border-[#1f1f1f] p-3 rounded-md">
      <p className="text-sm text-white">
        <span className="font-medium">Collection Owner:</span>{' '}
        <span className="text-zinc-400">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
        </span>
      </p>
      <p className="text-sm text-white mt-1">
        <span className="font-medium">Creation Fee:</span>{' '}
        <span className="text-zinc-400">{fee || '0'} ETH</span>
      </p>
    </div>
  );
}
