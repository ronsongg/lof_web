/**
 * 自定义 Hook: 获取和管理 LOF 数据（含实战指标）
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchAllLofList, fetchIndexLofList } from '../services/api';
import { transformJisiluList, sortStockData, filterArbitrageOpportunities } from '../utils/dataTransform';
import { StockData } from '../types';

export type FilterType = 'all' | 'premium' | 'discount' | 't0' | 'quality' | 'safe';
export type SortType = 'premium' | 'discount' | 'volume' | 'score' | 'profit';

interface UseLofDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  useCache?: boolean;
}

interface UseLofDataReturn {
  data: StockData[];
  filteredData: StockData[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setFilter: (filter: FilterType) => void;
  setSortBy: (sort: SortType) => void;
  currentFilter: FilterType;
  currentSort: SortType;
  stats: {
    totalCount: number;
    avgPremiumRate: number;
    newOpportunities: number;
    qualityCount: number;        // 优质机会数量
    avgScore: number;             // 平均评分
    highRiskCount: number;        // 高风险数量
  };
}

export const useLofData = (options: UseLofDataOptions = {}): UseLofDataReturn => {
  const { autoRefresh = true, refreshInterval = 120000, useCache = true } = options;

  const [data, setData] = useState<StockData[]>([]);
  const [filteredData, setFilteredData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [currentSort, setCurrentSort] = useState<SortType>('score');
  const [stats, setStats] = useState({
    totalCount: 0,
    avgPremiumRate: 0,
    newOpportunities: 0,
    qualityCount: 0,
    avgScore: 0,
    highRiskCount: 0
  });

  // 获取数据函数
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchIndexLofList(useCache);
      const transformedData = transformJisiluList(response.rows);
      const sortedData = sortStockData(transformedData, 'score'); // 默认按评分排序

      setData(sortedData);

      // 计算统计数据
      const total = sortedData.length;
      const avgPremium = total > 0
        ? sortedData.reduce((sum, item) => sum + item.premiumRate, 0) / total
        : 0;

      // 计算优质机会（评分≥80）
      const { evaluateOpportunityScore } = await import('../utils/arbitrageAnalysis');
      const qualityOps = sortedData.filter(item => evaluateOpportunityScore(item) >= 80).length;

      // 计算平均评分
      const avgScore = total > 0
        ? sortedData.reduce((sum, item) => sum + evaluateOpportunityScore(item), 0) / total
        : 0;

      // 高风险数量
      const highRisk = sortedData.filter(item => item.riskLevel === 'high').length;

      // 新增机会（折溢价绝对值 > 1.5%）
      const newOps = sortedData.filter(item => Math.abs(item.premiumRate) > 1.5).length;

      setStats({
        totalCount: total,
        avgPremiumRate: parseFloat(avgPremium.toFixed(2)),
        newOpportunities: newOps,
        qualityCount: qualityOps,
        avgScore: parseFloat(avgScore.toFixed(1)),
        highRiskCount: highRisk
      });

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch LOF data:', err);
      setError('数据加载失败，请检查网络连接或稍后重试');
      setLoading(false);
    }
  }, [useCache]);

  // 应用过滤和排序
  useEffect(() => {
    let filtered = [...data];

    // 应用过滤器
    switch (currentFilter) {
      case 'premium':
        // 高溢价：溢价率 > 1.5%
        filtered = filterArbitrageOpportunities(filtered, {
          minPremiumRate: 1.5,
          maxPremiumRate: 100
        });
        break;

      case 'discount':
        // 高折价：折价率 < -1.0%
        filtered = filterArbitrageOpportunities(filtered, {
          minPremiumRate: -100,
          maxPremiumRate: -1.0
        });
        break;

      case 't0':
        // T+0/T+1 快速套利
        filtered = filterArbitrageOpportunities(filtered, {
          maxTransferDays: 1
        });
        break;

      case 'quality':
        // 优质机会（评分≥80）
        filtered = filterArbitrageOpportunities(filtered, {
          minScore: 80
        });
        break;

      case 'safe':
        // 安全机会（成交额≥5000万，低风险）
        filtered = filterArbitrageOpportunities(filtered, {
          minAmount: 50000000,
          riskLevel: 'low'
        });
        break;

      case 'all':
      default:
        // 显示所有符合基本标准的
        break;
    }

    // 应用排序
    filtered = sortStockData(filtered, currentSort);

    setFilteredData(filtered);
  }, [data, currentFilter, currentSort]);

  // 初始加载
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, fetchData]);

  // 手动刷新
  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // 设置过滤器
  const setFilter = useCallback((filter: FilterType) => {
    setCurrentFilter(filter);
  }, []);

  // 设置排序
  const setSortBy = useCallback((sort: SortType) => {
    setCurrentSort(sort);
  }, []);

  return {
    data: filteredData,
    filteredData,
    loading,
    error,
    refresh,
    setFilter,
    setSortBy,
    currentFilter,
    currentSort,
    stats
  };
};
