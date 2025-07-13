'use client';

import { Plus, X } from 'lucide-react';

interface NFTAttribute {
  trait_type: string;
  value: string;
}

interface AttributesManagerProps {
  attributes: NFTAttribute[];
  setAttributes: (attributes: NFTAttribute[]) => void;
  disabled?: boolean;
}

export const AttributesManager = ({
  attributes,
  setAttributes,
  disabled = false,
}: AttributesManagerProps) => {
  const addAttribute = () => {
    if (disabled) return;
    setAttributes([...attributes, { trait_type: '', value: '' }]);
  };

  const removeAttribute = (index: number) => {
    if (disabled) return;
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: 'trait_type' | 'value', value: string) => {
    if (disabled) return;
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-white text-sm font-medium">Attributes</label>
        <button
          type="button"
          onClick={() => addAttribute()}
          disabled={disabled}
          className={`flex items-center gap-1 text-white text-xs bg-[#1f1f1f] hover:bg-[#2a2a2a] py-1 px-2 rounded-md ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Plus className="h-3 w-3" />
          Add Attribute
        </button>
      </div>

      <div className="space-y-3">
        {attributes.map((attr, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={attr.trait_type}
              onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
              placeholder="Trait name"
              disabled={disabled}
              className={`flex-1 bg-[#0A0A0A] border border-[#1f1f1f] rounded-md py-2 px-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white text-sm ${
                disabled ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            />
            <input
              type="text"
              value={attr.value}
              onChange={(e) => updateAttribute(index, 'value', e.target.value)}
              placeholder="Value"
              disabled={disabled}
              className={`flex-1 bg-[#0A0A0A] border border-[#1f1f1f] rounded-md py-2 px-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white text-sm ${
                disabled ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            />
            {attributes.length > 1 && !disabled && (
              <button
                type="button"
                onClick={() => removeAttribute(index)}
                className="p-2 bg-[#0A0A0A] border border-[#1f1f1f] rounded-md hover:bg-[#2a2a2a]"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
