/**
 * 数据转换工具
 * 将集思录 API 数据转换为应用内部数据格式，并计算实战指标
 */

import { JisiluLofItem } from '../services/api';
import { StockData } from '../types';
import {
  calculateProfitPotential,
  assessRiskLevel,
  isValidArbitrageOpportunity,
  evaluateOpportunityScore
} from './arbitrageAnalysis';

/**
 * 解析交易所代码
 */
const parseExchange = (stockCode: string): 'SZ' | 'SH' => {
  if (!stockCode) return 'SZ';
  return stockCode.toUpperCase().startsWith('SH') ? 'SH' : 'SZ';
};

/**
 * 计算预计到账日期和转托管天数
 */
const calculateArrivalInfo = (discountRate: number, fundName: string): {
  estimatedArrival: string;
  arrivalDays: string;
  transferDays: number;
} => {
  const today = new Date();
  let days = 2; // 默认 T+2

  // 根据基金类型判断
  const isQDII = fundName.includes('QDII') || fundName.includes('纳斯达克') ||
                 fundName.includes('油气') || fundName.includes('黄金') ||
                 fundName.includes('原油');

  if (isQDII) {
    days = 3; // QDII 一般 T+3
  }

  const arrivalDate = new Date(today);
  arrivalDate.setDate(today.getDate() + days);

  const month = String(arrivalDate.getMonth() + 1).padStart(2, '0');
  const date = String(arrivalDate.getDate()).padStart(2, '0');

  return {
    estimatedArrival: `${month}-${date}`,
    arrivalDays: `T+${days}`,
    transferDays: days
  };
};

/**
 * 计算费用结构
 */
const calculateFees = (fundName: string, exchange: 'SZ' | 'SH'): {
  purchase: number;
  redeem: number;
  trading: number;
  total: number;
} => {
  // 默认费率（实际应从API获取）
  let purchase = 0.12;  // 申购费 0.12%
  let redeem = 0.05;    // 赎回费 0.05%
  let trading = 0.03;   // 场内交易佣金 0.03%

  // QDII 基金费率可能更高
  if (fundName.includes('QDII')) {
    purchase = 0.15;
    redeem = 0.10;
  }

  // 货币/债券基金费率低
  if (fundName.includes('货币') || fundName.includes('债')) {
    purchase = 0.00;
    redeem = 0.00;
  }

  const total = purchase + redeem + trading * 2; // 买入卖出各一次

  return { purchase, redeem, trading, total };
};

/**
 * 估算日波动率
 */
const estimateVolatility = (fundName: string, priceChangePercent: number): number => {
  // 基于基金类型估算（实际应从历史数据计算）
  if (fundName.includes('QDII') || fundName.includes('原油') || fundName.includes('油气')) {
    return Math.abs(priceChangePercent) * 1.5; // QDII 波动大
  }
  if (fundName.includes('指数') || fundName.includes('LOF')) {
    return Math.abs(priceChangePercent) * 1.2;
  }
  return Math.abs(priceChangePercent);
};

/**
 * 估算跟踪误差
 */
const estimateTrackingError = (fundName: string): number => {
  // 默认估算（实际应从历史数据计算）
  if (fundName.includes('QDII')) return 0.6;
  if (fundName.includes('指数')) return 0.3;
  return 0.4;
};

/**
 * 估算折溢价历史分位
 */
const estimatePremiumPercentile = (premiumRate: number): number => {
  // 简化估算（实际需要历史数据）
  if (premiumRate > 2.5) return 95;
  if (premiumRate > 2.0) return 90;
  if (premiumRate > 1.5) return 85;
  if (premiumRate > 1.0) return 70;
  if (premiumRate > 0) return 60;
  if (premiumRate > -1.0) return 40;
  if (premiumRate > -1.5) return 15;
  if (premiumRate > -2.0) return 10;
  return 5;
};

/**
 * 计算申购限额
 */
const calculateLimitAmount = (volume: string, price: string, amount: string): number | undefined => {
  const vol = parseFloat(volume) || 0;
  const prc = parseFloat(price) || 0;
  const amt = parseFloat(amount) || 0;

  // 成交额大于5000万，通常无限额
  if (amt > 50000000) return undefined;

  // 根据成交金额估算限额
  if (amt < 10000000) return 50;     // 1000万以下
  if (amt < 30000000) return 100;    // 3000万以下
  if (amt < 50000000) return 200;    // 5000万以下
  return 500;
};

/**
 * 转换集思录数据到应用数据格式（含实战指标）
 */
export const transformJisiluToStockData = (item: JisiluLofItem): StockData => {
  const { cell } = item;

  const price = parseFloat(cell.price) || 0;
  const priceChangePercent = parseFloat(cell.increase_rt) || 0;
  const iopv = parseFloat(cell.estimate_value) || 0;
  const premiumRate = parseFloat(cell.discount_rt) || 0;
  const volume = parseFloat(cell.volume) || 0;
  const amount = parseFloat(cell.amount) || 0;

  const exchange = parseExchange(cell.stock_cd);
  const { estimatedArrival, arrivalDays, transferDays } = calculateArrivalInfo(premiumRate, cell.fund_nm);
  const limitAmount = calculateLimitAmount(cell.volume, cell.price, cell.amount);
  const fees = calculateFees(cell.fund_nm, exchange);
  const volatility = estimateVolatility(cell.fund_nm, priceChangePercent);
  const trackingError = estimateTrackingError(cell.fund_nm);
  const premiumPercentile = estimatePremiumPercentile(premiumRate);

  // 构建初步数据
  const stockData: StockData = {
    id: cell.fund_id,
    code: cell.fund_id,
    name: cell.fund_nm,
    exchange,
    price,
    priceChangePercent,
    iopv,
    premiumRate,
    limitAmount,
    estimatedArrival,
    arrivalDays,
    isNoLimit: limitAmount === undefined,
    volume,
    amount,
    fees,
    transferDays,
    volatility,
    trackingError,
    premiumPercentile,
    restrictions: {
      purchaseSuspended: false,  // 实际应从API获取
      redeemSuspended: false,
      minPurchaseAmount: limitAmount
    }
  };

  // 计算衍生指标
  stockData.profitPotential = calculateProfitPotential(stockData);
  stockData.riskLevel = assessRiskLevel(stockData);

  return stockData;
};

/**
 * 批量转换数据
 */
export const transformJisiluList = (items: JisiluLofItem[]): StockData[] => {
  return items
    .map(transformJisiluToStockData)
    .filter(item => {
      // 过滤无效数据
      if (item.price <= 0 || item.iopv <= 0) return false;

      // 保留高溢价率的机会（绝对值 >= 1.0%），即使其他指标不完美
      if (Math.abs(item.premiumRate) >= 1.0) return true;

      // 其他情况需要符合基本标准
      return isValidArbitrageOpportunity(item);
    });
};

/**
 * 数据排序工具
 */
export const sortStockData = (
  data: StockData[],
  sortBy: 'premium' | 'discount' | 'volume' | 'score' | 'profit'
): StockData[] => {
  const sorted = [...data];

  switch (sortBy) {
    case 'premium':
      return sorted.sort((a, b) => b.premiumRate - a.premiumRate);
    case 'discount':
      return sorted.sort((a, b) => a.premiumRate - b.premiumRate);
    case 'volume':
      return sorted.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    case 'score':
      return sorted.sort((a, b) => evaluateOpportunityScore(b) - evaluateOpportunityScore(a));
    case 'profit':
      return sorted.sort((a, b) => (b.profitPotential || 0) - (a.profitPotential || 0));
    default:
      return sorted;
  }
};

/**
 * 过滤套利机会
 */
export const filterArbitrageOpportunities = (
  data: StockData[],
  options: {
    minPremiumRate?: number;
    maxPremiumRate?: number;
    minAmount?: number;
    exchange?: 'SZ' | 'SH' | 'ALL';
    onlyNoLimit?: boolean;
    maxTransferDays?: number;
    minScore?: number;
    riskLevel?: 'low' | 'medium' | 'high' | 'ALL';
  }
): StockData[] => {
  const {
    minPremiumRate = -10,
    maxPremiumRate = 10,
    minAmount = 0,
    exchange = 'ALL',
    onlyNoLimit = false,
    maxTransferDays = 3,
    minScore = 0,
    riskLevel = 'ALL'
  } = options;

  return data.filter(item => {
    // 折溢价率过滤
    if (item.premiumRate < minPremiumRate || item.premiumRate > maxPremiumRate) {
      return false;
    }

    // 成交额过滤
    if (item.amount && item.amount < minAmount) {
      return false;
    }

    // 交易所过滤
    if (exchange !== 'ALL' && item.exchange !== exchange) {
      return false;
    }

    // 无限额过滤
    if (onlyNoLimit && !item.isNoLimit) {
      return false;
    }

    // 转托管时间过滤
    if (item.transferDays && item.transferDays > maxTransferDays) {
      return false;
    }

    // 评分过滤
    const score = evaluateOpportunityScore(item);
    if (score < minScore) {
      return false;
    }

    // 风险等级过滤
    if (riskLevel !== 'ALL' && item.riskLevel !== riskLevel) {
      return false;
    }

    return true;
  });
};

