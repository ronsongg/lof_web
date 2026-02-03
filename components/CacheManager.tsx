import React, { useState, useEffect } from 'react';
import { getCacheStats, clearAllCache, clearExpiredCache, formatBytes, formatAge } from '../utils/cache';

const CacheManager: React.FC = () => {
  const [stats, setStats] = useState({
    totalSize: 0,
    itemCount: 0,
    items: [] as Array<{ key: string; size: number; age: number; isExpired: boolean }>
  });
  const [showDetails, setShowDetails] = useState(false);

  const loadStats = () => {
    const cacheStats = getCacheStats();
    setStats(cacheStats);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleClearAll = () => {
    if (confirm('确定要清空所有缓存吗？这将删除所有本地保存的数据。')) {
      clearAllCache();
      loadStats();
    }
  };

  const handleClearExpired = () => {
    const cleared = clearExpiredCache();
    alert(`已清理 ${cleared} 个过期缓存项`);
    loadStats();
  };

  return (
    <div className="space-y-4">
      {/* 缓存统计卡片 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">缓存统计</h3>
          <button
            onClick={loadStats}
            className="text-xs text-primary hover:text-primary-dark transition-colors"
          >
            刷新
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400">缓存项数</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stats.itemCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400">总大小</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{formatBytes(stats.totalSize)}</span>
          </div>
        </div>

        {/* 过期提示 */}
        {stats.items.filter(item => item.isExpired).length > 0 && (
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-lg flex items-start gap-2">
            <span className="material-symbols-outlined text-orange-500 dark:text-orange-400 text-[18px]">warning</span>
            <p className="text-xs text-orange-700 dark:text-orange-300">
              发现 {stats.items.filter(item => item.isExpired).length} 个过期缓存项
            </p>
          </div>
        )}
      </div>

      {/* 缓存详情 */}
      {stats.itemCount > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="text-sm font-semibold text-slate-800 dark:text-white">缓存详情</span>
            <span className={`material-symbols-outlined text-slate-400 dark:text-slate-500 transition-transform ${showDetails ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          {showDetails && (
            <div className="border-t border-slate-100 dark:border-slate-700">
              {stats.items.map((item, index) => (
                <div
                  key={item.key}
                  className={`p-4 flex items-center justify-between ${
                    index !== stats.items.length - 1 ? 'border-b border-slate-50 dark:border-slate-700' : ''
                  } ${item.isExpired ? 'bg-orange-50/30 dark:bg-orange-900/10' : ''}`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-800 dark:text-white">{item.key}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {formatAge(item.age)} • {formatBytes(item.size)}
                    </span>
                  </div>
                  {item.isExpired && (
                    <span className="text-[10px] bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-bold">
                      已过期
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="space-y-2">
        <button
          onClick={handleClearExpired}
          disabled={stats.items.filter(item => item.isExpired).length === 0}
          className="w-full bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 rounded-xl py-3 font-bold hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          清理过期缓存
        </button>
        <button
          onClick={handleClearAll}
          disabled={stats.itemCount === 0}
          className="w-full bg-white dark:bg-slate-800 border-2 border-loss-red/20 dark:border-loss-red/30 text-loss-red rounded-xl py-3 font-bold hover:bg-loss-red/5 dark:hover:bg-loss-red/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          清空所有缓存
        </button>
      </div>

      {/* 说明 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-blue-500 dark:text-blue-400 text-[18px] mt-0.5">info</span>
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p>• 缓存可以加快数据加载速度，减少网络请求</p>
            <p>• 缓存默认保存 5 分钟后自动过期</p>
            <p>• 清空缓存后，下次访问将重新从服务器获取数据</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CacheManager;
