/**
 * 持仓页面 - 完整功能版本
 * 支持添加、查看、编辑、删除持仓，Tab 筛选，自动更新状态
 */

import React, { useState, useEffect } from 'react';
import { useHoldings } from '../hooks/useHoldings';
import { HoldingData } from '../types';
import AddHoldingModal from './AddHoldingModal';
import HoldingDetailModal from './HoldingDetailModal';
import SellHoldingModal from './SellHoldingModal';

type TabType = 'all' | 'pending' | 'ready';

const HoldingsView: React.FC = () => {
  const {
    holdings,
    addHolding,
    updateHolding,
    deleteHolding,
    completeHolding,
    stats
  } = useHoldings();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<HoldingData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellHolding, setSellHolding] = useState<HoldingData | null>(null);

  // 过滤持仓
  const filteredHoldings = holdings.filter(h => {
    if (h.status === 'completed') return false; // 不显示已完成的

    switch (activeTab) {
      case 'pending':
        return h.status === 'pending' || h.status === 'locked';
      case 'ready':
        return h.status === 'ready';
      case 'all':
      default:
        return true;
    }
  });

  const handleAddHolding = (data: any) => {
    // 计算成本和盈亏
    const totalCost = data.purchasePrice * data.shares;
    const purchaseFeeAmount = totalCost * (data.fees.purchase / 100);
    const costWithFees = totalCost + purchaseFeeAmount;
    const costPerShare = costWithFees / data.shares;

    const currentValue = data.currentPrice * data.shares;
    const unrealizedProfit = currentValue - costWithFees;
    const unrealizedProfitPercent = (unrealizedProfit / costWithFees) * 100;

    addHolding({
      name: data.name,
      code: data.code,
      exchange: data.exchange,
      type: data.type,
      status: 'pending' as const,
      statusText: '等待确认',
      statusColor: 'warning' as const,
      progress: 0,
      purchaseDate: data.purchaseDate,
      purchasePrice: data.purchasePrice,
      shares: data.shares,
      cost: costPerShare,
      currentPrice: data.currentPrice,
      estimatedSellDate: data.estimatedSellDate,
      fees: data.fees,
      transferDays: data.transferDays,
      unrealizedProfit,
      unrealizedProfitPercent,
      canRedeem: false,
      notes: data.notes
    });
  };

  const handleHoldingClick = (holding: HoldingData) => {
    setSelectedHolding(holding);
    setShowDetailModal(true);
  };

  const handleSellClick = (holding: HoldingData) => {
    setSellHolding(holding);
    setShowSellModal(true);
  };

  const handleSellConfirm = (sellPrice: number) => {
    if (sellHolding) {
      completeHolding(sellHolding.id, sellPrice);
      setShowSellModal(false);
      setSellHolding(null);
    }
  };

  // 自动更新持仓净值（实际应该从API获取）
  useEffect(() => {
    const interval = setInterval(() => {
      holdings.forEach(holding => {
        if (holding.status !== 'completed') {
          // 模拟价格波动 ±0.5%
          const randomChange = (Math.random() - 0.5) * 0.01;
          const newPrice = holding.purchasePrice * (1 + randomChange);

          const currentValue = newPrice * holding.shares;
          const totalCost = holding.cost * holding.shares;
          const unrealizedProfit = currentValue - totalCost;
          const unrealizedProfitPercent = (unrealizedProfit / totalCost) * 100;

          updateHolding(holding.id, {
            currentPrice: newPrice,
            unrealizedProfit,
            unrealizedProfitPercent
          });
        }
      });
    }, 30000); // 每30秒更新一次

    return () => clearInterval(interval);
  }, [holdings, updateHolding]);

  return (
    <div className="pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center h-12 px-4 justify-between max-w-md mx-auto">
          <div className="w-10" />
          <h1 className="text-[17px] font-bold tracking-tight text-slate-800 dark:text-white">持仓账本</h1>
          <div className="w-10 flex items-center justify-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">add_circle</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {/* Stats Cards */}
        <div className="flex gap-3 p-4">
          <div className="flex-1 rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">未实现盈亏</p>
            <p className={`text-lg font-bold leading-tight ${
              stats.totalUnrealizedProfit >= 0 ? 'text-profit-green' : 'text-loss-red'
            }`}>
              {stats.totalUnrealizedProfit >= 0 ? '+' : ''}¥{stats.totalUnrealizedProfit.toFixed(2)}
            </p>
            <div className={`flex items-center gap-0.5 text-[11px] font-semibold mt-1 ${
              stats.totalUnrealizedProfit >= 0 ? 'text-profit-green' : 'text-loss-red'
            }`}>
              <span className="material-symbols-outlined text-[14px]">
                {stats.totalUnrealizedProfit >= 0 ? 'trending_up' : 'trending_down'}
              </span>
              <span>
                {stats.totalUnrealizedProfitPercent >= 0 ? '+' : ''}{stats.totalUnrealizedProfitPercent.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex-1 rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">已实现盈亏</p>
            <p className={`text-lg font-bold leading-tight ${
              stats.totalRealizedProfit >= 0 ? 'text-profit-green' : 'text-loss-red'
            }`}>
              {stats.totalRealizedProfit >= 0 ? '+' : ''}¥{stats.totalRealizedProfit.toFixed(2)}
            </p>
            <div className="flex items-center gap-0.5 text-slate-400 dark:text-slate-500 text-[11px] font-semibold mt-1">
              <span className="material-symbols-outlined text-[14px]">history</span>
              <span>{stats.completedCount} 笔完成</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4">
          <div className="flex border-b border-slate-200 dark:border-slate-700 gap-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`relative flex flex-col items-center justify-center pb-3 pt-2 ${
                activeTab === 'all' ? 'text-primary-dark' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <p className={`text-sm ${activeTab === 'all' ? 'font-bold' : 'font-medium'}`}>
                全部持仓
              </p>
              {activeTab === 'all' && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-primary-dark rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`relative flex flex-col items-center justify-center pb-3 pt-2 ${
                activeTab === 'pending' ? 'text-primary-dark' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <p className={`text-sm ${activeTab === 'pending' ? 'font-bold' : 'font-medium'}`}>
                锁定中
              </p>
              {activeTab === 'pending' && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-primary-dark rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('ready')}
              className={`relative flex flex-col items-center justify-center pb-3 pt-2 ${
                activeTab === 'ready' ? 'text-primary-dark' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <p className={`text-sm ${activeTab === 'ready' ? 'font-bold' : 'font-medium'}`}>
                可卖出
              </p>
              {activeTab === 'ready' && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-primary-dark rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* List Header */}
        <div className="flex items-center justify-between px-4 pt-6 pb-2">
          <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-200">
            {activeTab === 'all' ? '活跃套利组合' :
             activeTab === 'pending' ? '锁定期持仓' :
             '可卖出持仓'}
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">共 {filteredHoldings.length} 笔</span>
        </div>

        {/* List Items */}
        <div className="space-y-3 px-4 pb-4">
          {filteredHoldings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">inbox</span>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">暂无持仓</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark transition-colors"
              >
                添加持仓
              </button>
            </div>
          ) : (
            filteredHoldings.map((holding) => (
              <div
                key={holding.id}
                className={`flex flex-col rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
                  holding.status === 'locked' ? 'opacity-95' : ''
                }`}
                onClick={() => handleHoldingClick(holding)}
              >
                <div className="p-4 flex flex-col gap-3">
                  {/* Item Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-0.5">
                      <h4 className="text-[16px] font-bold text-slate-800 dark:text-white">
                        {holding.name} <span className="text-slate-400 dark:text-slate-500 font-normal text-sm ml-1">{holding.code}</span>
                      </h4>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">{holding.type}</span>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      holding.statusColor === 'warning' ? 'bg-warning/10 text-warning border-warning/20' :
                      holding.statusColor === 'success' ? 'bg-profit-green/10 text-profit-green border-profit-green/20' :
                      holding.statusColor === 'blue' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                      'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                    }`}>
                      {holding.statusText}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1">
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full ${
                        holding.statusColor === 'success' ? 'bg-profit-green' :
                        holding.statusColor === 'blue' ? 'bg-blue-500' :
                        'bg-primary-dark'
                      }`}
                      style={{ width: `${holding.progress}%`, opacity: holding.status === 'locked' ? 0.5 : 1 }}
                    />
                  </div>

                  {/* Dates */}
                  <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 -mt-1">
                    <span>申购 {holding.purchaseDate}</span>
                    <span>{holding.canRedeem ? '✓ 可卖出' : `预计 ${holding.estimatedSellDate}`}</span>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 mt-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">现价 / 成本</span>
                      <p className="text-[14px] font-semibold text-slate-800 dark:text-white">
                        {holding.currentPrice.toFixed(3)} <span className="text-slate-400 dark:text-slate-500 font-normal">/ {holding.cost.toFixed(3)}</span>
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">持仓份额</span>
                      <p className="text-[14px] font-semibold text-slate-800 dark:text-white">
                        {holding.shares.toLocaleString()} 份
                      </p>
                    </div>
                  </div>

                  {/* Footer / Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-700">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">未实现盈亏</span>
                      <p className={`text-[16px] font-bold ${holding.unrealizedProfit >= 0 ? 'text-profit-green' : 'text-loss-red'}`}>
                        {holding.unrealizedProfit >= 0 ? '+' : ''}¥{holding.unrealizedProfit.toFixed(2)}
                        <span className="text-[12px] font-semibold ml-1">
                          ({holding.unrealizedProfitPercent >= 0 ? '+' : ''}{holding.unrealizedProfitPercent.toFixed(2)}%)
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (holding.canRedeem) {
                          handleSellClick(holding);
                        } else {
                          handleHoldingClick(holding);
                        }
                      }}
                      className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
                        holding.canRedeem
                          ? 'bg-primary-dark text-white shadow-sm hover:bg-primary-dark/90'
                          : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                      }`}
                    >
                      {holding.canRedeem ? '卖出结算' : '详情'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modals */}
      {showAddModal && (
        <AddHoldingModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddHolding}
        />
      )}

      {showDetailModal && selectedHolding && (
        <HoldingDetailModal
          holding={selectedHolding}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedHolding(null);
          }}
          onUpdate={updateHolding}
          onDelete={deleteHolding}
          onSell={handleSellClick}
        />
      )}

      {showSellModal && sellHolding && (
        <SellHoldingModal
          holding={sellHolding}
          onClose={() => {
            setShowSellModal(false);
            setSellHolding(null);
          }}
          onConfirm={handleSellConfirm}
        />
      )}
    </div>
  );
};

export default HoldingsView;
