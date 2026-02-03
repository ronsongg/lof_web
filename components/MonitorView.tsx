import React, { useState } from 'react';
import { useLofData, FilterType } from '../hooks/useLofData';
import { useDarkMode } from '../hooks/useDarkMode';
import { evaluateOpportunityScore, getOpportunityGrade, formatAmount } from '../utils/arbitrageAnalysis';
import LOFDetailModal from './LOFDetailModal';
import { StockData } from '../types';

const MonitorView: React.FC = () => {
  const { data, loading, error, refresh, setFilter, currentFilter, stats } = useLofData({
    autoRefresh: true,
    refreshInterval: 120000
  });
  const { isDark, toggleTheme } = useDarkMode();
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleFilterClick = (filter: FilterType) => {
    setFilter(filter);
  };

  const handleStockClick = (stock: StockData) => {
    setSelectedStock(stock);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedStock(null);
  };

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止触发卡片点击
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000); // 2秒后清除提示
    }).catch((err) => {
      console.error('复制失败:', err);
    });
  };
  return (
    <div className="pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-4 py-3 max-w-md mx-auto">
          <div>
            <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">LOF 套利监控</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">实时行情 · T+2 结算</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center rounded-full p-2 text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? '切换到浅色模式' : '切换到深色模式'}
            >
              <span className="material-symbols-outlined text-2xl">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center justify-center rounded-full p-2 text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-2xl ${loading ? 'animate-spin' : ''}`}>
                {loading ? 'progress_activity' : 'refresh'}
              </span>
            </button>
            <button className="relative flex items-center justify-center rounded-full p-2 text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined text-2xl">notifications</span>
              {stats.newOpportunities > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary border-2 border-white dark:border-slate-900"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto">

      {/* Summary Cards */}
      <section className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex-1 rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wider">套利机会</span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {loading ? '--' : stats.totalCount}
                </span>
                <span className="mb-1 text-xs font-bold text-emerald-500">
                  {stats.qualityCount}个优质
                </span>
              </div>
            </div>
          </div>
          <div className="flex-1 rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wider">平均评分</span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {loading ? '--' : `${stats.avgScore.toFixed(0)}`}
                </span>
                <span className={`mb-1 text-xs font-bold flex items-center ${stats.avgScore >= 60 ? 'text-emerald-500' : 'text-orange-500'}`}>
                  <span className="material-symbols-outlined text-[12px] mr-0.5">
                    {stats.avgScore >= 60 ? 'trending_up' : 'trending_down'}
                  </span>
                  {stats.avgScore >= 60 ? '良好' : '一般'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="px-4 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleFilterClick('all')}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              currentFilter === 'all'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary/30'
            }`}
          >
            <span>全部</span>
          </button>
          <button
            onClick={() => handleFilterClick('quality')}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              currentFilter === 'quality'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-600/30'
            }`}
          >
            <span>🏆 优质</span>
          </button>
          <button
            onClick={() => handleFilterClick('premium')}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              currentFilter === 'premium'
                ? 'bg-market-red text-white shadow-lg shadow-market-red/20'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-market-red/30'
            }`}
          >
            <span>高溢价</span>
          </button>
          <button
            onClick={() => handleFilterClick('discount')}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              currentFilter === 'discount'
                ? 'bg-market-green text-white shadow-lg shadow-market-green/20'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-market-green/30'
            }`}
          >
            <span>高折价</span>
          </button>
          <button
            onClick={() => handleFilterClick('safe')}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              currentFilter === 'safe'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-600/30'
            }`}
          >
            <span>🛡️ 安全</span>
          </button>
        </div>
      </section>

      {/* List Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2">
        <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-200">套利机会列表</h3>
        <span className="text-xs text-slate-400 dark:text-slate-500">共 {data.length} 个</span>
      </div>

      {/* List */}
      <div className="space-y-3 px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500">加载数据中...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-center px-4">
              <span className="material-symbols-outlined text-4xl text-loss-red">error</span>
              <p className="text-sm text-slate-600">{error}</p>
              <button
                onClick={refresh}
                className="mt-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark transition-colors"
              >
                重新加载
              </button>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-slate-300">inbox</span>
              <p className="text-sm text-slate-500">暂无套利机会</p>
            </div>
          </div>
        ) : (
          data.map((stock) => {
            const score = evaluateOpportunityScore(stock);
            const grade = getOpportunityGrade(score);

            return (
          <div
            key={stock.id}
            className="flex flex-col rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleStockClick(stock)}
          >
            <div className="p-4 flex flex-col gap-3">
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[16px] font-bold text-slate-800 dark:text-white">
                      {stock.name}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${grade.bgColor} ${grade.color}`}>
                      {grade.label} {score}分
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={(e) => handleCopyCode(stock.code, e)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors group"
                      title="点击复制代码"
                    >
                      <span className="text-slate-700 dark:text-slate-200 font-mono text-sm font-semibold">{stock.code}</span>
                      <span className={`material-symbols-outlined text-[14px] transition-all ${
                        copiedCode === stock.code
                          ? 'text-emerald-500'
                          : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`}>
                        {copiedCode === stock.code ? 'check' : 'content_copy'}
                      </span>
                    </button>
                    <div className="flex w-fit items-center rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {stock.exchange === 'SZ' ? '深 SZ' : '沪 SH'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">
                      {stock.arrivalDays}
                    </span>
                  </div>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  stock.premiumRate > 0
                    ? 'bg-market-red/10 text-market-red border-market-red/20'
                    : 'bg-market-green/10 text-market-green border-market-green/20'
                }`}>
                  {stock.premiumRate > 0 ? '+' : ''}{stock.premiumRate.toFixed(2)}%
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-4 gap-3 mt-1">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-medium">价格</span>
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-white mt-0.5">
                    {stock.price.toFixed(3)}
                  </p>
                  <span className={`text-[9px] font-bold mt-0.5 ${stock.priceChangePercent > 0 ? 'text-market-red' : 'text-market-green'}`}>
                    {stock.priceChangePercent > 0 ? '+' : ''}{stock.priceChangePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-medium">成交额</span>
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-white mt-0.5">
                    {formatAmount(stock.amount)}
                  </p>
                  <span className={`text-[9px] font-bold mt-0.5 ${
                    (stock.amount || 0) >= 50000000 ? 'text-emerald-600' :
                    (stock.amount || 0) >= 30000000 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {(stock.amount || 0) >= 50000000 ? '✓ 安全' :
                     (stock.amount || 0) >= 30000000 ? '⚠ 一般' : '✗ 风险'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-medium">费用率</span>
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-white mt-0.5">
                    {stock.fees?.total.toFixed(2)}%
                  </p>
                  <span className={`text-[9px] font-bold mt-0.5 ${
                    (stock.fees?.total || 0) <= 0.3 ? 'text-emerald-600' :
                    (stock.fees?.total || 0) <= 0.6 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {(stock.fees?.total || 0) <= 0.3 ? '✓ 低' :
                     (stock.fees?.total || 0) <= 0.6 ? '⚠ 中' : '✗ 高'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-medium">收益</span>
                  <p className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {(stock.profitPotential || 0).toFixed(2)}%
                  </p>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                    预估
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  {stock.riskLevel && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      stock.riskLevel === 'low' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                      stock.riskLevel === 'medium' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {stock.riskLevel === 'low' ? '🟢 低风险' :
                       stock.riskLevel === 'medium' ? '🟡 中风险' : '🔴 高风险'}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    波动率: {(stock.volatility || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-primary dark:text-primary font-bold">
                  <span>查看详情</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </div>
              </div>
            </div>
          </div>
          );
        })
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedStock && (
        <LOFDetailModal stock={selectedStock} onClose={handleCloseModal} />
      )}
      </main>
    </div>
  );
};

export default MonitorView;
