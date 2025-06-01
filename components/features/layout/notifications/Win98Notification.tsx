"use client";

import React from "react";

interface Win98NotificationProps {
  title: string;
  message: string;
  onClose: () => void;
  position?: "top" | "bottom";
  className?: string;
}

export function Win98Notification({
  title,
  message,
  onClose,
  position = "bottom",
  className,
}: Win98NotificationProps) {
  // Calculate position classes based on position prop
  const positionClasses =
    position === "top" ? "top-16 right-4" : "bottom-20 right-4";

  return (
    <div
      className={`fixed ${positionClasses} bg-[#c0c0c0] border-t-white border-l-white border-r-[#808080] border-b-[#808080] border-[2px] p-2 shadow-md w-64 z-50 animate-slide-up md:w-80 ${className}`}
    >
      <div className="win98-bar h-5 flex items-center px-2 mb-2">
        <span className="text-white text-xs font-semibold tracking-tight">
          {title}
        </span>
      </div>
      <p className="text-black text-xs mb-2">{message}</p>
      <div className="flex justify-end">
        <button
          className="text-black text-xs bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-4 py-1 hover-active press-effect"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}
