import { getPayload } from 'payload';
import config from '@/src/payload/payload.config';
import { getCached, CacheKeys, CacheTTL, invalidateCache } from '@/src/lib/cache';

/**
 * Get user's saved topics with pagination and filtering
 */
export async function getUserSavedTopics(
  userId: string,
  options: {
    limit?: number;
    page?: number;
    toolSlug?: string;
  } = {}
) {
  const payload = await getPayload({ config });
  
  const where: any = {
    user: { equals: userId },
  };

  // If filtering by tool, resolve tool ID first
  if (options.toolSlug) {
    const tool = await getToolBySlug(options.toolSlug);
    if (tool) {
      where.tool = { equals: tool.id };
    }
  }

  return payload.find({
    collection: 'saved-topics',
    where,
    limit: options.limit || 20,
    page: options.page || 1,
    sort: '-createdAt',
    depth: 2, // Include tool and category relations
  });
}

/**
 * Get a single saved topic by ID with ownership check
 */
export async function getSavedTopicById(
  topicId: string,
  userId: string
) {
  const payload = await getPayload({ config });
  
  const result = await payload.find({
    collection: 'saved-topics',
    where: {
      and: [
        { id: { equals: topicId } },
        { user: { equals: userId } },
      ],
    },
    limit: 1,
    depth: 2,
  });

  return result.docs[0] || null;
}

/**
 * Delete a saved topic with ownership check
 */
export async function deleteSavedTopic(
  topicId: string,
  userId: string
): Promise<boolean> {
  const payload = await getPayload({ config });
  
  // First verify ownership
  const topic = await getSavedTopicById(topicId, userId);
  if (!topic) {
    return false;
  }

  await payload.delete({
    collection: 'saved-topics',
    id: topicId,
  });

  // Invalidate user's topic cache
  await invalidateCache(`user:${userId}:topics*`);

  return true;
}

/**
 * Get tool module by slug with caching
 */
export async function getToolBySlug(slug: string) {
  const cacheKey = CacheKeys.toolModule(slug);
  
  return getCached(
    cacheKey,
    async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'tool-modules',
        where: { slug: { equals: slug } },
        limit: 1,
      });
      return result.docs[0] || null;
    },
    CacheTTL.LONG
  );
}

/**
 * Get all enabled tool modules with caching
 */
export async function getEnabledTools() {
  const cacheKey = CacheKeys.toolModules();
  
  return getCached(
    cacheKey,
    async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'tool-modules',
        where: { enabled: { equals: true } },
        sort: 'name',
      });
      return result.docs;
    },
    CacheTTL.LONG
  );
}

/**
 * Get all categories with caching
 */
export async function getCategories() {
  const cacheKey = CacheKeys.categories();
  
  return getCached(
    cacheKey,
    async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'categories',
        sort: 'order',
        depth: 1, // Include parent category
      });
      return result.docs;
    },
    CacheTTL.LONG
  );
}

/**
 * Get category by slug with caching
 */
export async function getCategoryBySlug(slug: string) {
  const cacheKey = CacheKeys.category(slug);
  
  return getCached(
    cacheKey,
    async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'categories',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 1,
      });
      return result.docs[0] || null;
    },
    CacheTTL.LONG
  );
}

/**
 * Update user usage statistics
 */
export async function updateUserUsageStats(
  userId: string,
  incrementGenerations: boolean = true
) {
  const payload = await getPayload({ config });
  
  const user = await payload.findByID({
    collection: 'users',
    id: userId,
  });

  const updates: any = {
    'usageStats.lastGenerationAt': new Date().toISOString(),
  };

  if (incrementGenerations) {
    updates['usageStats.totalGenerations'] = 
      (user.usageStats?.totalGenerations || 0) + 1;
  }

  await payload.update({
    collection: 'users',
    id: userId,
    data: updates,
  });

  // Invalidate user stats cache
  await invalidateCache(CacheKeys.userStats(userId));
}

/**
 * Get user statistics with caching
 */
export async function getUserStats(userId: string) {
  const cacheKey = CacheKeys.userStats(userId);
  
  return getCached(
    cacheKey,
    async () => {
      const payload = await getPayload({ config });
      const user = await payload.findByID({
        collection: 'users',
        id: userId,
      });
      
      return {
        totalGenerations: user.usageStats?.totalGenerations || 0,
        lastGenerationAt: user.usageStats?.lastGenerationAt || null,
      };
    },
    CacheTTL.SHORT
  );
}

/**
 * Check if a topic is already saved by the user
 */
export async function isTopicSaved(
  userId: string,
  toolId: string,
  title: string
): Promise<boolean> {
  const payload = await getPayload({ config });
  
  const result = await payload.find({
    collection: 'saved-topics',
    where: {
      and: [
        { user: { equals: userId } },
        { tool: { equals: toolId } },
        { title: { equals: title } },
      ],
    },
    limit: 1,
  });

  return result.docs.length > 0;
}

/**
 * Get paginated saved topics count for a user
 */
export async function getUserSavedTopicsCount(
  userId: string,
  toolSlug?: string
): Promise<number> {
  const payload = await getPayload({ config });
  
  const where: any = {
    user: { equals: userId },
  };

  if (toolSlug) {
    const tool = await getToolBySlug(toolSlug);
    if (tool) {
      where.tool = { equals: tool.id };
    }
  }

  const result = await payload.find({
    collection: 'saved-topics',
    where,
    limit: 0, // Just get the count
  });

  return result.totalDocs;
}
