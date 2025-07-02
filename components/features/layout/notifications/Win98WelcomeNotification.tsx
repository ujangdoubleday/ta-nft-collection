'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Win98WelcomeNotificationProps {
  onClose: () => void;
  position?: 'top' | 'bottom';
  className?: string;
}

export function Win98WelcomeNotification({
  onClose,
  position = 'bottom',
  className,
}: Win98WelcomeNotificationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
      className={`fixed ${position === 'top' ? 'top-4' : 'bottom-4'} right-4 z-50 max-w-md ${className}`}
    >
      <div className="bg-black border border-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="font-medium text-white">Welcome</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="p-4 bg-gradient-to-br from-gray-900 to-black">
          <p className="text-gray-300">
            Welcome to MyNFTs! Create, collect, and share digital art in our modern environment.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
