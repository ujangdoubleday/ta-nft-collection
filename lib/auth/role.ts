import { serverClient } from '@/lib/api/trpc/server-client';

/**
 * Checks if a wallet address is the admin (factory owner)
 * @param walletAddress The wallet address to check
 * @returns boolean indicating if the address is the admin
 */
export async function isAdminWallet(walletAddress: string): Promise<boolean> {
  try {
    // Get the factory owner from the contract
    const owner = await serverClient.factoryConfig.getFactoryOwner();

    if (!owner) return false;

    // Normalize addresses to lowercase for comparison
    const normalizedAddress = walletAddress.toLowerCase();
    const normalizedAdminAddress = owner.toLowerCase().trim();

    return normalizedAddress === normalizedAdminAddress;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Gets the role of a wallet address
 * @param walletAddress The wallet address to check
 * @returns 'admin' or 'user' based on the address
 */
export async function getUserRole(walletAddress: string): Promise<'admin' | 'user'> {
  const isAdmin = await isAdminWallet(walletAddress);
  return isAdmin ? 'admin' : 'user';
}
