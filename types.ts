export type ViewState = 'monitor' | 'holdings' | 'settings';

export interface StockData {
    id: string;
    code: string;
    name: string;
    exchange: 'SZ' | 'SH';
    price: number;                      // 场内价
    priceChangePercent: number;         // 涨跌幅
    iopv: number;                       // IOPV (即NAV)
    premiumRate: number;                // 折溢价率（核心指标）
    limitAmount?: number;               // 申购限额
    estimatedArrival: string;           // 预计到账日期
    arrivalDays: string;                // T+2 等
    isNoLimit?: boolean;                // 是否无限制

    // 新增关键指标
    volume?: number;                    // 成交量（手）
    amount?: number;                    // 成交额（元）
    turnoverRate?: number;              // 换手率
    fees?: {                            // 费用结构
        purchase: number;               // 申购费率
        redeem: number;                 // 赎回费率
        trading: number;                // 场内交易佣金
        total: number;                  // 总费用率
    };
    transferDays?: number;              // 转托管天数 (1, 2, 3)
    volatility?: number;                // 日波动率
    trackingError?: number;             // 跟踪误差
    premiumPercentile?: number;         // 折溢价历史分位
    restrictions?: {                    // 申赎限制
        purchaseSuspended: boolean;     // 暂停申购
        redeemSuspended: boolean;       // 暂停赎回
        minPurchaseAmount?: number;     // 最小申购额
    };
    profitPotential?: number;           // 预估收益率（折溢价 - 费用）
    riskLevel?: 'low' | 'medium' | 'high'; // 风险等级
}

export interface HoldingData {
    id: string;
    name: string;
    code: string;
    type: string; // e.g., "T+2 Arbitrage"
    status: 'Waiting Confirm' | 'Ready' | 'Locked';
    statusText: string;
    statusColor: 'warning' | 'success' | 'slate'; // mapped to colors
    progress: number;
    purchaseDate: string;
    estimatedSellDate?: string;
    price: number;
    cost: number;
    feeText?: string;
    feeAmount?: number;
    unrealizedProfit: number;
    unrealizedProfitPercent: number;
    floatingProfit?: number;
    floatingProfitPercent?: number;
    isRealized?: boolean;
    canRedeem?: boolean;
}
