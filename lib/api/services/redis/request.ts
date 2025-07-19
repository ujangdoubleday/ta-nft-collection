import { getData, setData } from './helper';

// Request expiry time in seconds (30 days)
const REQUEST_EXPIRY_TIME = 30 * 24 * 60 * 60;

// Request data interface
interface RequestData {
  email: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export const requestRedis = {
  // Generate Redis key for request
  generateKey: (address: string) => `request:${address.toLowerCase()}`,

  // Set request data
  setRequestData: async (data: RequestData): Promise<boolean> => {
    const key = requestRedis.generateKey(data.address);
    return await setData(key, data, REQUEST_EXPIRY_TIME);
  },

  // Get request data
  getRequestData: async (address: string): Promise<RequestData | null> => {
    const key = requestRedis.generateKey(address);
    return await getData(key);
  },

  // Check if request exists
  checkRequestExists: async (address: string): Promise<boolean> => {
    const data = await requestRedis.getRequestData(address);
    return !!data;
  },
};
