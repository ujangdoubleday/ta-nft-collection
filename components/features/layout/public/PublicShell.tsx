'use client';

import { useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/features/layout/LoadingScreen';
import { PublicLayout } from './PublicLayout';

interface PublicShellProps {
  children: React.ReactNode;
}

export function PublicShell({ children }: PublicShellProps) {
  // Initialize with loading=false as default, and only set to true after checking
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing application');
  const [showWelcome, setShowWelcome] = useState(false);
  const [initialRenderComplete, setInitialRenderComplete] = useState(false);

  // Initialize loading state based on first-load detection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if this is the first load of the application in this browser session
      const hasLoadedBefore = localStorage.getItem('appHasLoadedBefore');

      // Only enable the loading screen for first time visitors
      if (!hasLoadedBefore) {
        setLoading(true);
        // Set the flag to indicate the app has been loaded
        localStorage.setItem('appHasLoadedBefore', 'true');

        // Reset this flag when the tab is closed or after a certain period (optional)
        const handleTabClose = () => {
          // We can optionally reset the flag here, depending on requirements
          // localStorage.removeItem("appHasLoadedBefore");
        };

        window.addEventListener('beforeunload', handleTabClose);
        return () => {
          window.removeEventListener('beforeunload', handleTabClose);
        };
      }
    }
  }, []);

  // Loading animation logic - only runs if loading is true
  useEffect(() => {
    if (!loading) return;

    const messages = [
      'Loading assets',
      'Preparing interface',
      'Connecting services',
      'Almost ready',
    ];

    const segments = 20;
    const totalDuration = 5000;
    const intervalTime = totalDuration / segments;

    let currentSegment = 0;
    const progressInterval = setInterval(() => {
      if (currentSegment < segments) {
        currentSegment++;
        setProgress((currentSegment / segments) * 100);

        if (currentSegment === 5) {
          setLoadingText(messages[0]);
        } else if (currentSegment === 10) {
          setLoadingText(messages[1]);
        } else if (currentSegment === 15) {
          setLoadingText(messages[2]);
        } else if (currentSegment === 18) {
          setLoadingText(messages[3]);
        }
      } else {
        clearInterval(progressInterval);
        setLoading(false);
      }
    }, intervalTime);

    return () => clearInterval(progressInterval);
  }, [loading]);

  useEffect(() => {
    if (!loading && initialRenderComplete) {
      const hasSeenWelcomeInSession = sessionStorage.getItem('hasSeenWelcomeInSession') === 'true';

      if (!hasSeenWelcomeInSession) {
        setTimeout(() => setShowWelcome(true), 1000);
      }
    }
  }, [loading, initialRenderComplete]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    sessionStorage.setItem('hasSeenWelcomeInSession', 'true');
  };

  return (
    <>
      {loading ? (
        <LoadingScreen progress={progress} loadingText={loadingText} />
      ) : (
        <PublicLayout>{children}</PublicLayout>
      )}
    </>
  );
}
