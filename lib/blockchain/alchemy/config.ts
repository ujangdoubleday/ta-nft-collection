import { Alchemy, Network, AlchemySettings } from 'alchemy-sdk';

export const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

const settings: AlchemySettings = {
  apiKey: ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA,
  maxRetries: 10,
};

console.log(
  'Initializing Alchemy with API key:',
  ALCHEMY_API_KEY ? 'Key available' : 'No API key found',
);

export const alchemy = new Alchemy(settings);

// Initialize WebSocket connection when imported
alchemy.ws.on('connect', () => console.log('Alchemy WebSocket connected'));
alchemy.ws.on('error', (error) => console.error('Alchemy WebSocket error:', error));
alchemy.ws.on('disconnect', () => console.warn('Alchemy WebSocket disconnected'));

export const BASE_URL_ALCHEMY_API = `https://eth-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`;
export const BASE_URL_ALCHEMY_RPC = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
