"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

interface _Win98DialogProps extends DialogPrimitive.DialogProps {
  children: React.ReactNode;
}

const Win98Dialog = DialogPrimitive.Root;

const Win98DialogTrigger = DialogPrimitive.Trigger;

const Win98DialogPortal = DialogPrimitive.Portal;

const Win98DialogClose = DialogPrimitive.Close;

const Win98DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[200] bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
Win98DialogOverlay.displayName = "Win98DialogOverlay";

interface Win98DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  title?: string;
  icon?: string;
  showClose?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const Win98DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  Win98DialogContentProps
>(
  (
    {
      className,
      children,
      title = "Dialog",
      icon,
      showClose = true,
      onMinimize,
      onMaximize,
      ...props
    },
    ref
  ) => (
    <Win98DialogPortal>
      <Win98DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-[201] w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-[#c0c0c0] p-0 border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          className
        )}
        {...props}
      >
        {/* Screen reader accessible title */}
        <DialogPrimitive.Title className="sr-only">
          {title}
        </DialogPrimitive.Title>

        {/* Visual title bar */}
        <div className="win98-bar h-6 flex items-center justify-between px-1">
          <div className="flex items-center gap-1">
            {icon && <img src={icon} alt="" className="w-4 h-4" />}
            <span className="text-white text-xs font-bold truncate">
              {title}
            </span>
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
            {showClose && (
              <Win98DialogClose className="w-4 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] flex items-center justify-center">
                <span className="text-black text-xs">×</span>
                <span className="sr-only">Close</span>
              </Win98DialogClose>
            )}
          </div>
        </div>

        {/* Content with minimal padding */}
        <div className="p-2">{children}</div>
      </DialogPrimitive.Content>
    </Win98DialogPortal>
  )
);
Win98DialogContent.displayName = "Win98DialogContent";

const Win98DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-2 text-black", className)} {...props} />
);
Win98DialogHeader.displayName = "Win98DialogHeader";

const Win98DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-2 flex justify-end gap-2", className)} {...props} />
);
Win98DialogFooter.displayName = "Win98DialogFooter";

const Win98DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-sm font-bold text-black", className)}
    {...props}
  />
));
Win98DialogTitle.displayName = "Win98DialogTitle";

const Win98DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-xs text-black", className)} {...props} />
));
Win98DialogDescription.displayName = "Win98DialogDescription";

export {
  Win98Dialog,
  Win98DialogTrigger,
  Win98DialogContent,
  Win98DialogHeader,
  Win98DialogFooter,
  Win98DialogTitle,
  Win98DialogDescription,
  Win98DialogClose,
};
