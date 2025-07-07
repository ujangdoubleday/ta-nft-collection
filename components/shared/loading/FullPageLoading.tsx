import { Container } from '@/components/features/layout/core/Container';
import { LoadingWindow } from './LoadingWindow';
import { cn } from '@/lib/utils';

interface FullPageLoadingProps {
  title?: string;
  text?: string;
  icon?: string;
  className?: string;
  spinnerSize?: 'small' | 'medium' | 'large';
}

export function FullPageLoading({
  title = 'Loading',
  text = 'Please wait...',
  icon = '/assets/icons/window/loading.png',
  className,
  spinnerSize = 'large',
}: FullPageLoadingProps) {
  return (
    <main className={cn('py-4', className)}>
      <Container>
        <LoadingWindow
          title={title}
          text={text}
          icon={icon}
          spinnerSize={spinnerSize}
          minHeight="min-h-[300px]"
        />
      </Container>
    </main>
  );
}
