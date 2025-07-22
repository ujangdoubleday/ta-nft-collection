'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { NextImage } from '@/components/shared/NextImage';

interface ImageUploaderProps {
  imagePreview: string | null;
  setImagePreview?: (preview: string | null) => void;
  setImageFile?: (file: File | null) => void;
  onImageChange?: (file: File | null) => void;
  disabled?: boolean;
}

export const ImageUploader = ({
  imagePreview,
  setImagePreview,
  setImageFile,
  onImageChange,
  disabled = false,
}: ImageUploaderProps) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const file = e.target.files?.[0];
    if (file) {
      // Use the new onImageChange handler if provided (preferred)
      if (onImageChange) {
        onImageChange(file);
      }
      // Otherwise use the legacy approach
      else if (setImageFile) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview?.(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveImage = () => {
    if (onImageChange) {
      onImageChange(null);
    } else {
      setImagePreview?.(null);
      setImageFile?.(null);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-white mb-2 text-sm font-medium">NFT Image</label>
      <div
        className={`relative aspect-square bg-[#0A0A0A] border border-[#1f1f1f] border-dashed rounded-lg overflow-hidden flex flex-col items-center justify-center ${disabled ? 'opacity-70' : ''}`}
      >
        {imagePreview ? (
          <>
            <NextImage
              src={imagePreview}
              alt="NFT Preview"
              fill
              className="object-contain"
              placeholderType="empty"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-[#0A0A0A] border border-[#1f1f1f] rounded-full"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            )}
          </>
        ) : (
          <label
            className={`${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} flex flex-col items-center justify-center h-full w-full`}
          >
            <Upload className="h-8 w-8 text-white mb-2" />
            <span className="text-white text-sm font-medium">Upload Image</span>
            <span className="text-zinc-400 text-xs mt-1">PNG, JPG, SVG, GIF (Max 20MB)</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={disabled}
            />
          </label>
        )}
      </div>
    </div>
  );
};
