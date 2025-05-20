import { cn } from "@/lib/utils";

interface Win98SpinnerProps {
  className?: string;
}

export function Win98Spinner({ className }: Win98SpinnerProps) {
  return (
    <div
      className={cn("relative flex items-center gap-[2px] w-6 h-4", className)}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            "inline-block w-1.5 h-1.5 rounded-full bg-[#000080] opacity-60",
            `win98-dot-spinner-${i}`
          )}
        />
      ))}
    </div>
  );
}
