'use client';

interface CollectionHeaderProps {
  description: string;
}

export function CollectionHeader({ description }: CollectionHeaderProps) {
  return (
    <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-3 bg-white mb-4">
      <p className="text-black text-sm">{description}</p>
    </div>
  );
}
