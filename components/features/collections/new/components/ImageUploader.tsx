'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { NextImage } from '@/components/shared/NextImage';

interface ImageUploaderProps {
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
}

export function ImageUploader({ imagePreview, onImageChange }: ImageUploaderProps) {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null);
  };

  return (
    <div className="mb-4">
      <label className="block text-white mb-2 text-sm font-medium">Collection Image</label>
      <div className="relative aspect-square bg-[#0A0A0A] border border-[#1f1f1f] border-dashed rounded-lg overflow-hidden flex flex-col items-center justify-center">
        {imagePreview ? (
          <>
            <NextImage
              src={imagePreview}
              alt="Collection Preview"
              fill
              className="object-contain"
              placeholderType="empty"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
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
      <p className="text-zinc-500 text-xs mt-1">
        This image will be used as the collection thumbnail and logo
      </p>
    </div>
  );
}
