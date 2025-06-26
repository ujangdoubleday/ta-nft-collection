import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

export const ALCHEMY_RPC_URL = process.env.ALCHEMY_HTTP_URL || '';

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(ALCHEMY_RPC_URL),
});
