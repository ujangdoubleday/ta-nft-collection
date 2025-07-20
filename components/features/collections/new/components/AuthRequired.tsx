'use client';

import { Upload } from 'lucide-react';

interface AuthRequiredProps {
  isConnected: boolean;
  onConnect: () => Promise<void>;
}

export function AuthRequired({ isConnected, onConnect }: AuthRequiredProps) {
  return (
    <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4 sm:p-6">
      <div className="text-center py-8 sm:py-12">
        <div className="bg-[#0A0A0A] w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-[#1f1f1f]">
          <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Authentication Required</h2>
        <p className="text-zinc-400 mb-4 sm:mb-6 text-sm sm:text-base px-4 sm:px-0">
          {!isConnected
            ? 'Connect your wallet to create a new NFT collection.'
            : 'Please authenticate your wallet to create collections.'}
        </p>
        <button
          onClick={() => onConnect()}
          className="bg-white text-black hover:bg-zinc-200 py-1.5 sm:py-2 px-4 sm:px-6 rounded-md transition-colors text-sm font-medium inline-flex items-center gap-2"
        >
          {!isConnected ? 'Connect Wallet' : 'Authenticate Wallet'}
        </button>
      </div>
    </div>
  );
}
