// LocalCache is a big hashmap storing the url that has been explored 
// and the resource obtained
type CacheItem<T> = {
  value: T;        //change this to the json rendered from request
  expiry: number; // Timestamp indicating when the item should expire
};

class LocalCache<T> {
  private cache: Map<string, CacheItem<T>>;
  private maxSize: number;
  private timeToLive: number; // Time-to-live in milliseconds

  constructor(maxSize: number, timeToLive: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.timeToLive = timeToLive; // Default timeToLive (in milliseconds)
  }

  // Set an item in the cache with an optional timeToLive override
  set(key: string, value: T, timeToLiveOverride?: number): void {
    const now = Date.now();
    const expiry = now + (timeToLiveOverride || this.timeToLive);

    if (this.cache.size >= this.maxSize) {
      // Evict the oldest item (FIFO)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, { value, expiry });
  }

  // Get an item from the cache
  get(key: string): T | undefined {
    const cacheItem = this.cache.get(key);

    if (!cacheItem) return undefined;

    const now = Date.now();
    if (cacheItem.expiry < now) {
      // If the item has expired, delete it
      this.cache.delete(key);
      return undefined;
    }

    return cacheItem.value;
  }

  // Remove an item from the cache
  delete(key: string): void {
    this.cache.delete(key);
  }

  // Clear the entire cache
  clear(): void {
    this.cache.clear();
  }

  // Check if an item exists in the cache
  has(key: string): boolean {
    const cacheItem = this.cache.get(key);
    if (!cacheItem) return false;

    const now = Date.now();
    if (cacheItem.expiry < now) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Optionally, implement a method to clean expired items manually
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, cacheItem] of this.cache) {
      if (cacheItem.expiry < now) {
        this.cache.delete(key);
      }
    }
  }
}