'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NotFound() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white text-center px-4">
      <h1 className="text-7xl font-bold mb-4">404</h1>
      <p className="text-lg mb-2 italic">what are you lookin&apos; for?</p>

      <p className="mt-6 text-sm text-zinc-400">
        you&apos;ll be safe in{' '}
        <Link
          href="/"
          className="underline underline-offset-4 hover:text-white transition font-medium"
        >
          Home.
        </Link>
      </p>
    </div>
  );
}
