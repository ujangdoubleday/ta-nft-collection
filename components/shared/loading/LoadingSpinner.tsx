import { Win98Spinner } from '@/components/ui/organisms';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

export function LoadingSpinner({
  className,
  size = 'medium',
  text = 'Loading...',
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <Win98Spinner size={size} />
      {text && <p className="text-center mt-4">{text}</p>}
    </div>
  );
}
