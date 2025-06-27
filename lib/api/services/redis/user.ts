import { setData, getData } from './helper';

interface UserData {
  address: string;
  nonce: string;
  chainId: number;
}

export const USER_EXPIRY_TIME = 24 * 60 * 60; // 24 hours in seconds

export const userRedis = {
  generateKey: (address: string) => `user:${address.toLowerCase()}`,

  setUserData: async (data: UserData) => {
    const key = userRedis.generateKey(data.address);
    return await setData(key, data, USER_EXPIRY_TIME);
  },

  getUserData: async (address: string): Promise<UserData | null> => {
    const key = userRedis.generateKey(address);
    return await getData(key);
  },

  generateNonce: () => {
    // Generate a random nonce string
    return Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
  },
};
