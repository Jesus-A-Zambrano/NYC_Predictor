import { createClient } from 'redis';
import { logger } from './logger.service';

type RedisClient = ReturnType<typeof createClient>;

let cacheClient: RedisClient;

export const setupCache = (client: RedisClient) => {
  cacheClient = client;

  cacheClient.on('error', (err) => logger.error('Redis Client Error', err));
  cacheClient.on('connect', () => logger.info('Redis client connected'));
  cacheClient.on('reconnecting', () => logger.warn('Redis client reconnecting'));
  cacheClient.on('ready', () => logger.info('Redis client ready'));
};

export const getCache = async (key: string): Promise<string | null> => {
  if (!cacheClient) {
    logger.warn('Cache client not initialized.');
    return null;
  }
  try {
    return await cacheClient.get(key);
  } catch (error) {
    logger.error(`Error getting cache key ${key}:`, error);
    return null;
  }
};

export const setCache = async (key: string, value: string, ttl?: number): Promise<void> => {
  if (!cacheClient) {
    logger.warn('Cache client not initialized.');
    return;
  }
  try {
    if (ttl) {
      await cacheClient.set(key, value, { EX: ttl });
    } else {
      await cacheClient.set(key, value);
    }
  } catch (error) {
    logger.error(`Error setting cache key ${key}:`, error);
  }
};

export const deleteCache = async (key: string): Promise<void> => {
    if (!cacheClient) {
        logger.warn('Cache client not initialized.');
        return;
    }
    try {
        await cacheClient.del(key);
    } catch (error) {
        logger.error(`Error deleting cache key ${key}:`, error);
    }
};
