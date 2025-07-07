import { cn } from '@/lib/utils';

interface ContainerProps {
  className?: string;
  children: React.ReactNode;
}

export function Container({ className, children }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-2 md:px-1 lg:px-2 max-w-12xl', className)}>
      {children}
    </div>
  );
}
