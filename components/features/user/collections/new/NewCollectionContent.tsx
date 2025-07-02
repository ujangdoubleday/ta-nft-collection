'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Upload, X, Check } from 'lucide-react';

export function NewCollectionContent() {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createdAddress, setCreatedAddress] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    // Simulate collection creation process
    setTimeout(() => {
      setIsCreating(false);
      setCreateSuccess(true);
      setCreatedAddress('0x1234567890abcdef1234567890abcdef12345678');
    }, 2000);
  };

  if (createSuccess) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        <Link
          href="/my/collections"
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Collections
        </Link>

        <div className="text-center py-12">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Collection Created Successfully!</h2>
          <p className="text-zinc-400 mb-6">
            Your new NFT collection has been created and is ready to use.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href={`/my/collections/${createdAddress}`}
              className="bg-white text-black hover:bg-zinc-200 py-2 px-4 rounded-md transition-colors text-sm font-medium"
            >
              View Collection
            </Link>
            <Link
              href={`/my/collections/${createdAddress}/nfts/mint`}
              className="bg-[#0A0A0A] border border-[#1f1f1f] hover:bg-[#1f1f1f] text-white py-2 px-4 rounded-md transition-colors text-sm font-medium"
            >
              Mint First NFT
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
      <Link
        href="/my/collections"
        className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-sm mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Collections
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Create New Collection</h1>
        <p className="text-zinc-400">
          Create a new NFT collection to mint and manage your digital assets
        </p>
      </div>

      <form onSubmit={handleCreate}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Image Upload */}
          <div className="w-full lg:w-1/3">
            <div className="mb-4">
              <label className="block text-white mb-2 text-sm font-medium">Collection Image</label>
              <div className="relative aspect-square bg-[#0A0A0A] border border-[#1f1f1f] border-dashed rounded-lg overflow-hidden flex flex-col items-center justify-center">
                {imagePreview ? (
                  <>
                    <Image
                      src={imagePreview}
                      alt="Collection Preview"
                      fill
                      className="object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-2 right-2 p-1 bg-[#0A0A0A] border border-[#1f1f1f] rounded-full"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center h-full w-full">
                    <Upload className="h-8 w-8 text-white mb-2" />
                    <span className="text-white text-sm font-medium">Upload Image</span>
                    <span className="text-zinc-400 text-xs mt-1">
                      PNG, JPG, SVG, GIF (Max 10MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
              <p className="text-zinc-500 text-xs mt-1">
                This image will be used as the collection thumbnail and logo
              </p>
            </div>
          </div>

          {/* Right Column - Collection Details */}
          <div className="w-full lg:w-2/3">
            <div className="mb-4">
              <label htmlFor="name" className="block text-white mb-2 text-sm font-medium">
                Collection Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter collection name"
                className="w-full bg-[#0A0A0A] border border-[#1f1f1f] rounded-md py-2 px-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="symbol" className="block text-white mb-2 text-sm font-medium">
                Collection Symbol
              </label>
              <input
                type="text"
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Enter collection symbol (e.g. PIXEL)"
                className="w-full bg-[#0A0A0A] border border-[#1f1f1f] rounded-md py-2 px-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
                required
                maxLength={6}
              />
              <p className="text-zinc-500 text-xs mt-1">
                A short symbol for your collection (max 6 characters)
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-white mb-2 text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter collection description"
                rows={4}
                className="w-full bg-[#0A0A0A] border border-[#1f1f1f] rounded-md py-2 px-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
                required
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isCreating || !name || !symbol || !description || !imagePreview}
                className={`bg-white text-black hover:bg-zinc-200 py-2 px-6 rounded-md transition-colors text-sm font-medium flex items-center gap-2 ${
                  (isCreating || !name || !symbol || !description || !imagePreview) &&
                  'opacity-50 cursor-not-allowed'
                }`}
              >
                {isCreating ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></span>
                    Creating...
                  </>
                ) : (
                  'Create Collection'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
