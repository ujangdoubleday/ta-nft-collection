'use client';

import { Button, Input } from '@/components/ui/atoms';
import { ChangeEvent } from 'react';

export type NFTFormData = {
  title: string;
  description: string;
  externalUrl: string;
  file: any;
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
            <label className="text-black text-xs font-bold block mb-1">External URL</label>
            <Input
              placeholder="https://"
              name="externalUrl"
              value={formData.externalUrl}
              onChange={handleChange}
              className="hover:border-[#0000ff] focus:border-[#0000ff]"
            />
            <p className="text-xs text-[#808080] mt-1">Link to additional content (optional)</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
          <div className="win98-bar h-6 flex items-center px-2 mb-3">
            <span className="text-white text-xs font-semibold tracking-tight">NFT File Upload</span>
          </div>

          <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white h-40 w-full bg-white p-2 flex flex-col items-center justify-center">
            <div className="text-center mb-2">
              <div className="w-16 h-16 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] flex items-center justify-center mx-auto mb-2 hover:bg-[#d0d0d0] cursor-pointer">
                <span className="text-black text-2xl">+</span>
              </div>
              <p className="text-xs text-black">Upload your NFT file</p>
            </div>
            <Button
              size="sm"
              className="text-xs hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
            >
              Browse Files...
            </Button>
          </div>
          <p className="text-xs text-[#808080] mt-1">
            Supported formats: PNG, JPG, GIF, MP4 (max 30MB)
          </p>
        </div>

        <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
          <div className="win98-bar h-6 flex items-center px-2 mb-3">
            <span className="text-white text-xs font-semibold tracking-tight">Properties</span>
          </div>

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
