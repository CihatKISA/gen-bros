import { Redis } from '@upstash/redis';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  requestsPerHour: number;
  requestsPerDay: number;
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * In-memory rate limit store (fallback when Redis is not available)
 */
class InMemoryRateLimiter {
  private store: Map<string, { count: number; expiresAt: number }> = new Map();

  async increment(key: string, ttl: number): Promise<number> {
    const now = Date.now();
    const existing = this.store.get(key);

    // Clean up expired entries
    this.cleanup();

    if (existing && existing.expiresAt > now) {
      existing.count++;
      return existing.count;
    }

    // Create new entry
    this.store.set(key, {
      count: 1,
      expiresAt: now + ttl * 1000,
    });

    return 1;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (value.expiresAt <= now) {
        this.store.delete(key);
      }
    }
  }
}

// Initialize Redis client if credentials are available
let redis: Redis | null = null;
const inMemoryLimiter = new InMemoryRateLimiter();

if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_TOKEN,
    });
    console.log('Redis rate limiter initialized');
  } catch (error) {
    console.warn('Failed to initialize Redis, using in-memory fallback:', error);
  }
} else {
  console.log('Redis credentials not found, using in-memory rate limiter');
}

/**
 * Generate rate limit key for hour-based tracking
 */
function getHourKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}`;
}

/**
 * Generate rate limit key for day-based tracking
 */
function getDayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

/**
 * Check if a user has exceeded their rate limit
 * @param userId - User identifier
 * @param toolId - Tool identifier
 * @param config - Rate limit configuration
 * @returns Rate limit check result
 */
export async function checkRateLimit(
  userId: string,
  toolId: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const hourKey = `ratelimit:${toolId}:${userId}:hour:${getHourKey()}`;
  const dayKey = `ratelimit:${toolId}:${userId}:day:${getDayKey()}`;

  try {
    let hourCount: number;
    let dayCount: number;

    if (redis) {
      // Use Redis for distributed rate limiting
      const [hourResult, dayResult] = await Promise.all([
        redis.incr(hourKey),
        redis.incr(dayKey),
      ]);

      hourCount = hourResult;
      dayCount = dayResult;

      // Set expiration on first request
      if (hourCount === 1) {
        await redis.expire(hourKey, 3600); // 1 hour
      }
      if (dayCount === 1) {
        await redis.expire(dayKey, 86400); // 24 hours
      }
    } else {
      // Use in-memory fallback
      hourCount = await inMemoryLimiter.increment(hourKey, 3600);
      dayCount = await inMemoryLimiter.increment(dayKey, 86400);
    }

    const hourAllowed = hourCount <= config.requestsPerHour;
    const dayAllowed = dayCount <= config.requestsPerDay;
    const allowed = hourAllowed && dayAllowed;

    const remaining = Math.max(
      0,
      Math.min(
        config.requestsPerHour - hourCount,
        config.requestsPerDay - dayCount
      )
    );

    // Calculate reset time based on which limit was hit
    const resetAt = !hourAllowed
      ? new Date(Date.now() + 3600000) // 1 hour from now
      : new Date(Date.now() + 86400000); // 24 hours from now

    return {
      allowed,
      remaining,
      resetAt,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow the request but log the issue
    return {
      allowed: true,
      remaining: config.requestsPerHour,
      resetAt: new Date(Date.now() + 3600000),
    };
  }
}

/**
 * Reset rate limit for a user (admin function)
 * @param userId - User identifier
 * @param toolId - Tool identifier
 */
export async function resetRateLimit(
  userId: string,
  toolId: string
): Promise<void> {
  if (!redis) {
    console.warn('Cannot reset rate limit: Redis not available');
    return;
  }

  const hourKey = `ratelimit:${toolId}:${userId}:hour:${getHourKey()}`;
  const dayKey = `ratelimit:${toolId}:${userId}:day:${getDayKey()}`;

  try {
    await Promise.all([redis.del(hourKey), redis.del(dayKey)]);
  } catch (error) {
    console.error('Failed to reset rate limit:', error);
  }
}
