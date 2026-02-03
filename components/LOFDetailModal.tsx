/**
 * LOF 详情模态框
 * 展示完整的8项专业套利指标和实战建议
 */

import React from 'react';
import { StockData } from '../types';
import { evaluateOpportunityScore, getOpportunityGrade, formatAmount, ARBITRAGE_THRESHOLDS } from '../utils/arbitrageAnalysis';

interface LOFDetailModalProps {
  stock: StockData;
  onClose: () => void;
}

const LOFDetailModal: React.FC<LOFDetailModalProps> = ({ stock, onClose }) => {
  const score = evaluateOpportunityScore(stock);
  const grade = getOpportunityGrade(score);

  // 判断各项指标是否达标
  const checks = {
    premium: Math.abs(stock.premiumRate) >= ARBITRAGE_THRESHOLDS.premiumRate.premiumMin,
    amount: (stock.amount || 0) >= ARBITRAGE_THRESHOLDS.amount.min,
    fees: (stock.fees?.total || 1) <= ARBITRAGE_THRESHOLDS.fees.max,
    transfer: (stock.transferDays || 99) <= ARBITRAGE_THRESHOLDS.transferDays.acceptable,
    volatility: (stock.volatility || 99) <= ARBITRAGE_THRESHOLDS.volatility.max,
    tracking: (stock.trackingError || 99) <= ARBITRAGE_THRESHOLDS.trackingError.max,
    percentile: stock.premiumRate > 0
      ? (stock.premiumPercentile || 0) >= ARBITRAGE_THRESHOLDS.percentile.premiumMin
      : (stock.premiumPercentile || 100) <= ARBITRAGE_THRESHOLDS.percentile.discountMax,
    restrictions: !stock.restrictions?.purchaseSuspended && !stock.restrictions?.redeemSuspended
  };

  const passedCount = Object.values(checks).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{stock.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{stock.code} · {stock.exchange}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* 评分卡片 */}
          <div className={`rounded-xl p-4 border-2 ${grade.bgColor} ${grade.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium opacity-80">综合评分</p>
                <p className="text-3xl font-bold mt-1">{score}分</p>
                <p className="text-xs font-bold mt-1">{grade.label}机会 · 通过 {passedCount}/8 项指标</p>
              </div>
              <div className="text-5xl opacity-20">
                {score >= 80 ? '🏆' : score >= 60 ? '✓' : score >= 40 ? '⚠' : '✗'}
              </div>
            </div>
          </div>

          {/* 8项关键指标 */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">8项关键指标清单</h3>

            {/* 1️⃣ 折溢价率 */}
            <div className={`p-3 rounded-lg border-2 ${checks.premium ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{checks.premium ? '✅' : '❌'}</span>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">1️⃣ 折溢价率（最核心）</p>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                    当前: <span className="font-bold text-base">{stock.premiumRate > 0 ? '+' : ''}{stock.premiumRate.toFixed(2)}%</span>
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    标准: {stock.premiumRate > 0 ? '溢价 ≥ +1.5%' : '折价 ≤ -1.0%'}
                  </p>
                </div>
              </div>
            </div>

            {/* 2️⃣ 日成交额 */}
            <div className={`p-3 rounded-lg border-2 ${checks.amount ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{checks.amount ? '✅' : '❌'}</span>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">2️⃣ 日成交额（流动性）</p>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                    当前: <span className="font-bold text-base">{formatAmount(stock.amount)}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    标准: ≥ 3000万（最低）· ≥ 5000万（安全）
                  </p>
                </div>
              </div>
            </div>

            {/* 3️⃣ 申购/赎回费率 */}
            <div className={`p-3 rounded-lg border-2 ${checks.fees ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{checks.fees ? '✅' : '❌'}</span>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">3️⃣ 申购/赎回费率</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-600 dark:text-slate-300">
                    <div>申购费: <span className="font-bold">{stock.fees?.purchase.toFixed(2)}%</span></div>
                    <div>赎回费: <span className="font-bold">{stock.fees?.redeem.toFixed(2)}%</span></div>
                    <div>交易佣金: <span className="font-bold">{stock.fees?.trading.toFixed(2)}%</span></div>
                    <div>总费用率: <span className="font-bold text-base">{stock.fees?.total.toFixed(2)}%</span></div>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    标准: 总费用率 ≤ 0.6%（越低越好）
                  </p>
                </div>
              </div>
            </div>

            {/* 4️⃣ 转托管时间 */}
            <div className={`p-3 rounded-lg border-2 ${checks.transfer ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{checks.transfer ? '✅' : '❌'}</span>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">4️⃣ 转托管时间</p>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                    当前: <span className="font-bold text-base">{stock.arrivalDays}</span> · 预计到账 {stock.estimatedArrival}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    标准: T+1/T+2 可接受 · T+3以上基本不做
                  </p>
                </div>
              </div>
            </div>

            {/* 5️⃣ 标的日波动率 */}
            <div className={`p-3 rounded-lg border-2 ${checks.volatility ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{checks.volatility ? '✅' : '⚠️'}</span>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">5️⃣ 标的日波动率</p>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                    当前: <span className="font-bold text-base">{(stock.volatility || 0).toFixed(2)}%</span>
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    标准: ≤ 1.2%（权益类）· QDII/行业主题基本不碰
                  </p>
                </div>
              </div>
            </div>

            {/* 6️⃣ 跟踪误差 */}
            <div className={`p-3 rounded-lg border-2 ${checks.tracking ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{checks.tracking ? '✅' : '⚠️'}</span>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">6️⃣ 跟踪误差（指数型）</p>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                    当前: <span className="font-bold text-base">{(stock.trackingError || 0).toFixed(2)}%</span>
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    标准: 长期小于 0.5%
                  </p>
                </div>
              </div>
            </div>

            {/* 7️⃣ 折溢价历史分位 */}
            <div className={`p-3 rounded-lg border-2 ${checks.percentile ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{checks.percentile ? '✅' : '⚠️'}</span>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">7️⃣ 折溢价历史分位</p>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                    当前: <span className="font-bold text-base">{(stock.premiumPercentile || 0).toFixed(0)}%</span> 分位
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    标准: {stock.premiumRate > 0 ? '90%分位以上（溢价套利）' : '10%分位以下（折价套利）'}
                  </p>
                </div>
              </div>
            </div>

            {/* 8️⃣ 申赎规则限制 */}
            <div className={`p-3 rounded-lg border-2 ${checks.restrictions ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{checks.restrictions ? '✅' : '❌'}</span>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">8️⃣ 申赎规则限制</p>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-2 space-y-1">
                    <p>申购状态: <span className="font-bold">{stock.restrictions?.purchaseSuspended ? '❌ 暂停' : '✅ 正常'}</span></p>
                    <p>赎回状态: <span className="font-bold">{stock.restrictions?.redeemSuspended ? '❌ 暂停' : '✅ 正常'}</span></p>
                    <p>最小申购额: <span className="font-bold">{stock.restrictions?.minPurchaseAmount || '无限制'}</span></p>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    标准: 任何限制 = 放弃套利
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 实战建议 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg">lightbulb</span>
              <div className="flex-1">
                <p className="font-bold text-blue-900 dark:text-blue-200 mb-1 text-sm">实战建议</p>
                <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                  <p>✓ 折溢价够不够: {checks.premium ? '✅ 符合标准' : '❌ 不够'}</p>
                  <p>✓ 能不能快速转: {checks.transfer ? '✅ 可以' : '❌ 太慢'}</p>
                  <p>✓ 卖不卖得掉: {checks.amount ? '✅ 流动性充足' : '❌ 流动性不足'}</p>
                  <p>✓ 成本会不会吃掉利润: {(stock.profitPotential || 0) > 0.5 ? '✅ 有利润空间' : '❌ 利润不足'}</p>
                </div>
                <p className="text-xs font-bold text-blue-900 dark:text-blue-200 mt-2">
                  预估收益率: <span className="text-base">{(stock.profitPotential || 0).toFixed(2)}%</span>
                  <span className="text-[10px] ml-1">(扣除费用后)</span>
                </p>
              </div>
            </div>
          </div>

          {/* 风险提示 */}
          {stock.riskLevel && stock.riskLevel !== 'low' && (
            <div className={`rounded-xl p-3 border-2 ${
              stock.riskLevel === 'high'
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
            }`}>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-lg">warning</span>
                <div>
                  <p className="font-bold text-red-900 dark:text-red-200 mb-1 text-sm">
                    {stock.riskLevel === 'high' ? '🔴 高风险警告' : '🟡 中风险提示'}
                  </p>
                  <p className="text-xs text-red-800 dark:text-red-300">
                    {stock.riskLevel === 'high'
                      ? '该机会存在多项风险指标，建议谨慎操作或放弃套利'
                      : '部分指标未达最优标准，请评估风险后决策'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-3 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            关闭
          </button>
          <button className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors">
            加入持仓监控
          </button>
        </div>
      </div>
    </div>
  );
};

export default LOFDetailModal;
