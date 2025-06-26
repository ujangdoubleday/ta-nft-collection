import { Alchemy, Network } from 'alchemy-sdk';

export const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

const settings = {
  apiKey: ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA,
};

export const alchemy = new Alchemy(settings);

export const BASE_URL_ALCHEMY_API = `https://eth-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`;
