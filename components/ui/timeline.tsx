'use client';

import React from 'react';
import { cn } from '@/lib/utils/helpers';
import Spinner from './spinner';

// Timeline container component
interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start w-full justify-between relative',
          'overflow-visible flex-wrap md:flex-nowrap',
          'pt-3 bg-transparent', // Add padding at the top for the line
          className,
        )}
        {...props}
      >
        <div className="absolute top-0 left-[1.5px] right-[1.5px] h-[2px] bg-zinc-500" />
        {children}
      </div>
    );
  },
);
Timeline.displayName = 'Timeline';

// Timeline item component
interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  isLoading?: boolean;
  isActive?: boolean;
  isCompleted?: boolean;
  statusIcon?: React.ReactNode; // For custom status icons
}

const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  (
    {
      label,
      isLoading = false,
      isActive = false,
      isCompleted = false,
      statusIcon,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center relative',
          'flex-1 min-w-0 mb-4 md:mb-0 px-2',
          className,
        )}
        {...props}
      >
        {/* Dot indicator */}
        <div
          className={cn(
            'w-3 h-3 rounded-full border bg-white border-white z-10 mb-2',
            isActive ? 'bg-white' : 'bg-white',
            isCompleted ? 'bg-white' : 'bg-transparent',
          )}
        >
          {/* {isLoading && <Spinner size="sm" color="white" />} */}
        </div>

        {/* Label with status icon */}
        <div className="flex items-center justify-center w-full">
          <span
            className={cn(
              'text-xs sm:text-sm text-center',
              'break-words px-1',
              isActive ? 'text-white font-medium' : 'text-white/70',
            )}
          >
            {label}
          </span>

          {/* Status icon (spinner or completed) */}
          {statusIcon && <span className="ml-1.5">{statusIcon}</span>}
        </div>
      </div>
    );
  },
);
TimelineItem.displayName = 'TimelineItem';

export { Timeline, TimelineItem };
