import { cn } from "@/lib/utils";
import React from "react";

interface Win98WindowProps {
  title: string;
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isActive?: boolean;
  icon?: string;
}

export function Win98Window({
  title,
  className,
  children,
  onClose,
  onMinimize,
  onMaximize,
  isActive = true,
  icon,
}: Win98WindowProps) {
  return (
    <div
      className={cn(
        "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] rounded-none shadow-md",
        isActive ? "z-20" : "z-10 opacity-90",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between px-1 h-6",
          isActive ? "win98-bar text-white" : "bg-gray-500 text-gray-200"
        )}
      >
        <div className="flex items-center gap-1">
          {icon && <img src={icon} alt="" className="w-4 h-4" />}
          <span className="text-xs font-bold truncate">{title}</span>
        </div>
        <div className="flex items-center">
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="w-4 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] flex items-center justify-center mr-1"
            >
              <span className="text-black text-xs leading-none mb-1">_</span>
            </button>
          )}
          {onMaximize && (
            <button
              onClick={onMaximize}
              className="w-4 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] flex items-center justify-center mr-1"
            >
              <span className="text-black text-xs">□</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="w-4 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] flex items-center justify-center"
            >
              <span className="text-black text-xs">×</span>
            </button>
          )}
        </div>
      </div>
      <div className="p-2">{children}</div>
    </div>
  );
}
