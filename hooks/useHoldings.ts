/**
 * 持仓管理 Hook
 * 管理 LOF 套利持仓的增删改查和状态更新
 */

import { useState, useEffect, useCallback } from 'react';
import { HoldingData } from '../types';

const STORAGE_KEY = 'lof_holdings';

interface UseHoldingsReturn {
  holdings: HoldingData[];
  addHolding: (holding: Omit<HoldingData, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateHolding: (id: string, updates: Partial<HoldingData>) => void;
  deleteHolding: (id: string) => void;
  completeHolding: (id: string, sellPrice: number) => void;
  getHoldingById: (id: string) => HoldingData | undefined;
  stats: {
    totalHoldings: number;
    pendingCount: number;
    readyCount: number;
    completedCount: number;
    totalUnrealizedProfit: number;
    totalRealizedProfit: number;
    totalUnrealizedProfitPercent: number;
  };
}

/**
 * 计算持仓统计数据
 */
const calculateStats = (holdings: HoldingData[]) => {
  const activeHoldings = holdings.filter(h => h.status !== 'completed');
  const completedHoldings = holdings.filter(h => h.status === 'completed');

  const totalUnrealizedProfit = activeHoldings.reduce((sum, h) => sum + h.unrealizedProfit, 0);
  const totalRealizedProfit = completedHoldings.reduce((sum, h) => sum + (h.realizedProfit || 0), 0);

  const totalCost = activeHoldings.reduce((sum, h) => sum + (h.cost * h.shares), 0);
  const totalUnrealizedProfitPercent = totalCost > 0 ? (totalUnrealizedProfit / totalCost) * 100 : 0;

  return {
    totalHoldings: activeHoldings.length,
    pendingCount: holdings.filter(h => h.status === 'pending').length,
    readyCount: holdings.filter(h => h.status === 'ready').length,
    completedCount: completedHoldings.length,
    totalUnrealizedProfit,
    totalRealizedProfit,
    totalUnrealizedProfitPercent
  };
};

/**
 * 计算持仓状态
 */
const calculateHoldingStatus = (holding: HoldingData): {
  status: HoldingData['status'];
  statusText: string;
  statusColor: HoldingData['statusColor'];
  progress: number;
  canRedeem: boolean;
} => {
  const purchaseDate = new Date(holding.purchaseDate);
  const today = new Date();
  const daysPassed = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));

  // 已完成
  if (holding.status === 'completed') {
    return {
      status: 'completed',
      statusText: '已结算',
      statusColor: 'blue',
      progress: 100,
      canRedeem: false
    };
  }

  // 已到账，可赎回
  if (daysPassed >= holding.transferDays) {
    return {
      status: 'ready',
      statusText: '已就绪',
      statusColor: 'success',
      progress: 100,
      canRedeem: true
    };
  }

  // 等待确认
  if (daysPassed === 0) {
    return {
      status: 'pending',
      statusText: '等待确认 T+0',
      statusColor: 'warning',
      progress: 0,
      canRedeem: false
    };
  }

  // 锁定期
  const progress = Math.min((daysPassed / holding.transferDays) * 100, 99);
  return {
    status: 'locked',
    statusText: `锁定期 T+${daysPassed}`,
    statusColor: 'slate',
    progress,
    canRedeem: false
  };
};

export const useHoldings = (): UseHoldingsReturn => {
  const [holdings, setHoldings] = useState<HoldingData[]>([]);

  // 从 localStorage 加载持仓
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setHoldings(data);
      } catch (error) {
        console.error('Failed to load holdings:', error);
      }
    }
  }, []);

  // 保存到 localStorage
  const saveHoldings = useCallback((data: HoldingData[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setHoldings(data);
  }, []);

  // 更新持仓状态（每日自动）
  useEffect(() => {
    if (holdings.length === 0) return;

    const updatedHoldings = holdings.map(holding => {
      if (holding.status === 'completed') return holding;

      const statusInfo = calculateHoldingStatus(holding);
      return {
        ...holding,
        status: statusInfo.status,
        statusText: statusInfo.statusText,
        statusColor: statusInfo.statusColor,
        progress: statusInfo.progress,
        canRedeem: statusInfo.canRedeem,
        updatedAt: new Date().toISOString()
      };
    });

    // 只在状态有变化时更新
    const hasChanges = updatedHoldings.some((h, i) =>
      h.status !== holdings[i].status || h.canRedeem !== holdings[i].canRedeem
    );

    if (hasChanges) {
      saveHoldings(updatedHoldings);
    }
  }, [holdings, saveHoldings]);

  // 添加持仓
  const addHolding = useCallback((holding: Omit<HoldingData, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const statusInfo = calculateHoldingStatus(holding as HoldingData);

    const newHolding: HoldingData = {
      ...holding,
      id: `holding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: statusInfo.status,
      statusText: statusInfo.statusText,
      statusColor: statusInfo.statusColor,
      progress: statusInfo.progress,
      canRedeem: statusInfo.canRedeem,
      createdAt: now,
      updatedAt: now
    };

    saveHoldings([newHolding, ...holdings]);
  }, [holdings, saveHoldings]);

  // 更新持仓
  const updateHolding = useCallback((id: string, updates: Partial<HoldingData>) => {
    const updatedHoldings = holdings.map(holding =>
      holding.id === id
        ? { ...holding, ...updates, updatedAt: new Date().toISOString() }
        : holding
    );
    saveHoldings(updatedHoldings);
  }, [holdings, saveHoldings]);

  // 删除持仓
  const deleteHolding = useCallback((id: string) => {
    const filteredHoldings = holdings.filter(h => h.id !== id);
    saveHoldings(filteredHoldings);
  }, [holdings, saveHoldings]);

  // 完成持仓（卖出结算）
  const completeHolding = useCallback((id: string, sellPrice: number) => {
    const holding = holdings.find(h => h.id === id);
    if (!holding) return;

    const totalCost = holding.cost * holding.shares;
    const totalRevenue = sellPrice * holding.shares;
    const tradingFee = totalRevenue * (holding.fees.trading / 100);
    const netRevenue = totalRevenue - tradingFee;

    const realizedProfit = netRevenue - totalCost;
    const realizedProfitPercent = (realizedProfit / totalCost) * 100;

    const updatedHolding: HoldingData = {
      ...holding,
      status: 'completed',
      statusText: '已结算',
      statusColor: 'blue',
      progress: 100,
      canRedeem: false,
      sellPrice,
      actualSellDate: new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
      realizedProfit,
      realizedProfitPercent,
      updatedAt: new Date().toISOString()
    };

    updateHolding(id, updatedHolding);
  }, [holdings, updateHolding]);

  // 根据ID获取持仓
  const getHoldingById = useCallback((id: string) => {
    return holdings.find(h => h.id === id);
  }, [holdings]);

  // 计算统计数据
  const stats = calculateStats(holdings);

  return {
    holdings,
    addHolding,
    updateHolding,
    deleteHolding,
    completeHolding,
    getHoldingById,
    stats
  };
};
