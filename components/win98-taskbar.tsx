"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Win98Taskbar() {
  const [currentTime, setCurrentTime] = React.useState<string>("");
  const pathname = usePathname();

  // Function to generate breadcrumb items based on pathname
  const generateBreadcrumbs = () => {
    if (pathname === "/") return [];

    const paths = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];

    let currentPath = "";

    for (let i = 0; i < paths.length; i++) {
      currentPath += `/${paths[i]}`;

      // Handle special cases for better labeling
      let label = paths[i].replace(/-/g, " ");
      label = label.charAt(0).toUpperCase() + label.slice(1);

      // For collection IDs, add "Collection: " prefix
      if (i === 1 && paths[0] === "my-collections" && paths[i] !== "create") {
        breadcrumbs.push({ label: `Collection: ${label}`, path: currentPath });
      }
      // For NFT IDs
      else if (i === 2 && paths[0] === "my-collections") {
        breadcrumbs.push({ label: `NFT: ${paths[i]}`, path: currentPath });
      }
      // For "create" or other special pages
      else if (paths[i] === "create") {
        breadcrumbs.push({ label: "Create New", path: currentPath });
      }
      // For "mint" page
      else if (paths[i] === "mint") {
        breadcrumbs.push({ label: "Mint NFT", path: currentPath });
      }
      // Standard pages
      else if (i === 0) {
        if (paths[i] === "my-collections") {
          breadcrumbs.push({ label: "My Collections", path: currentPath });
        } else {
          breadcrumbs.push({ label, path: currentPath });
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

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
              <div className="w-5 h-5 bg-green-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              <span className="text-black">Pixel Vault</span>
            </Button>
          </Link>

          {breadcrumbs.map((crumb) => (
            <Link key={crumb.path} href={crumb.path}>
              <Button
                size="sm"
                className={cn(
                  "h-8 px-2 bg-[#c0c0c0] text-black text-xs whitespace-nowrap",
                  pathname === crumb.path
                    ? "border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-[#d2d2d2]"
                    : "border-t-white border-l-white border-r-[#808080] border-b-[#808080]"
                )}
              >
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
