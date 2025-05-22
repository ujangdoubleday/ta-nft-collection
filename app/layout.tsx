"use client";

import { useEffect, useState } from "react";
import "@/styles/globals.css";
import { Win98Taskbar } from "@/components/layout";
import { ThemeProvider } from "@/components/common";
import { Navbar, NavbarSpacer, Win98SubMenuBar } from "@/components/layout";
import { Win98WelcomeNotification } from "@/components/layout/notifications";
import { TRPCProvider } from "@/components/providers/trpc-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);
  const [bootScreen, setBootScreen] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Starting Windows 98...");
  const [showWelcome, setShowWelcome] = useState(false);
  const [initialRenderComplete, setInitialRenderComplete] = useState(false);

  useEffect(() => {
    const bootTimer = setTimeout(() => {
      setBootScreen(false);

      const messages = [
        "Detecting hardware...",
        "Initializing system...",
        "Loading components...",
        "Starting MyNFTs.exe...",
      ];

      const segments = 20;
      const totalDuration = 4000;
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
    }, 1500);

    return () => clearTimeout(bootTimer);
  }, []);

  useEffect(() => {
    setInitialRenderComplete(true);
  }, []);

  useEffect(() => {
    if (!loading && initialRenderComplete) {
      const hasSeenWelcomeInSession =
        sessionStorage.getItem("hasSeenWelcomeInSession") === "true";

      if (!hasSeenWelcomeInSession) {
        setShowWelcome(true);
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
              <div className="min-h-screen flex flex-col items-center justify-center">
                {bootScreen ? (
                  <div className="bg-[#000] w-full h-screen flex flex-col items-center justify-center text-white">
                    <div className="text-center">
                      <p className="text-sm mb-4">PIXEL BIOS v4.98</p>
                      <p className="text-xs mb-1">CPU: Web Assembly 3.7 GHz</p>
                      <p className="text-xs mb-1">Memory Test: 640K OK</p>
                      <p className="text-xs mb-4 animate-blink">
                        Press DEL to enter SETUP
                      </p>
                      <p className="text-xs">Booting from Web Drive C:...</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#000] w-full h-screen flex flex-col items-center justify-center">
                    <div className="bg-[#008080] p-2 rounded mb-8">
                      <h1 className="text-white font-bold text-2xl">
                        MyNFTs.exe
                      </h1>
                    </div>
                    <div className="w-80 bg-[#c0c0c0] border-t-white border-l-white border-r-[#808080] border-b-[#808080] border-[2px] p-[2px] shadow-md">
                      <div className="h-5 w-full bg-[#c0c0c0] border-t-[#808080] border-l-[#808080] border-r-white border-b-white border-[1px] flex items-center px-1">
                        {Array.from({ length: 20 }).map((_, index) => (
                          <div
                            key={index}
                            className={`h-3 w-[10px] mx-[1px] ${
                              index < Math.ceil(progress / 5)
                                ? "bg-[#000080] win98-progress-block"
                                : "bg-[#c0c0c0]"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-white mt-4 text-xs">{loadingText}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative flex min-h-screen flex-col pb-10 animate-fade-in">
                <Navbar />
                <NavbarSpacer />
                <Win98SubMenuBar />
                <div className="flex-1 pt-2 px-2 sm:px-4 md:px-6 win98-scrollbar overflow-auto">
                  {children}
                </div>
                <Win98Taskbar />

                {showWelcome && (
                  <Win98WelcomeNotification onClose={handleCloseWelcome} />
                )}
              </div>
            )}
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
