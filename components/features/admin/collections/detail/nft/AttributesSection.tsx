'use client';

import { FileText } from 'lucide-react';

interface AttributesSectionProps {
  attributes: { trait_type: string; value: string }[];
}

export function AttributesSection({ attributes }: AttributesSectionProps) {
  if (!attributes || attributes.length === 0) return null;

  return (
    <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-4 w-4 text-white" />
        <h3 className="text-white font-medium">Attributes</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {attributes.map((attr, index) => (
          <div key={index} className="bg-[#1f1f1f] rounded-md p-2 text-center">
            <p className="text-zinc-400 text-xs">{attr.trait_type}</p>
            <p className="text-white text-sm font-medium">{attr.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
