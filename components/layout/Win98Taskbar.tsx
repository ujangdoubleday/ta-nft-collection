"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { generateBreadcrumbs } from "@/lib/utils/breadcrumbs";

export function Win98Taskbar() {
  const [currentTime, setCurrentTime] = React.useState<string>("");
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Function to get the appropriate icon for a path
  const getIconForPath = (path: string): string => {
    if (path === "/") {
      return "/assets/icons/windows.png";
    } else if (path === "/about") {
      return "/assets/icons/taskbar/about.png";
    } else if (path === "/contact") {
      return "/assets/icons/taskbar/contact.png";
    } else if (path === "/my-collections") {
      return "/assets/icons/taskbar/collections.png";
    } else if (path.includes("/my-collections/") && !path.includes("/nft/")) {
      return "/assets/icons/taskbar/ape.png";
    } else if (path.includes("/nft/")) {
      return "/assets/icons/taskbar/detail-nft.png";
    }

    // Default icon if no match
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
            <ThemeToggle />
            <span className="text-black ml-2">{currentTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
