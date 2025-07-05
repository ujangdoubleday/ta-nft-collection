'use client';

import { useEffect } from 'react';
import Spinner from '@/components/ui/spinner';

export default function UnauthorizedPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const referrer = document.referrer;
      const currentPath = window.location.pathname;

      const sourcePath = referrer
        ? new URL(referrer).pathname
        : currentPath !== '/unauthorized'
          ? currentPath
          : '/my';

      if (sourcePath === '/unauthorized') {
        window.location.href = `/unauthorized?callback=/my`;
      } else {
        window.location.href = `/unauthorized?callback=${encodeURIComponent(sourcePath)}`;
      }
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <Spinner size="xl" color="white" text="Redirecting..." />
    </div>
  );
}
