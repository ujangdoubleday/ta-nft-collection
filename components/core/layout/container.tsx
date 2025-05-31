import { cn } from "@/lib/utils";

interface ContainerProps {
  className?: string;
  children: React.ReactNode;
}

export function Container({ className, children }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-2.5 md:px-5 lg:px-10 max-w-7xl",
        className
      )}
    >
      {children}
    </div>
  );
}
