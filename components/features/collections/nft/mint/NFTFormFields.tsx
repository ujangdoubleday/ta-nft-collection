'use client';

import { Button, Input } from '@/components/ui/atoms';
import { ChangeEvent, useRef, useState } from 'react';
import Image from 'next/image';

export type NFTFormData = {
  title: string;
  description: string;
  file: File | null;
  properties: Array<{
    name: string;
    value: string;
  }>;
};

interface NFTFormFieldsProps {
  formData: NFTFormData;
  handleChange: (
    e: ChangeEvent<HTMLInputElement>,
    propertyIndex?: number | null,
    field?: string | null,
  ) => void;
  handleAddProperty: () => void;
}

export function NFTFormFields({ formData, handleChange, handleAddProperty }: NFTFormFieldsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Update form data
      const event = {
        target: {
          name: 'file',
          value: file,
        },
      };
      handleChange(event as any);
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    const event = {
      target: {
        name: 'file',
        value: null,
      },
    };
    handleChange(event as any);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div className="space-y-4 mb-6">
          <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
            <label className="text-black text-xs font-bold block mb-1">
              NFT Title <span className="text-red-600">*</span>
            </label>
            <Input
              placeholder="Enter NFT title"
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="hover:border-[#0000ff] focus:border-[#0000ff]"
            />
          </div>

          <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
            <label className="text-black text-xs font-bold block mb-1">Description</label>
            <textarea
              className="w-full bg-white border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2 text-sm h-24 hover:border-[#0000ff] focus:border-[#0000ff] focus:outline-none"
              placeholder="Tell the story behind your NFT"
              name="description"
              value={formData.description}
              onChange={(e) => handleChange(e as any)}
            ></textarea>
          </div>

          <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
            <label className="text-black text-xs font-bold block mb-1">
              NFT File Upload <span className="text-red-600">*</span>
            </label>

            <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-4 bg-white flex flex-col items-center justify-center">
              <div className="text-center">
                <Button
                  size="sm"
                  className="text-xs hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
                  onClick={openFileSelector}
                  type="button"
                >
                  {formData.file ? 'Change Image' : 'Browse Files...'}
                </Button>
                {formData.file && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs ml-2 hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
                    onClick={removeFile}
                    type="button"
                  >
                    Remove
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {formData.file && (
                <p className="text-xs text-center mt-2">Selected file: {formData.file.name}</p>
              )}
            </div>
            <p className="text-xs text-[#505050] mt-1">
              Supported formats: PNG, JPG, GIF, MP4 (max 30MB). Image is required.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
          <label className="text-black text-xs font-bold block mb-1">Properties</label>

          <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2 bg-white">
            {formData.properties.map((prop, index) => (
              <div className="flex mb-2" key={index}>
                <Input
                  placeholder="Property name"
                  className="mr-2 hover:border-[#0000ff] focus:border-[#0000ff]"
                  value={prop.name}
                  onChange={(e) => handleChange(e, index, 'name')}
                />
                <Input
                  placeholder="Value"
                  className="hover:border-[#0000ff] focus:border-[#0000ff]"
                  value={prop.value}
                  onChange={(e) => handleChange(e, index, 'value')}
                />
              </div>
            ))}
            <Button
              size="sm"
              className="w-full text-xs mt-1 hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
              type="button"
              onClick={handleAddProperty}
            >
              + Add Property
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
