export {
  getCached,
  invalidateCache,
  setCache,
  deleteCache,
  isCacheAvailable,
} from './redis';

// Cache key builders for consistency
export const CacheKeys = {
  toolModules: () => 'tool-modules:all',
  toolModule: (slug: string) => `tool-module:${slug}`,
  categories: () => 'categories:all',
  category: (slug: string) => `category:${slug}`,
  userSavedTopics: (userId: string, toolSlug?: string) =>
    toolSlug ? `user:${userId}:topics:${toolSlug}` : `user:${userId}:topics`,
  userStats: (userId: string) => `user:${userId}:stats`,
} as const;

// Cache TTL constants (in seconds)
export const CacheTTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;
