import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

// Export breadcrumbs utility
export * from './breadcrumbs';

export * from './blurhash';
