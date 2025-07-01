'use client';

import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Info, HelpCircle, XCircle, X } from 'lucide-react';

type AlertType = 'error' | 'warning' | 'info' | 'question';

interface ModernAlertProps {
  title?: string;
  message: string;
  type?: AlertType;
  onClose: () => void;
  buttons?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'destructive' | 'secondary';
  }[];
  isOpen?: boolean;
  className?: string;
}

export function ModernAlert({
  title,
  message,
  type = 'info',
  onClose,
  buttons = [{ label: 'OK', onClick: () => {}, variant: 'default' }],
  isOpen = true,
  className,
}: ModernAlertProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const getIconForType = (type: AlertType) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-6 w-6 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      case 'question':
        return <HelpCircle className="h-6 w-6 text-primary" />;
      case 'info':
      default:
        return <Info className="h-6 w-6 text-primary" />;
    }
  };

  const getDefaultTitle = (type: AlertType): string => {
    switch (type) {
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'question':
        return 'Question';
      case 'info':
      default:
        return 'Information';
    }
  };

  if (!isOpen) return null;

  // Portal to body to avoid z-index issues
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div
        className={cn(
          'bg-card border rounded-lg shadow-lg animate-scale-in max-w-md w-full mx-4',
          className,
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            {getIconForType(type)}
            <span className="font-semibold">{title || getDefaultTitle(type)}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-muted hover-effect focus-ring"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-4 py-3">
          <p className="text-card-foreground">{message}</p>
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t">
          {buttons.map((button, index) => (
            <button
              key={index}
              onClick={() => {
                button.onClick();
                onClose();
              }}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors focus-ring',
                button.variant === 'default' &&
                  'bg-primary text-primary-foreground hover:bg-primary/90',
                button.variant === 'outline' &&
                  'border border-input hover:bg-accent hover:text-accent-foreground',
                button.variant === 'destructive' &&
                  'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                button.variant === 'secondary' &&
                  'bg-secondary text-secondary-foreground hover:bg-secondary/80',
              )}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
