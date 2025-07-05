'use client';

interface NFTFormProps {
  nftName: string;
  setNftName: (name: string) => void;
  nftDescription: string;
  setNftDescription: (description: string) => void;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isMinting: boolean;
  isUploading: boolean;
  isMintLoading: boolean;
  address: string | null;
}

export const NFTForm = ({
  nftName,
  setNftName,
  nftDescription,
  setNftDescription,
  children,
  onSubmit,
  isMinting,
  isUploading,
  isMintLoading,
  address,
}: NFTFormProps) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col lg:flex-row gap-8">
        {children}

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
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isMinting || isUploading || isMintLoading || !address}
              className="bg-white text-black hover:bg-zinc-200 py-2 px-6 rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMinting || isUploading || isMintLoading ? 'Minting...' : 'Mint NFT'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
