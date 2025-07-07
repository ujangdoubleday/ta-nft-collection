export function isAdminWallet(walletAddress: string): boolean {
  const adminAddresses = process.env.ADMIN_WALLET_ADDRESSES?.split(',') || [];

  // Normalize addresses to lowercase untuk comparison
  const normalizedAddress = walletAddress.toLowerCase();
  const normalizedAdminAddresses = adminAddresses.map((addr) => addr.toLowerCase().trim());

  return normalizedAdminAddresses.includes(normalizedAddress);
}

export function getUserRole(walletAddress: string): 'admin' | 'user' {
  return isAdminWallet(walletAddress) ? 'admin' : 'user';
}
