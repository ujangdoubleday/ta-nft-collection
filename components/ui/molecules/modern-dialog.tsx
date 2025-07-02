import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ModernDialog = DialogPrimitive.Root;
const ModernDialogTrigger = DialogPrimitive.Trigger;
const ModernDialogPortal = DialogPrimitive.Portal;
const ModernDialogClose = DialogPrimitive.Close;

const ModernDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
ModernDialogOverlay.displayName = 'ModernDialogOverlay';

const ModernDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    title?: string;
  }
>(({ className, children, title = 'Dialog', ...props }, ref) => (
  <ModernDialogPortal>
    <ModernDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-[201] w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-zinc-900 p-6 text-white border border-zinc-800 shadow-xl rounded-xl',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-4">
        <DialogPrimitive.Title className="text-xl font-bold text-white">
          {title}
        </DialogPrimitive.Title>
        <DialogPrimitive.Close className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors">
          <X className="h-4 w-4 text-zinc-400" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>
      {children}
    </DialogPrimitive.Content>
  </ModernDialogPortal>
));
ModernDialogContent.displayName = 'ModernDialogContent';

const ModernDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-white', className)} {...props} />
);
ModernDialogHeader.displayName = 'ModernDialogHeader';

const ModernDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6', className)}
    {...props}
  />
);
ModernDialogFooter.displayName = 'ModernDialogFooter';

const ModernDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-xl font-bold text-white', className)}
    {...props}
  />
));
ModernDialogTitle.displayName = 'ModernDialogTitle';

const ModernDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-zinc-400', className)}
    {...props}
  />
));
ModernDialogDescription.displayName = 'ModernDialogDescription';

export {
  ModernDialog,
  ModernDialogPortal,
  ModernDialogOverlay,
  ModernDialogClose,
  ModernDialogTrigger,
  ModernDialogContent,
  ModernDialogHeader,
  ModernDialogFooter,
  ModernDialogTitle,
  ModernDialogDescription,
};
