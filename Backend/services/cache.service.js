// Simple in-memory cache for frequently accessed data
class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time to live
  }

  set(key, value, ttlMs = 300000) { // Default 5 minutes
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + ttlMs);
  }

  get(key) {
    const expiry = this.ttl.get(key);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  // Generate cache key for product queries
  generateProductCacheKey(filters, sortBy, sortOrder, page, limit) {
    return `products:${JSON.stringify({
      ...filters,
      sortBy,
      sortOrder,
      page,
      limit
    })}`;
  }
}

export const cacheService = new CacheService();