export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text);
}

export function getEtherscanLink(type: 'tx' | 'address', hash: string): string {
  return `https://sepolia.etherscan.io/${type}/${hash}`;
}
