"use client";

import { useEffect, useState } from "react";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/common";
import { TRPCProvider } from "@/components/providers/trpc-provider";
import { LoadingScreen, MainLayout } from "@/components/features/layout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Starting MyNFTs.exe...");
  const [showWelcome, setShowWelcome] = useState(false);
  const [initialRenderComplete, setInitialRenderComplete] = useState(false);

  useEffect(() => {
    const messages = [
      "Detecting hardware components...",
      "Initializing system interfaces...",
      "Preparing virtual environment...",
      "Loading MyNFTs.exe components...",
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
  }, []);

  useEffect(() => {
    setInitialRenderComplete(true);
  }, []);

  useEffect(() => {
    if (!loading && initialRenderComplete) {
      const hasSeenWelcomeInSession =
        sessionStorage.getItem("hasSeenWelcomeInSession") === "true";

      if (!hasSeenWelcomeInSession) {
        setTimeout(() => setShowWelcome(true), 1000);
      }
    }
  }, [loading, initialRenderComplete]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    sessionStorage.setItem("hasSeenWelcomeInSession", "true");
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>MyNFTs.exe: Digital Art Creator</title>
        <meta
          name="description"
          content="A retro-styled digital art creation platform"
        />
      </head>
      <body className="min-h-screen bg-[#008080] font-['MS_Sans_Serif'] antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <TRPCProvider>
            {loading ? (
              <LoadingScreen progress={progress} loadingText={loadingText} />
            ) : (
              <MainLayout
                showWelcome={showWelcome}
                onCloseWelcome={handleCloseWelcome}
              >
                {children}
              </MainLayout>
            )}
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
