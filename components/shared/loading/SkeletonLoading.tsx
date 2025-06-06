import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

export function Skeleton({
  className,
  width = 'w-full',
  height = 'h-4',
  rounded = true,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-300 dark:bg-gray-700',
        width,
        height,
        rounded ? 'rounded' : '',
        className,
      )}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 && lines > 1 ? 'w-4/6' : 'w-full'} />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  hasImage?: boolean;
  hasFooter?: boolean;
  className?: string;
}

export function SkeletonCard({ hasImage = true, hasFooter = true, className }: SkeletonCardProps) {
  return (
    <div className={cn('border border-gray-300 p-3', className)}>
      {hasImage && <Skeleton height="h-32" className="mb-3" />}
      <Skeleton height="h-5" className="mb-2" />
      <SkeletonText lines={2} className="mb-3" />

      {hasFooter && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-300">
          <Skeleton width="w-16" height="h-4" />
          <Skeleton width="w-12" height="h-4" />
        </div>
      )}
    </div>
  );
}
