import { setData, getData } from './helper';

interface UserData {
  address: string;
  nonce: string;
  chainId: number;
}

interface UsernameData {
  username: string;
}

export const USER_EXPIRY_TIME = 24 * 60 * 60; // 24 hours in seconds

export const userRedis = {
  generateKey: (address: string) => `user:${address.toLowerCase()}`,
  generateUsernameKey: (address: string) => `user:${address.toLowerCase()}:username`,

  setUserData: async (data: UserData) => {
    const key = userRedis.generateKey(data.address);
    return await setData(key, data, USER_EXPIRY_TIME);
  },

  getUserData: async (address: string): Promise<UserData | null> => {
    const key = userRedis.generateKey(address);
    return await getData(key);
  },

  setUsername: async (address: string, username: string): Promise<boolean> => {
    const key = userRedis.generateUsernameKey(address);
    return await setData(key, { username });
  },

  getUsername: async (address: string): Promise<string | null> => {
    const key = userRedis.generateUsernameKey(address);
    const data = (await getData(key)) as UsernameData | null;
    return data ? data.username : null;
  },

  generateNonce: () => {
    // Generate a random nonce string
    return Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
  },
};
