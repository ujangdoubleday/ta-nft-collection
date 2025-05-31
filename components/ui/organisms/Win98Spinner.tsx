import { cn } from '@/lib/utils';

interface Win98SpinnerProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export function Win98Spinner({ className, size = 'medium' }: Win98SpinnerProps) {
  const sizeClasses = {
    small: 'w-5 h-3',
    medium: 'w-6 h-4',
    large: 'w-10 h-6',
  };

  const dotSizes = {
    small: 'w-1 h-1',
    medium: 'w-1.5 h-1.5',
    large: 'w-2 h-2',
  };

  return (
    <div className={cn('relative flex items-center gap-[2px]', sizeClasses[size], className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            'inline-block rounded-full bg-[#000080] opacity-60',
            dotSizes[size],
            `win98-dot-spinner-${i}`,
          )}
        />
      ))}
    </div>
  );
}
