export function isAdminWallet(walletAddress: string): boolean {
  const adminAddress =
    process.env.ADMIN_WALLET_ADDRESS || '0x19191984DF6Ce7749B786b9a2BB869B4b735eC31';

  // Normalize addresses to lowercase for comparison
  const normalizedAddress = walletAddress.toLowerCase();
  const normalizedAdminAddress = adminAddress.toLowerCase().trim();

  return normalizedAddress === normalizedAdminAddress;
}

export function getUserRole(walletAddress: string): 'admin' | 'user' {
  return isAdminWallet(walletAddress) ? 'admin' : 'user';
}
