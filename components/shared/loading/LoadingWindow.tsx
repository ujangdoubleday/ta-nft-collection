import { Win98Window } from '@/components/ui/organisms';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';

interface LoadingWindowProps {
  title?: string;
  text?: string;
  icon?: string;
  className?: string;
  spinnerSize?: 'small' | 'medium' | 'large';
  minHeight?: string;
}

export function LoadingWindow({
  title = 'Loading',
  text = 'Loading...',
  icon = '/assets/icons/window/gallery.png',
  className,
  spinnerSize = 'medium',
  minHeight = 'min-h-[200px]',
}: LoadingWindowProps) {
  return (
    <Win98Window title={title} icon={icon} className={cn('max-w-12xl mx-auto', className)}>
      <div className={cn('flex flex-col items-center justify-center', minHeight)}>
        <LoadingSpinner size={spinnerSize} text={text} />
      </div>
    </Win98Window>
  );
}
