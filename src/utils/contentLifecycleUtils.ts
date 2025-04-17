
/**
 * Utility for managing content loading, caching, and refresh operations
 */

// Cache for storing content data
const contentCache: Record<string, {
  data: any;
  timestamp: number;
  expiresAt: number;
}> = {};

// Default cache time (5 minutes)
const DEFAULT_CACHE_TIME_MS = 5 * 60 * 1000;

/**
 * Get data from cache if valid, otherwise return null
 */
export const getFromCache = <T>(cacheKey: string): T | null => {
  const cacheEntry = contentCache[cacheKey];
  if (!cacheEntry) return null;
  
  const now = Date.now();
  if (now > cacheEntry.expiresAt) {
    // Cache expired
    delete contentCache[cacheKey];
    return null;
  }
  
  return cacheEntry.data as T;
};

/**
 * Store data in cache with expiration
 */
export const storeInCache = <T>(cacheKey: string, data: T, cacheDurationMs = DEFAULT_CACHE_TIME_MS) => {
  const now = Date.now();
  contentCache[cacheKey] = {
    data,
    timestamp: now,
    expiresAt: now + cacheDurationMs
  };
};

/**
 * Clear a specific cache entry
 */
export const clearCache = (cacheKey: string) => {
  delete contentCache[cacheKey];
};

/**
 * Clear all cache entries
 */
export const clearAllCache = () => {
  Object.keys(contentCache).forEach(key => {
    delete contentCache[key];
  });
};

/**
 * Create a debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Get cache key for content items based on topic area
 */
export const getContentCacheKey = (topicArea: string) => {
  return `content_${topicArea.toLowerCase().replace(/\s+/g, '_')}`;
};

/**
 * Get cache key for content detail based on content IDs
 */
export const getContentDetailCacheKey = (contentIds: string[]) => {
  return `content_detail_${contentIds.sort().join('_')}`;
};
