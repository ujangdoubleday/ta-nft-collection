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
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Simulate Windows 98 startup
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
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
              <div className="bg-[#000] w-full h-screen flex flex-col items-center justify-center">
                <div className="bg-[#008080] p-2 rounded animate-pulse mb-4">
                  <h1 className="text-white font-bold text-2xl">Pixel Vault</h1>
                </div>
                <div className="win98-shadow-inset w-64 bg-[#c0c0c0] h-6 p-1">
                  <div className="bg-[#000080] h-full animate-startup"></div>
                </div>
                <p className="text-white mt-4 text-xs animate-blink">
                  Starting up...
                </p>
              </div>
            </div>
          ) : (
            <div className="relative flex min-h-screen flex-col pb-10 animate-fade-in">
              <Navbar />
              <div className="flex-1 pt-2 px-2 sm:px-4 md:px-6">{children}</div>
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
