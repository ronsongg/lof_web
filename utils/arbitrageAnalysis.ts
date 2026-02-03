/**
 * LOF 套利实战指标评估工具
 * 基于专业套利标准评估机会质量
 */

import { StockData } from '../types';

// 实战阈值配置
export const ARBITRAGE_THRESHOLDS = {
  // 1️⃣ 折溢价率
  premiumRate: {
    premiumMin: 1.5,      // 溢价套利最低阈值
    premiumGood: 2.0,     // 溢价套利优质阈值
    discountMax: -1.0,    // 折价套利最低阈值
    discountGood: -1.5,   // 折价套利优质阈值
  },
  // 2️⃣ 日成交额
  amount: {
    min: 30000000,        // 3000万（最低）
    safe: 50000000,       // 5000万（安全）
  },
  // 3️⃣ 费用率
  fees: {
    max: 0.6,             // 总费用率上限
  },
  // 4️⃣ 转托管时间
  transferDays: {
    acceptable: 2,        // T+1/T+2 可接受
    max: 3,              // T+3以上基本不做
  },
  // 5️⃣ 日波动率
  volatility: {
    max: 1.2,            // 权益类上限
  },
  // 6️⃣ 跟踪误差
  trackingError: {
    max: 0.5,            // 长期小于0.5%
  },
  // 7️⃣ 折溢价历史分位
  percentile: {
    premiumMin: 90,      // 溢价套利最低分位
    discountMax: 10,     // 折价套利最低分位
  }
};

/**
 * 计算收益潜力
 */
export const calculateProfitPotential = (stock: StockData): number => {
  const { premiumRate, fees } = stock;
  if (!fees) return Math.abs(premiumRate);

  // 预估收益 = |折溢价率| - 总费用率
  return Math.abs(premiumRate) - fees.total;
};

/**
 * 评估风险等级
 */
export const assessRiskLevel = (stock: StockData): 'low' | 'medium' | 'high' => {
  let riskScore = 0;

  // 成交额不足 +2
  if (stock.amount && stock.amount < ARBITRAGE_THRESHOLDS.amount.min) {
    riskScore += 2;
  }

  // 转托管时间过长 +2
  if (stock.transferDays && stock.transferDays > ARBITRAGE_THRESHOLDS.transferDays.acceptable) {
    riskScore += 2;
  }

  // 波动率过高 +1
  if (stock.volatility && stock.volatility > ARBITRAGE_THRESHOLDS.volatility.max) {
    riskScore += 1;
  }

  // 跟踪误差大 +1
  if (stock.trackingError && stock.trackingError > ARBITRAGE_THRESHOLDS.trackingError.max) {
    riskScore += 1;
  }

  // 有申赎限制 +2
  if (stock.restrictions?.purchaseSuspended || stock.restrictions?.redeemSuspended) {
    riskScore += 2;
  }

  if (riskScore <= 1) return 'low';
  if (riskScore <= 3) return 'medium';
  return 'high';
};

/**
 * 判断是否符合实战标准（宽松版本，保留高溢价机会）
 */
export const isValidArbitrageOpportunity = (stock: StockData): boolean => {
  const { premiumRate, amount, fees, transferDays, restrictions } = stock;

  // 任何限制 = 放弃套利
  if (restrictions?.purchaseSuspended || restrictions?.redeemSuspended) {
    return false;
  }

  // 折溢价率绝对值 >= 1.0% 就保留（降低阈值，显示更多机会）
  const isPremiumValid = premiumRate >= 1.0;
  const isDiscountValid = premiumRate <= -0.8;
  if (!isPremiumValid && !isDiscountValid) {
    return false;
  }

  // 对于高溢价机会（>= 2.0%），放宽其他条件
  if (Math.abs(premiumRate) >= 2.0) {
    return true; // 高溢价直接保留
  }

  // 成交额太小（但对于溢价率很高的，只提示风险，不过滤）
  if (amount && amount < ARBITRAGE_THRESHOLDS.amount.min) {
    if (Math.abs(premiumRate) < 1.5) {
      return false; // 溢价不够且成交额小，过滤
    }
  }

  // 转托管时间太长
  if (transferDays && transferDays > ARBITRAGE_THRESHOLDS.transferDays.max) {
    if (Math.abs(premiumRate) < 2.0) {
      return false; // 溢价不够且转托管慢，过滤
    }
  }

  // 费用太高（吃掉利润）- 但高溢价的保留
  if (fees && fees.total > ARBITRAGE_THRESHOLDS.fees.max) {
    const profit = calculateProfitPotential(stock);
    if (profit <= 0 && Math.abs(premiumRate) < 2.0) {
      return false; // 无利润且溢价不高，过滤
    }
  }

  return true;
};

/**
 * 评估机会质量（0-100分）
 */
export const evaluateOpportunityScore = (stock: StockData): number => {
  let score = 0;

  // 折溢价率（40分）
  const premiumAbs = Math.abs(stock.premiumRate);
  if (premiumAbs >= 3.0) score += 40;
  else if (premiumAbs >= 2.0) score += 30;
  else if (premiumAbs >= 1.5) score += 20;
  else score += 10;

  // 成交额（20分）
  if (stock.amount) {
    if (stock.amount >= 100000000) score += 20;        // 1亿+
    else if (stock.amount >= ARBITRAGE_THRESHOLDS.amount.safe) score += 15;
    else if (stock.amount >= ARBITRAGE_THRESHOLDS.amount.min) score += 10;
  }

  // 转托管速度（15分）
  if (stock.transferDays) {
    if (stock.transferDays === 1) score += 15;
    else if (stock.transferDays === 2) score += 10;
    else if (stock.transferDays === 3) score += 5;
  }

  // 费用率（15分）
  if (stock.fees) {
    if (stock.fees.total <= 0.3) score += 15;
    else if (stock.fees.total <= 0.5) score += 10;
    else if (stock.fees.total <= 0.6) score += 5;
  }

  // 波动率（10分）
  if (stock.volatility !== undefined) {
    if (stock.volatility <= 0.8) score += 10;
    else if (stock.volatility <= 1.2) score += 5;
  }

  return Math.min(score, 100);
};

/**
 * 获取机会等级文字
 */
export const getOpportunityGrade = (score: number): {
  label: string;
  color: string;
  bgColor: string;
} => {
  if (score >= 80) return {
    label: '优质',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
  };
  if (score >= 60) return {
    label: '良好',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
  };
  if (score >= 40) return {
    label: '一般',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
  };
  return {
    label: '风险',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  };
};

/**
 * 格式化成交额
 */
export const formatAmount = (amount?: number): string => {
  if (!amount) return '--';
  if (amount >= 100000000) return `${(amount / 100000000).toFixed(2)}亿`;
  if (amount >= 10000) return `${(amount / 10000).toFixed(0)}万`;
  return amount.toFixed(0);
};

/**
 * 获取风险等级显示
 */
export const getRiskLevelDisplay = (level?: 'low' | 'medium' | 'high'): {
  label: string;
  color: string;
} => {
  switch (level) {
    case 'low':
      return { label: '低风险', color: 'text-emerald-600' };
    case 'medium':
      return { label: '中风险', color: 'text-orange-600' };
    case 'high':
      return { label: '高风险', color: 'text-red-600' };
    default:
      return { label: '未知', color: 'text-slate-400' };
  }
};
