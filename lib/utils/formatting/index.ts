/**
 * Format an address with truncation
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Formats a date to a string in the format YYYY-MM-DD
 * @param date The date to format
 * @returns The formatted date string
 */
export function formatDateToString(date: Date): string {
  return date.toISOString().split('T')[0];
}
