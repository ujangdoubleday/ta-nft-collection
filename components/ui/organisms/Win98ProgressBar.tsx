import { cn } from "@/lib/utils";

interface Win98ProgressBarProps {
  progress: number; // 0 to 100
  className?: string;
  blocks?: number;
  animated?: boolean;
}

export function Win98ProgressBar({
  progress,
  className,
  blocks = 20,
  animated = false,
}: Win98ProgressBarProps) {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.max(0, Math.min(100, progress));

  // Calculate number of blocks to fill
  const filledBlocks = Math.ceil((normalizedProgress / 100) * blocks);

  return (
    <div
      className={cn(
        "w-full h-5 bg-[#c0c0c0] border-t-[#808080] border-l-[#808080] border-r-white border-b-white border-[1px] flex items-center px-1",
        className
      )}
    >
      {Array.from({ length: blocks }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-3 w-[10px] mx-[1px]",
            index < filledBlocks
              ? "bg-[#000080] " + (animated ? "win98-progress-block" : "")
              : "bg-[#c0c0c0]"
          )}
          style={animated ? { animationDelay: `${index * 0.1}s` } : undefined}
        />
      ))}
    </div>
  );
}
