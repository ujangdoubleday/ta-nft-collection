'use client';

interface CreationFeeInfoProps {
  address?: string | null;
  fee?: string | undefined;
}

export function CreationFeeInfo({ address, fee }: CreationFeeInfoProps) {
  return (
    <div className="mb-4 sm:mb-6 bg-[#0A0A0A] border border-[#1f1f1f] p-2.5 sm:p-3 rounded-md">
      <p className="text-xs sm:text-sm text-white mt-0.5">
        <span className="font-medium">Creation Fee:</span>{' '}
        <span className="text-zinc-400">{fee || '0'} ETH</span>
      </p>
    </div>
  );
}
