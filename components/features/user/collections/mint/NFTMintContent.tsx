'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Upload, Plus, X, Check } from 'lucide-react';
import { shortenAddress } from '@/lib/utils/formatting';

// Sample collection data - in a real app, this would come from an API
const SAMPLE_COLLECTION = {
  id: '1',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  name: 'Pixel Art Collection',
  description: 'A collection of unique pixel art NFTs inspired by retro gaming aesthetics.',
  imageUrl: '/assets/images/nfts/pixel-art/pixel-1.svg',
  itemCount: 8,
  createdAt: '2023-10-15',
  symbol: 'PIXEL',
};

interface NFTMintContentProps {
  address: string;
}

export function NFTMintContent({ address }: NFTMintContentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [collection, setCollection] = useState<typeof SAMPLE_COLLECTION | null>(null);
  const [nftName, setNftName] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [attributes, setAttributes] = useState<Array<{ trait_type: string; value: string }>>([
    { trait_type: '', value: '' },
  ]);
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);

  // Simulate loading collection data
  useEffect(() => {
    const timer = setTimeout(() => {
      setCollection(SAMPLE_COLLECTION);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [address]);

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

  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: '', value: '' }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: 'trait_type' | 'value', value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMinting(true);

    // Simulate minting process
    setTimeout(() => {
      setIsMinting(false);
      setMintSuccess(true);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-[#1f1f1f] rounded w-1/4 mb-4"></div>
        <div className="h-12 bg-[#1f1f1f] rounded w-3/4 mb-6"></div>
        <div className="h-80 bg-[#1f1f1f] rounded w-full"></div>
      </div>
    );
  }

  if (!collection) {
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
          <h2 className="text-2xl font-bold text-white mb-2">Collection Not Found</h2>
          <p className="text-zinc-400">The collection with address {address} could not be found.</p>
        </div>
      </div>
    );
  }

  if (mintSuccess) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        <Link
          href={`/my/collections/${address}/nfts`}
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Collection NFTs
        </Link>

        <div className="text-center py-12">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">NFT Minted Successfully!</h2>
          <p className="text-zinc-400 mb-6">
            Your new NFT has been minted and added to your collection.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href={`/my/collections/${address}/nfts`}
              className="bg-white text-black hover:bg-zinc-200 py-2 px-4 rounded-md transition-colors text-sm font-medium"
            >
              View All NFTs
            </Link>
            <button
              onClick={() => {
                setNftName('');
                setNftDescription('');
                setImagePreview(null);
                setAttributes([{ trait_type: '', value: '' }]);
                setMintSuccess(false);
              }}
              className="bg-[#0A0A0A] border border-[#1f1f1f] hover:bg-[#1f1f1f] text-white py-2 px-4 rounded-md transition-colors text-sm font-medium"
            >
              Mint Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
      <Link
        href={`/my/collections/${address}/nfts`}
        className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-sm mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Collection NFTs
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Mint New NFT</h1>
        <p className="text-zinc-400">
          Create a new NFT in <span className="font-medium">{collection.name}</span> (
          {shortenAddress(collection.address, 6)})
        </p>
      </div>

      <form onSubmit={handleMint}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Image Upload */}
          <div className="w-full lg:w-1/3">
            <div className="mb-4">
              <label className="block text-white mb-2 text-sm font-medium">NFT Image</label>
              <div className="relative aspect-square bg-[#0A0A0A] border border-[#1f1f1f] border-dashed rounded-lg overflow-hidden flex flex-col items-center justify-center">
                {imagePreview ? (
                  <>
                    <Image src={imagePreview} alt="NFT Preview" fill className="object-contain" />
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
            </div>
          </div>

          {/* Right Column - NFT Details */}
          <div className="w-full lg:w-2/3">
            <div className="mb-4">
              <label htmlFor="nftName" className="block text-white mb-2 text-sm font-medium">
                Name
              </label>
              <input
                type="text"
                id="nftName"
                value={nftName}
                onChange={(e) => setNftName(e.target.value)}
                placeholder="Enter NFT name"
                className="w-full bg-[#0A0A0A] border border-[#1f1f1f] rounded-md py-2 px-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="nftDescription" className="block text-white mb-2 text-sm font-medium">
                Description
              </label>
              <textarea
                id="nftDescription"
                value={nftDescription}
                onChange={(e) => setNftDescription(e.target.value)}
                placeholder="Enter NFT description"
                rows={4}
                className="w-full bg-[#0A0A0A] border border-[#1f1f1f] rounded-md py-2 px-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
                required
              ></textarea>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-white text-sm font-medium">Attributes</label>
                <button
                  type="button"
                  onClick={addAttribute}
                  className="flex items-center gap-1 text-white text-xs bg-[#1f1f1f] hover:bg-[#2a2a2a] py-1 px-2 rounded-md"
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
                      className="flex-1 bg-[#0A0A0A] border border-[#1f1f1f] rounded-md py-2 px-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white text-sm"
                    />
                    <input
                      type="text"
                      value={attr.value}
                      onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1 bg-[#0A0A0A] border border-[#1f1f1f] rounded-md py-2 px-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white text-sm"
                    />
                    {attributes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAttribute(index)}
                        className="p-2 bg-[#0A0A0A] border border-[#1f1f1f] rounded-md hover:bg-[#1f1f1f]"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isMinting || !nftName || !nftDescription || !imagePreview}
                className={`bg-white text-black hover:bg-zinc-200 py-2 px-6 rounded-md transition-colors text-sm font-medium flex items-center gap-2 ${
                  (isMinting || !nftName || !nftDescription || !imagePreview) &&
                  'opacity-50 cursor-not-allowed'
                }`}
              >
                {isMinting ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></span>
                    Minting...
                  </>
                ) : (
                  'Mint NFT'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
