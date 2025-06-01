"use client";

import { cn } from "@/lib/utils";
import React, { useState, useEffect, useRef } from "react";

interface MenuItem {
  id: string;
  label?: string;
  icon?: string;
  disabled?: boolean;
  onClick?: () => void;
  items?: MenuItem[];
  separator?: boolean;
}

interface Win98MenuProps {
  label: string;
  items: MenuItem[];
  className?: string;
  disabled?: boolean;
}

export function Win98Menu({
  label,
  items,
  className,
  disabled = false,
}: Win98MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const renderMenuItem = (item: MenuItem) => {
    if (item.separator) {
      return <div key={item.id} className="h-[1px] bg-[#808080] my-1" />;
    }

    return (
      <button
        key={item.id}
        className={cn(
          "w-full flex items-center px-2 py-0.5 text-left text-sm",
          item.disabled
            ? "text-gray-500"
            : "hover:bg-[#000080] hover:text-white"
        )}
        onClick={() => {
          if (!item.disabled && !item.items) {
            setIsOpen(false);
            item.onClick?.();
          }
        }}
        disabled={item.disabled}
      >
        {item.icon && (
          <div className="w-4 h-4 mr-1 flex-shrink-0">
            <img src={item.icon} alt="" className="w-4 h-4" />
          </div>
        )}
        <span className="truncate">{item.label}</span>
        {item.items && <span className="ml-auto">►</span>}
      </button>
    );
  };

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <button
        className={cn(
          "px-2 py-0.5 text-sm outline-none focus:outline-none",
          disabled ? "text-gray-500" : "hover:bg-[#000080] hover:text-white",
          isOpen && "bg-[#000080] text-white"
        )}
        onClick={handleToggle}
        disabled={disabled}
      >
        {label}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-0.5 z-50 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] min-w-[160px] shadow-md">
          <div className="py-1">{items.map(renderMenuItem)}</div>
        </div>
      )}
    </div>
  );
}
