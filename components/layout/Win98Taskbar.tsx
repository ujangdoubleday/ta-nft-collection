"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { generateBreadcrumbs } from "@/lib/utils/breadcrumbs";

export function Win98Taskbar() {
  const [currentTime, setCurrentTime] = React.useState<string>("");
  const [isDaytime, setIsDaytime] = React.useState<boolean>(true);
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");

      // Check if it's daytime (between 6 AM and 6 PM)
      setIsDaytime(hours >= 6 && hours < 18);

      // Format time for display (24-hour format)
      setCurrentTime(`${hours.toString().padStart(2, "0")}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const getIconForPath = (path: string): string => {
    if (path === "/") {
      return "/assets/icons/windows.png";
    } else if (path === "/about") {
      return "/assets/icons/taskbar/about.png";
    } else if (path === "/contact") {
      return "/assets/icons/taskbar/contact.png";
    } else if (path === "/collections") {
      return "/assets/icons/taskbar/collections.png";
    } else if (path.includes("/collections/") && !path.includes("/nft/")) {
      return "/assets/icons/taskbar/ape.png";
    } else if (path.includes("/nft/")) {
      return "/assets/icons/taskbar/detail-nft.png";
    }

    return "/assets/icons/windows.png";
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 bg-[#c0c0c0] border-t-[2px] border-white z-50">
      <div className="flex items-center justify-between h-full px-1">
        <div className="flex items-center gap-1 h-full overflow-x-auto">
          <Link href="/">
            <Button
              className={cn(
                "h-8 px-2 flex items-center gap-2 bg-[#c0c0c0]",
                pathname === "/"
                  ? "border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-[#d2d2d2]"
                  : "border-t-white border-l-white border-r-[#808080] border-b-[#808080]"
              )}
              variant="default"
            >
              <div className="w-5 h-5 bg-transparent flex items-center justify-center">
                <img
                  src="/assets/icons/windows.png"
                  alt="Windows"
                  className="w-4 h-4"
                />
              </div>
              <span className="text-black">
                <b>Home</b>
              </span>
            </Button>
          </Link>

          {breadcrumbs.map((crumb) => (
            <Link key={crumb.path} href={crumb.path}>
              <Button
                size="sm"
                className={cn(
                  "h-8 px-2 bg-[#c0c0c0] text-black text-xs whitespace-nowrap flex items-center gap-2",
                  pathname === crumb.path
                    ? "border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-[#d2d2d2]"
                    : "border-t-white border-l-white border-r-[#808080] border-b-[#808080]"
                )}
              >
                <div className="w-4 h-4 bg-transparent flex items-center justify-center">
                  <img
                    src={getIconForPath(crumb.path)}
                    alt={crumb.label}
                    className="w-4 h-4"
                  />
                </div>
                {crumb.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="h-full flex items-center px-1 py-1">
          <div className="h-full bg-[#c0c0c0] border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-2 py-1 flex items-center">
            <span className="text-black flex items-center">
              {isDaytime ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-black mr-2"
                >
                  <circle cx="12" cy="12" r="4"></circle>
                  <path d="M12 2v2"></path>
                  <path d="M12 20v2"></path>
                  <path d="m4.93 4.93 1.41 1.41"></path>
                  <path d="m17.66 17.66 1.41 1.41"></path>
                  <path d="M2 12h2"></path>
                  <path d="M20 12h2"></path>
                  <path d="m6.34 17.66-1.41 1.41"></path>
                  <path d="m19.07 4.93-1.41 1.41"></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-black mr-2"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                </svg>
              )}
              {currentTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
