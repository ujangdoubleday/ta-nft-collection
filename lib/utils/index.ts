import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an address with truncation
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Reset the loading screen so it will show on next app load
 * Can be used for debugging or if the user wants to see the loading animation again
 */
export function resetLoadingScreen(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('appHasLoadedBefore');
  }
}

// Re-export breadcrumbs utilities
export * from './breadcrumbs';
