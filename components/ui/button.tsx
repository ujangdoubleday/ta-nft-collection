import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-normal relative transition-none select-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default:
          "bg-[#c0c0c0] text-foreground border-[3px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] shadow-none hover:opacity-90 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white active:translate-y-[1px] active:translate-x-[1px]",
        destructive:
          "bg-[#c0c0c0] text-destructive border-[3px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] shadow-none hover:opacity-90 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white active:translate-y-[1px] active:translate-x-[1px]",
        outline:
          "bg-[#c0c0c0] text-foreground border-[3px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] shadow-none hover:opacity-90 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white active:translate-y-[1px] active:translate-x-[1px]",
        secondary:
          "bg-[#c0c0c0] text-foreground border-[3px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] shadow-none hover:opacity-90 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white active:translate-y-[1px] active:translate-x-[1px]",
        ghost:
          "bg-transparent border-none text-foreground hover:bg-muted shadow-none",
        link: "bg-transparent text-primary underline-offset-4 hover:underline border-none shadow-none",
      },
      size: {
        default: "h-9 px-3 py-2",
        sm: "h-8 px-2.5 py-1.5",
        lg: "h-10 px-4 py-2.5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
