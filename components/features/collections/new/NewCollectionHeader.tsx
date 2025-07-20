'use client';

export function NewCollectionHeader() {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Create New Collection</h1>
        </div>
      </div>

      <div className="h-px w-full bg-[#1f1f1f] mt-4 sm:mt-6"></div>
    </div>
  );
}
