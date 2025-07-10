'use client';

export function NFTsHeader() {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My NFTs</h1>
          <p className="text-zinc-400 mt-1">All your NFTs across collections</p>
        </div>
      </div>
      <div className="h-px w-full bg-[#1f1f1f] mt-6"></div>
    </div>
  );
}
