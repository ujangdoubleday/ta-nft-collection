"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

export interface Win98SubMenuAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface Win98SubMenuProps {
  title?: string;
  actions?: Win98SubMenuAction[];
  showBackButton?: boolean;
  className?: string;
  extraContent?: React.ReactNode;
}

export function Win98SubMenu({
  title,
  actions = [],
  showBackButton = true,
  className,
  extraContent,
}: Win98SubMenuProps) {
  const router = useRouter();
  const pathname = usePathname();

  const _getPageTitle = () => {
    if (title) return title;

    // Generate title based on current path if not provided
    if (pathname === "/") return "Home";

    const pathSegments = pathname.split("/").filter(Boolean);
    if (pathSegments.length === 0) return "Home";

    // Format the last segment as title
    const lastSegment = pathSegments[pathSegments.length - 1];
    return lastSegment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div
      className={cn(
        "w-full bg-[#c0c0c0] border-b border-[#808080] py-1 px-2",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {showBackButton && (
          <button
            onClick={handleBack}
            className="flex items-center bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] h-6 px-2 text-sm press-effect my-1 
            hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset] active:bg-[#b0b0b0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white transition-colors duration-100"
          >
            <ChevronLeft className="h-3 w-3 mr-1" />
            <span>Back</span>
          </button>
        )}

        <div className="h-6 border-l border-[#808080] mx-1 md:block hidden"></div>

        <div className="flex flex-wrap gap-1">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                "flex items-center bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] h-6 px-2 text-sm press-effect my-1 hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset] active:bg-[#b0b0b0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white transition-colors duration-100",
                action.disabled &&
                  "opacity-50 cursor-not-allowed hover:bg-[#c0c0c0] hover:shadow-none"
              )}
            >
              {action.icon && <span className="mr-1">{action.icon}</span>}
              <span className="inline-block">{action.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-grow hidden md:block"></div>

        {extraContent && (
          <div className="w-full md:w-auto mt-1 md:mt-0 order-last md:order-none">
            {extraContent}
          </div>
        )}
      </div>
    </div>
  );
}
