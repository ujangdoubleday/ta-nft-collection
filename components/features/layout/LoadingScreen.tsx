'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  progress: number;
  loadingText: string;
}

export function LoadingScreen({ progress, loadingText }: LoadingScreenProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
    }, 500);

    return () => clearInterval(dotsInterval);
  }, []);

  return (
    <div className="bg-[#000] w-full h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-md mb-10 px-4">
        <div className="flex items-center justify-center mb-10">
          <div className="h-28 w-28 relative">
            <Image
              src="/assets/logo/black.svg"
              alt="MyNFTs Logo"
              decoding="async"
              fill={true}
              unoptimized
              className="invert h-full w-full"
              onError={(e) => {
                e.currentTarget.src =
                  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='white'/><text x='50' y='50' font-size='20' text-anchor='middle' fill='black'>NFT</text></svg>";
              }}
            />
          </div>
          <div className="ml-4">
            <h1 className="text-white font-bold text-2xl">MyNFTs.exe</h1>
            <p className="text-gray-400 text-xs">Retro Edition</p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-80 bg-[#c0c0c0] border-t-white border-l-white border-r-[#808080] border-b-[#808080] border-[2px] p-[2px] shadow-md mb-3">
            <div className="h-5 w-full bg-[#c0c0c0] border-t-[#808080] border-l-[#808080] border-r-white border-b-white border-[1px] flex items-center px-1 overflow-hidden">
              <div className="flex w-full">
                {Array.from({ length: 20 }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-3 w-[10px] mx-[1px] ${
                      index < Math.ceil(progress / 5)
                        ? 'bg-[#000080] animate-windows98-loading'
                        : 'bg-[#c0c0c0]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <p className="text-white text-sm">
            {loadingText}
            {dots}
          </p>

          <p className="text-gray-500 text-xs mt-20">
            &copy; 2025 MyNFTs.exe | ilham alfath. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
