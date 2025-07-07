'use client';

import { useEffect, useState, ReactNode } from 'react';
import { Loading } from './Loading';

interface ShellProps {
  children: React.ReactNode;
  Layout: React.ComponentType<{ children: ReactNode }>;
  storageKey?: string;
  welcomeSessionKey?: string;
  loadingMessages?: string[];
}

export function Shell({
  children,
  Layout,
  storageKey = 'appHasLoadedBefore',
  welcomeSessionKey = 'hasSeenWelcomeInSession',
  loadingMessages = [
    'Loading assets',
    'Preparing interface',
    'Connecting services',
    'Almost ready',
  ],
}: ShellProps) {
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
      const hasLoadedBefore = localStorage.getItem(storageKey);

      // Only enable the loading screen for first time visitors
      if (!hasLoadedBefore) {
        setLoading(true);
        // Set the flag to indicate the app has been loaded
        localStorage.setItem(storageKey, 'true');

        // Reset this flag when the tab is closed or after a certain period (optional)
        const handleTabClose = () => {
          // We can optionally reset the flag here, depending on requirements
          // localStorage.removeItem(storageKey);
        };

        window.addEventListener('beforeunload', handleTabClose);
        return () => {
          window.removeEventListener('beforeunload', handleTabClose);
        };
      }
    }
  }, [storageKey]);

  // Loading animation logic - only runs if loading is true
  useEffect(() => {
    if (!loading) return;

    const segments = 20;
    const totalDuration = 5000;
    const intervalTime = totalDuration / segments;

    let currentSegment = 0;
    const progressInterval = setInterval(() => {
      if (currentSegment < segments) {
        currentSegment++;
        setProgress((currentSegment / segments) * 100);

        if (currentSegment === 5) {
          setLoadingText(loadingMessages[0]);
        } else if (currentSegment === 10) {
          setLoadingText(loadingMessages[1]);
        } else if (currentSegment === 15) {
          setLoadingText(loadingMessages[2]);
        } else if (currentSegment === 18) {
          setLoadingText(loadingMessages[3]);
        }
      } else {
        clearInterval(progressInterval);
        setLoading(false);
      }
    }, intervalTime);

    return () => clearInterval(progressInterval);
  }, [loading, loadingMessages]);

  useEffect(() => {
    if (!loading && initialRenderComplete) {
      const hasSeenWelcomeInSession = sessionStorage.getItem(welcomeSessionKey) === 'true';

      if (!hasSeenWelcomeInSession) {
        setTimeout(() => setShowWelcome(true), 1000);
      }
    }
  }, [loading, initialRenderComplete, welcomeSessionKey]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    sessionStorage.setItem(welcomeSessionKey, 'true');
  };

  return (
    <>
      {loading ? (
        <Loading progress={progress} loadingText={loadingText} />
      ) : (
        <Layout>{children}</Layout>
      )}
    </>
  );
}

export default Shell;
