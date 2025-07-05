'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  setImageFile: (file: File | null) => void;
}

export const ImageUploader = ({
  imagePreview,
  setImagePreview,
  setImageFile,
}: ImageUploaderProps) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-white mb-2 text-sm font-medium">NFT Image</label>
      <div className="relative aspect-square bg-[#0A0A0A] border border-[#1f1f1f] border-dashed rounded-lg overflow-hidden flex flex-col items-center justify-center">
        {imagePreview ? (
          <>
            <Image src={imagePreview} alt="NFT Preview" fill className="object-contain" />
            <button
              type="button"
              onClick={() => {
                setImagePreview(null);
                setImageFile(null);
              }}
              className="absolute top-2 right-2 p-1 bg-[#0A0A0A] border border-[#1f1f1f] rounded-full"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </>
        ) : (
          <label className="cursor-pointer flex flex-col items-center justify-center h-full w-full">
            <Upload className="h-8 w-8 text-white mb-2" />
            <span className="text-white text-sm font-medium">Upload Image</span>
            <span className="text-zinc-400 text-xs mt-1">PNG, JPG, SVG, GIF (Max 10MB)</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        )}
      </div>
    </div>
  );
};
