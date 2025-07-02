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

/**
 * Shortens an Ethereum address for display
 * @param address The Ethereum address to shorten
 * @param charsToShow Number of characters to show at start and end
 * @returns Shortened address string
 */
export function shortenAddress(address: string, charsToShow: number = 4): string {
  if (!address) return '';
  if (address.length <= charsToShow * 2 + 3) return address;

  return `${address.substring(0, charsToShow)}...${address.substring(address.length - charsToShow)}`;
}
