'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  progress: number;
  loadingText: string;
}

export function Loading({ progress, loadingText }: LoadingScreenProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
    }, 500);

    return () => clearInterval(dotsInterval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black w-full h-screen flex flex-col items-center justify-center z-50">
      <div className="w-full max-w-md px-4 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-12 relative h-24 w-24">
          <Image
            src="/assets/logo/white_full.png"
            alt="MyNFTs Logo"
            fill={true}
            className="animate-pulse"
            priority
          />
        </div>

        {/* Modern Progress Bar */}
        <div className="w-full mb-8">
          <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-right text-xs text-gray-400">{Math.round(progress)}%</div>
        </div>

        {/* Loading Text */}
        <p className="text-gray-300 text-sm font-medium tracking-wider mb-2">
          {loadingText}
          <span className="inline-block w-8 text-left">{dots}</span>
        </p>
      </div>
    </div>
  );
}
