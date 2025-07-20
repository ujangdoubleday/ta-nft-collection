'use client';

interface CollectionDetailsProps {
  name: string;
  setName: (name: string) => void;
  symbol: string;
  setSymbol: (symbol: string) => void;
  maxSupply: string;
  setMaxSupply: (maxSupply: string) => void;
  description: string;
  setDescription: (description: string) => void;
}

export function CollectionDetails({
  name,
  setName,
  symbol,
  setSymbol,
  maxSupply,
  setMaxSupply,
  description,
  setDescription,
}: CollectionDetailsProps) {
  return (
    <>
      <div className="mb-3 sm:mb-4">
        <label
          htmlFor="name"
          className="block text-white mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium"
        >
          Collection Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter collection name"
          className="w-full bg-[#0A0A0A] border border-[#1f1f1f] rounded-md py-1.5 sm:py-2 px-2.5 sm:px-3 text-sm sm:text-base text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
          required
        />
      </div>

      <div className="mb-3 sm:mb-4">
        <label
          htmlFor="symbol"
          className="block text-white mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium"
        >
          Collection Symbol
        </label>
        <input
          type="text"
          id="symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter collection symbol (e.g. PIXEL)"
          className="w-full bg-[#0A0A0A] border border-[#1f1f1f] rounded-md py-1.5 sm:py-2 px-2.5 sm:px-3 text-sm sm:text-base text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
          required
          maxLength={6}
        />
        <p className="text-zinc-500 text-[10px] sm:text-xs mt-1">
          A short symbol for your collection (max 6 characters)
        </p>
      </div>

      <div className="mb-3 sm:mb-4">
        <label
          htmlFor="maxSupply"
          className="block text-white mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium"
        >
          Maximum Supply
        </label>
        <input
          type="number"
          id="maxSupply"
          value={maxSupply}
          onChange={(e) => setMaxSupply(e.target.value)}
          placeholder="Enter maximum supply (e.g. 100)"
          className="w-full bg-[#0A0A0A] border border-[#1f1f1f] rounded-md py-1.5 sm:py-2 px-2.5 sm:px-3 text-sm sm:text-base text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
          required
          min="1"
          max="10000"
        />
        <p className="text-zinc-500 text-[10px] sm:text-xs mt-1">
          Maximum number of NFTs that can be minted in this collection
        </p>
      </div>

      <div className="mb-4 sm:mb-6">
        <label
          htmlFor="description"
          className="block text-white mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter collection description"
          rows={4}
          className="w-full bg-[#0A0A0A] border border-[#1f1f1f] rounded-md py-1.5 sm:py-2 px-2.5 sm:px-3 text-sm sm:text-base text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
          required
        ></textarea>
      </div>
    </>
  );
}
