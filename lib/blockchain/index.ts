export const NFT_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;
export const IPFS_GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL || 'cyan-dead-reptile-256.mypinata.cloud';

// Export blockchain utilities
export * from './utils';

// Export wagmi configuration and provider
export * from './wagmi';
