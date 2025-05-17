"use client";

import { useEffect, useState } from "react";
import "./globals.css";
import { Win98Taskbar } from "@/components/win98-taskbar";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/ui/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);
  const [bootScreen, setBootScreen] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Starting Windows 98...");
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // First show boot screen for a moment
    const bootTimer = setTimeout(() => {
      setBootScreen(false);
      // Start loading sequence
      const messages = [
        "Detecting hardware...",
        "Initializing system...",
        "Loading components...",
        "Starting Pixel Vault...",
      ];

      // Windows 98 loading simulation
      const segments = 20; // Number of segments in progress bar
      const totalDuration = 4000; // Total loading time in ms
      const intervalTime = totalDuration / segments;

      let currentSegment = 0;
      const progressInterval = setInterval(() => {
        if (currentSegment < segments) {
          currentSegment++;
          setProgress((currentSegment / segments) * 100);

          // Update loading message at certain points
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

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Pixel Vault: Digital Art Creator</title>
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
          {loading ? (
            <div className="min-h-screen flex flex-col items-center justify-center">
              {bootScreen ? (
                // Windows 98 BIOS-style boot screen
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
                // Windows 98 loading screen
                <div className="bg-[#000] w-full h-screen flex flex-col items-center justify-center">
                  <div className="bg-[#008080] p-2 rounded mb-8">
                    <h1 className="text-white font-bold text-2xl">
                      Pixel Vault
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
              <div className="flex-1 pt-2 px-2 sm:px-4 md:px-6 win98-scrollbar overflow-auto">
                {children}
              </div>
              <Win98Taskbar />

              {/* Modal dialog effect that appears after loading */}
              {showWelcome && (
                <div className="fixed bottom-20 right-4 bg-[#c0c0c0] border-t-white border-l-white border-r-[#808080] border-b-[#808080] border-[2px] p-2 shadow-md w-64 z-50 animate-slide-up md:w-80">
                  <div className="win98-bar h-5 flex items-center px-2 mb-2">
                    <span className="text-white text-xs font-semibold tracking-tight">
                      Welcome
                    </span>
                  </div>
                  <p className="text-black text-xs mb-2">
                    Welcome to Pixel Vault! Create, collect, and share digital
                    art in a retro-styled environment.
                  </p>
                  <div className="flex justify-end">
                    <button
                      className="text-black text-xs bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-4 py-1 hover-active press-effect"
                      onClick={() => setShowWelcome(false)}
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
