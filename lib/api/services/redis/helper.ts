import { redis } from './config';

export async function setData(key: string, value: any, expireInSeconds?: number) {
  try {
    if (expireInSeconds) {
      await redis.set(key, JSON.stringify(value), { ex: expireInSeconds });
    } else {
      await redis.set(key, JSON.stringify(value));
    }
    return true;
  } catch (error) {
    console.error('Error setting data to Redis:', error);
    return false;
  }
}

export async function getData(key: string) {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data as string) : null;
  } catch (error) {
    console.error('Error getting data from Redis:', error);
    return null;
  }
}

export async function deleteData(key: string) {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Error deleting data from Redis:', error);
    return false;
  }
}
