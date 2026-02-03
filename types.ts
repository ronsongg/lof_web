export type ViewState = 'monitor' | 'holdings' | 'settings';

export interface TradingAccount {
    id: string;
    name: string;                   // 账户名称，如 "华泰证券"
    broker: string;                 // 券商名称
    accountNumber: string;          // 账户号码（脱敏显示）
    fees: {
        purchase: number;           // 申购费率 %
        redeem: number;             // 赎回费率 %
        trading: number;            // 交易佣金 %
    };
    isDefault: boolean;             // 是否默认账户
    createdAt: string;
    updatedAt: string;
}

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
    exchange: 'SZ' | 'SH';
    type: string; // e.g., "T+2 套利周期"
    status: 'pending' | 'ready' | 'locked' | 'completed';
    statusText: string;
    statusColor: 'warning' | 'success' | 'slate' | 'blue';
    progress: number;
    purchaseDate: string;           // 申购日期
    purchasePrice: number;          // 申购价格（IOPV）
    shares: number;                 // 份额
    cost: number;                   // 成本价（含费用）
    currentPrice: number;           // 当前净值
    estimatedSellDate?: string;     // 预计可卖日期
    actualSellDate?: string;        // 实际卖出日期
    sellPrice?: number;             // 卖出价格
    fees: {
        purchase: number;           // 申购费
        redeem: number;             // 赎回费
        trading: number;            // 交易佣金
        total: number;              // 总费用
    };
    transferDays: number;           // 转托管天数
    unrealizedProfit: number;       // 未实现盈亏
    unrealizedProfitPercent: number; // 未实现盈亏百分比
    realizedProfit?: number;        // 已实现盈亏
    realizedProfitPercent?: number; // 已实现盈亏百分比
    canRedeem: boolean;             // 是否可赎回
    notes?: string;                 // 备注
    createdAt: string;              // 创建时间
    updatedAt: string;              // 更新时间
}
