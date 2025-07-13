import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Export breadcrumbs utility
export * from './breadcrumbs';

// Export helpers for URL handling
export * from './url';

// Export revalidation utility
export * from './revalidation';
