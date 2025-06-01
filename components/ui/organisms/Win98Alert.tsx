"use client";

import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { createPortal } from "react-dom";

type AlertType = "error" | "warning" | "info" | "question";

interface Win98AlertProps {
  title?: string;
  message: string;
  type?: AlertType;
  onClose: () => void;
  buttons?: {
    label: string;
    onClick: () => void;
    primary?: boolean;
  }[];
  isOpen?: boolean;
  className?: string;
}

export function Win98Alert({
  title,
  message,
  type = "info",
  onClose,
  buttons = [{ label: "OK", onClick: () => {}, primary: true }],
  isOpen = true,
  className,
}: Win98AlertProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const getIconForType = (type: AlertType): string => {
    switch (type) {
      case "error":
        return "/assets/icons/error.png";
      case "warning":
        return "/assets/icons/warning.png";
      case "question":
        return "/assets/icons/question.png";
      case "info":
      default:
        return "/assets/icons/info.png";
    }
  };

  const getDefaultTitle = (type: AlertType): string => {
    switch (type) {
      case "error":
        return "Error";
      case "warning":
        return "Warning";
      case "question":
        return "Question";
      case "info":
      default:
        return "Information";
    }
  };

  if (!isOpen) return null;

  // Portal to body to avoid z-index issues
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 animate-fade-in">
      <div
        className={cn(
          "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] shadow-lg animate-win98StartUp",
          "max-w-md w-full mx-4",
          className
        )}
      >
        <div className="win98-bar h-6 flex items-center px-2">
          <span className="text-white text-xs font-bold">
            {title || getDefaultTitle(type)}
          </span>
        </div>

        <div className="p-4 flex">
          <div className="mr-4 flex-shrink-0">
            <img src={getIconForType(type)} alt="" className="w-8 h-8" />
          </div>
          <p className="text-sm text-black">{message}</p>
        </div>

        <div className="flex justify-center gap-2 p-4 border-t border-[#808080]">
          {buttons.map((button, index) => (
            <button
              key={index}
              onClick={() => {
                button.onClick();
                onClose();
              }}
              className={cn(
                "min-w-[80px] px-4 py-1 text-sm border-2",
                "border-t-white border-l-white border-r-[#808080] border-b-[#808080]",
                "hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]",
                "active:bg-[#b0b0b0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white",
                "transition-colors duration-100",
                button.primary && "font-bold"
              )}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
