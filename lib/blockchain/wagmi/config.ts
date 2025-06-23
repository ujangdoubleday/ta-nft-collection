import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Get the Alchemy API key from environment variable
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const alchemyRpcUrl = `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`;

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(alchemyRpcUrl),
  },
});
