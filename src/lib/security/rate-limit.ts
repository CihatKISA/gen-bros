import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * In-memory rate limit store (fallback when Redis is not available)
 */
class InMemoryRateLimiter {
  private store: Map<string, { count: number; expiresAt: number }> = new Map();

  async limit(
    identifier: string,
    limit: number,
    window: number,
  ): Promise<{
    success: boolean;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    const key = `${identifier}:${Math.floor(now / (window * 1000))}`;

    // Clean up expired entries
    this.cleanup();

    const existing = this.store.get(key);

    if (existing && existing.expiresAt > now) {
      existing.count++;
      const success = existing.count <= limit;
      const remaining = Math.max(0, limit - existing.count);
      return {
        success,
        remaining,
        reset: existing.expiresAt,
      };
    }

    // Create new entry
    const expiresAt = now + window * 1000;
    this.store.set(key, {
      count: 1,
      expiresAt,
    });

    return {
      success: true,
      remaining: limit - 1,
      reset: expiresAt,
    };
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
let useInMemory = false;

if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_TOKEN,
    });
    console.log("Redis rate limiter initialized");
  } catch (error) {
    console.warn(
      "Failed to initialize Redis, using in-memory fallback:",
      error,
    );
    useInMemory = true;
  }
} else {
  console.log("Redis credentials not found, using in-memory rate limiter");
  useInMemory = true;
}

const inMemoryLimiter = new InMemoryRateLimiter();

/**
 * Global rate limiter for all API routes
 * Allows 100 requests per hour per IP
 */
export const apiRateLimiter =
  redis && !useInMemory
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "1 h"),
        analytics: true,
        prefix: "ratelimit:api",
      })
    : null;

/**
 * Strict rate limiter for authentication endpoints
 * Allows 5 requests per 15 minutes per IP
 */
export const authRateLimiter =
  redis && !useInMemory
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        analytics: true,
        prefix: "ratelimit:auth",
      })
    : null;

/**
 * Check rate limit using either Redis or in-memory fallback
 */
export async function checkApiRateLimit(identifier: string): Promise<{
  success: boolean;
  remaining: number;
  reset: Date;
}> {
  try {
    if (apiRateLimiter) {
      const result = await apiRateLimiter.limit(identifier);
      return {
        success: result.success,
        remaining: result.remaining,
        reset: new Date(result.reset),
      };
    }

    // Fallback to in-memory limiter
    const result = await inMemoryLimiter.limit(identifier, 100, 3600);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: new Date(result.reset),
    };
  } catch (error) {
    console.error("Rate limit check error:", error);
    // On error, allow the request
    return {
      success: true,
      remaining: 100,
      reset: new Date(Date.now() + 3600000),
    };
  }
}

/**
 * Check auth rate limit using either Redis or in-memory fallback
 */
export async function checkAuthRateLimit(identifier: string): Promise<{
  success: boolean;
  remaining: number;
  reset: Date;
}> {
  try {
    if (authRateLimiter) {
      const result = await authRateLimiter.limit(identifier);
      return {
        success: result.success,
        remaining: result.remaining,
        reset: new Date(result.reset),
      };
    }

    // Fallback to in-memory limiter (5 requests per 15 minutes)
    const result = await inMemoryLimiter.limit(identifier, 5, 900);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: new Date(result.reset),
    };
  } catch (error) {
    console.error("Auth rate limit check error:", error);
    // On error, allow the request
    return {
      success: true,
      remaining: 5,
      reset: new Date(Date.now() + 900000),
    };
  }
}

/**
 * Get client identifier from request (IP address or user ID)
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Try to get IP from various headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  const ip = forwarded?.split(",")[0] || realIp || cfConnectingIp || "unknown";
  return `ip:${ip}`;
}
