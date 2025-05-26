'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useRef, useState } from 'react';

export type CollectionFormData = {
  name: string;
  symbol: string;
  description: string;
  coverImage: File | null;
  storage: string;
  ownerAddress: string;
};

interface CollectionFormFieldsProps {
  formData: CollectionFormData;
  handleChange: (e: { target: { name: any; value: any } }) => void;
  handleFileChange?: (file: File | null) => void;
}

export function CollectionFormFields({
  formData,
  handleChange,
  handleFileChange,
}: CollectionFormFieldsProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      // Create preview URL for the selected image
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Handle file change in parent component
      if (handleFileChange) {
        handleFileChange(file);
      }
    } else {
      setPreviewUrl(null);
      if (handleFileChange) {
        handleFileChange(null);
      }
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Form Fields */}
        <div className="space-y-4">
          <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
            <label className="text-black text-xs font-bold block mb-1">
              Collection Name <span className="text-red-600">*</span>
            </label>
            <Input
              placeholder="Enter collection name"
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="hover:border-[#0000ff] focus:border-[#0000ff]"
            />
            <p className="text-xs text-[#808080] mt-1">
              Choose a memorable name for your digital art collection
            </p>
          </div>

          <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
            <label className="text-black text-xs font-bold block mb-1">
              Symbol <span className="text-red-600">*</span>
            </label>
            <Input
              placeholder="Enter collection symbol (e.g. PIXEL)"
              required
              maxLength={5}
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              className="hover:border-[#0000ff] focus:border-[#0000ff]"
            />
            <p className="text-xs text-[#808080] mt-1">
              A short identifier for your collection (max 5 characters)
            </p>
          </div>

          <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
            <label className="text-black text-xs font-bold block mb-1">
              Owner Address <span className="text-red-600">*</span>
            </label>
            <Input
              placeholder="Enter wallet address (0x...)"
              required
              name="ownerAddress"
              value={formData.ownerAddress}
              onChange={handleChange}
              className="hover:border-[#0000ff] focus:border-[#0000ff]"
            />
            <p className="text-xs text-[#808080] mt-1">
              Ethereum address that will own this collection
            </p>
          </div>

          <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
            <label className="text-black text-xs font-bold block mb-1">Description</label>
            <textarea
              className="w-full bg-white border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2 text-sm h-32 hover:border-[#0000ff] focus:border-[#0000ff] focus:outline-none"
              placeholder="Tell the story behind your collection"
              name="description"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>

        {/* Right Column - Cover Image (will be used for contractURI) */}
        <div>
          <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3 h-full flex flex-col">
            <label className="text-black text-xs font-bold block mb-1">
              Collection Metadata Image
            </label>
            <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white p-2 flex flex-col items-center justify-center h-full min-h-[250px]">
              {previewUrl ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <div className="relative w-full h-full min-h-[180px] overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Collection metadata image preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button
                      size="sm"
                      className="text-xs hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
                      onClick={openFileSelector}
                    >
                      Change Image
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
                      onClick={() => {
                        setPreviewUrl(null);
                        if (handleFileChange) handleFileChange(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center flex flex-col items-center justify-center h-full">
                  <div
                    className="w-16 h-16 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] flex items-center justify-center mb-2 hover:bg-[#d0d0d0] cursor-pointer"
                    onClick={openFileSelector}
                  >
                    <span className="text-black text-2xl">+</span>
                  </div>
                  <p className="text-xs text-black">Upload an image for your collection metadata</p>
                </div>
              )}
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>
            <p className="text-xs text-[#808080] mt-2">
              This image will be included in the collection&apos;s contract metadata
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
