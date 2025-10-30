import { Redis } from '@upstash/redis';

// Initialize Redis client only if credentials are provided
let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
  });
}

/**
 * Get cached data or fetch and cache it
 * Falls back to direct fetcher call if Redis is not configured
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // If Redis is not configured, just fetch directly
  if (!redis) {
    return fetcher();
  }

  try {
    // Try to get from cache
    const cached = await redis.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetcher();
    
    // Cache the result
    await redis.setex(key, ttl, data);
    
    return data;
  } catch (error) {
    console.error('Cache error:', error);
    // Fall back to fetcher on cache errors
    return fetcher();
  }
}

/**
 * Invalidate cache entries matching a pattern
 */
export async function invalidateCache(pattern: string): Promise<void> {
  if (!redis) {
    return;
  }

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

/**
 * Set a value in cache
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttl: number = 3600
): Promise<void> {
  if (!redis) {
    return;
  }

  try {
    await redis.setex(key, ttl, value);
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * Delete a specific cache key
 */
export async function deleteCache(key: string): Promise<void> {
  if (!redis) {
    return;
  }

  try {
    await redis.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

/**
 * Check if Redis is available
 */
export function isCacheAvailable(): boolean {
  return redis !== null;
}
