'use client';

import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

interface ModernNotificationProps {
  type: NotificationType;
  title: string;
  message: string;
  onClose: () => void;
  position?: 'top' | 'bottom';
  className?: string;
}

export function ModernNotification({
  type,
  title,
  message,
  onClose,
  position = 'bottom',
  className,
}: ModernNotificationProps) {
  // Calculate position classes based on position prop
  const positionClasses = position === 'top' ? 'top-16 right-4' : 'bottom-20 right-4';

  // Monochromatic style - using white icons
  const typeIcons = {
    success: <CheckCircle className="w-5 h-5 text-white" />,
    error: <AlertCircle className="w-5 h-5 text-white" />,
    info: <Info className="w-5 h-5 text-white" />,
  };

  return (
    <div
      className={`fixed ${positionClasses} bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-lg w-72 z-50 animate-fade-in md:w-80 ${className}`}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          {typeIcons[type]}
          <span className="text-white text-sm font-bold ml-2">{title}</span>
        </div>
        <button className="text-zinc-400 hover:text-white transition-colors" onClick={onClose}>
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-zinc-300 text-sm mb-3">{message}</p>
      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-white animate-shrink" style={{ width: '100%' }}></div>
      </div>
    </div>
  );
}

export function ModernSuccessNotification({
  message,
  onClose,
  position,
  className,
}: Omit<ModernNotificationProps, 'type' | 'title'>) {
  return (
    <ModernNotification
      type="success"
      title="Success"
      message={message}
      onClose={onClose}
      position={position}
      className={className}
    />
  );
}

export function ModernErrorNotification({
  message,
  onClose,
  position,
  className,
}: Omit<ModernNotificationProps, 'type' | 'title'>) {
  return (
    <ModernNotification
      type="error"
      title="Error"
      message={message}
      onClose={onClose}
      position={position}
      className={className}
    />
  );
}

export function ModernInfoNotification({
  message,
  onClose,
  position,
  className,
}: Omit<ModernNotificationProps, 'type' | 'title'>) {
  return (
    <ModernNotification
      type="info"
      title="Information"
      message={message}
      onClose={onClose}
      position={position}
      className={className}
    />
  );
}
