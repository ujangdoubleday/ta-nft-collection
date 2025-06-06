import { Win98Spinner } from '@/components/ui/organisms';
import { cn } from '@/lib/utils';

interface InlineLoadingProps {
  text?: string;
  className?: string;
  spinnerSize?: 'small' | 'medium' | 'large';
  direction?: 'row' | 'column';
}

export function InlineLoading({
  text,
  className,
  spinnerSize = 'small',
  direction = 'row',
}: InlineLoadingProps) {
  return (
    <div
      className={cn(
        'flex items-center',
        {
          'flex-row gap-2': direction === 'row',
          'flex-col gap-1': direction === 'column',
        },
        className,
      )}
    >
      <Win98Spinner size={spinnerSize} />
      {text && (
        <span className={cn('text-sm', { 'text-center': direction === 'column' })}>{text}</span>
      )}
    </div>
  );
}
