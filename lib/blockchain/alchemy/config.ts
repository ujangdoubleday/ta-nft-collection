import { Alchemy, Network, AlchemySettings } from 'alchemy-sdk';

export const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

const settings: AlchemySettings = {
  apiKey: ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA,
  maxRetries: 10,
};

export const alchemy = new Alchemy(settings);

let wsConnected = false;

export const connectWebSocket = () => {
  if (wsConnected) return;

  wsConnected = true;
  alchemy.ws.on('connect', () => console.log('websocket connected'));
  alchemy.ws.on('error', (error) => console.error('websocket error:', error));
  alchemy.ws.on('disconnect', () => {
    console.warn('websocket disconnected');
    wsConnected = false;
  });
};

export const disconnectWebSocket = () => {
  if (!wsConnected) return;

  alchemy.ws.removeAllListeners();
  wsConnected = false;
  console.log('websocket disconnected manually');
};

export const isWebSocketConnected = () => wsConnected;

export const BASE_URL_ALCHEMY_API = `https://eth-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`;
export const BASE_URL_ALCHEMY_RPC = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
