/**
 * 本地缓存管理工具
 * 使用 localStorage 存储数据，支持过期时间和数据压缩
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // 过期时间（毫秒）
  version: string;
}

interface CacheStats {
  totalSize: number;
  itemCount: number;
  items: Array<{
    key: string;
    size: number;
    age: number;
    isExpired: boolean;
  }>;
}

// 缓存配置
const CACHE_CONFIG = {
  VERSION: '1.0.0',
  PREFIX: 'lof_monitor_',
  DEFAULT_EXPIRE_TIME: 5 * 60 * 1000, // 5分钟
  MAX_CACHE_SIZE: 5 * 1024 * 1024, // 5MB
};

/**
 * 获取缓存键名
 */
const getCacheKey = (key: string): string => {
  return `${CACHE_CONFIG.PREFIX}${key}`;
};

/**
 * 计算对象大小（字节）
 */
const getObjectSize = (obj: any): number => {
  try {
    return new Blob([JSON.stringify(obj)]).size;
  } catch {
    return 0;
  }
};

/**
 * 设置缓存
 */
export const setCache = <T>(
  key: string,
  data: T,
  expiresIn: number = CACHE_CONFIG.DEFAULT_EXPIRE_TIME
): boolean => {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresIn,
      version: CACHE_CONFIG.VERSION,
    };

    const cacheKey = getCacheKey(key);
    const serialized = JSON.stringify(cacheItem);

    // 检查缓存大小
    const size = getObjectSize(serialized);
    if (size > CACHE_CONFIG.MAX_CACHE_SIZE) {
      console.warn(`Cache item too large: ${key} (${size} bytes)`);
      return false;
    }

    localStorage.setItem(cacheKey, serialized);
    return true;
  } catch (error) {
    console.error('Failed to set cache:', error);
    // 如果 localStorage 满了，尝试清理过期缓存
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearExpiredCache();
      // 重试一次
      try {
        localStorage.setItem(getCacheKey(key), JSON.stringify({ data, timestamp: Date.now(), expiresIn, version: CACHE_CONFIG.VERSION }));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
};

/**
 * 获取缓存
 */
export const getCache = <T>(key: string): T | null => {
  try {
    const cacheKey = getCacheKey(key);
    const cached = localStorage.getItem(cacheKey);

    if (!cached) {
      return null;
    }

    const cacheItem: CacheItem<T> = JSON.parse(cached);

    // 检查版本
    if (cacheItem.version !== CACHE_CONFIG.VERSION) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    // 检查是否过期
    const now = Date.now();
    const age = now - cacheItem.timestamp;

    if (age > cacheItem.expiresIn) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return cacheItem.data;
  } catch (error) {
    console.error('Failed to get cache:', error);
    return null;
  }
};

/**
 * 检查缓存是否存在且未过期
 */
export const hasValidCache = (key: string): boolean => {
  return getCache(key) !== null;
};

/**
 * 删除指定缓存
 */
export const removeCache = (key: string): void => {
  try {
    localStorage.removeItem(getCacheKey(key));
  } catch (error) {
    console.error('Failed to remove cache:', error);
  }
};

/**
 * 清除所有应用缓存
 */
export const clearAllCache = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_CONFIG.PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear all cache:', error);
  }
};

/**
 * 清除过期缓存
 */
export const clearExpiredCache = (): number => {
  let clearedCount = 0;
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach((key) => {
      if (!key.startsWith(CACHE_CONFIG.PREFIX)) return;

      try {
        const cached = localStorage.getItem(key);
        if (!cached) return;

        const cacheItem: CacheItem<any> = JSON.parse(cached);
        const age = now - cacheItem.timestamp;

        // 删除过期或版本不匹配的缓存
        if (age > cacheItem.expiresIn || cacheItem.version !== CACHE_CONFIG.VERSION) {
          localStorage.removeItem(key);
          clearedCount++;
        }
      } catch {
        // 如果解析失败，删除该缓存
        localStorage.removeItem(key);
        clearedCount++;
      }
    });
  } catch (error) {
    console.error('Failed to clear expired cache:', error);
  }

  return clearedCount;
};

/**
 * 获取缓存统计信息
 */
export const getCacheStats = (): CacheStats => {
  const stats: CacheStats = {
    totalSize: 0,
    itemCount: 0,
    items: [],
  };

  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach((key) => {
      if (!key.startsWith(CACHE_CONFIG.PREFIX)) return;

      try {
        const cached = localStorage.getItem(key);
        if (!cached) return;

        const size = getObjectSize(cached);
        stats.totalSize += size;
        stats.itemCount++;

        const cacheItem: CacheItem<any> = JSON.parse(cached);
        const age = now - cacheItem.timestamp;
        const isExpired = age > cacheItem.expiresIn;

        stats.items.push({
          key: key.replace(CACHE_CONFIG.PREFIX, ''),
          size,
          age,
          isExpired,
        });
      } catch {
        // 忽略解析错误
      }
    });
  } catch (error) {
    console.error('Failed to get cache stats:', error);
  }

  return stats;
};

/**
 * 格式化字节大小
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * 格式化时间
 */
export const formatAge = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) return `${seconds}秒前`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分钟前`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;

  const days = Math.floor(hours / 24);
  return `${days}天前`;
};

// 缓存键常量
export const CACHE_KEYS = {
  LOF_INDEX_LIST: 'lof_index_list',
  LOF_STOCK_LIST: 'lof_stock_list',
  LOF_ALL_LIST: 'lof_all_list',
  USER_SETTINGS: 'user_settings',
  FAVORITES: 'favorites',
} as const;
