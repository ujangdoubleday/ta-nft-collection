// Helper functions
export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString();
};

// Helper to generate Etherscan links
export const getEtherscanLink = (type: 'address' | 'tx', value: string): string => {
  return `https://sepolia.etherscan.io/${type}/${value}`;
};

// Helper to copy to clipboard
export const copyToClipboard = (text: string): void => {
  navigator.clipboard.writeText(text);
};
