/**
 * 持仓详情弹窗
 * 查看持仓详细信息、编辑备注、删除持仓
 */

import React, { useState } from 'react';
import { HoldingData } from '../types';

interface HoldingDetailModalProps {
  holding: HoldingData;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<HoldingData>) => void;
  onDelete: (id: string) => void;
  onSell: (holding: HoldingData) => void;
}

const HoldingDetailModal: React.FC<HoldingDetailModalProps> = ({
  holding,
  onClose,
  onUpdate,
  onDelete,
  onSell
}) => {
  const [notes, setNotes] = useState(holding.notes || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveNotes = () => {
    onUpdate(holding.id, { notes });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`确定要删除持仓「${holding.name}」吗？`)) {
      onDelete(holding.id);
      onClose();
    }
  };

  const totalCost = holding.cost * holding.shares;
  const currentValue = holding.currentPrice * holding.shares;
  const profitLossColor = holding.unrealizedProfit >= 0 ? 'text-profit-green' : 'text-loss-red';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{holding.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{holding.code} · {holding.exchange}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* 状态卡片 */}
          <div className={`rounded-xl p-4 border-2 ${
            holding.status === 'completed' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
            holding.statusColor === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' :
            holding.statusColor === 'warning' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
            'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium opacity-80">{holding.type}</p>
                <p className="text-2xl font-bold mt-1">{holding.statusText}</p>
                <div className="mt-2 w-full h-2 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      holding.statusColor === 'success' ? 'bg-profit-green' :
                      holding.statusColor === 'warning' ? 'bg-warning' :
                      holding.statusColor === 'blue' ? 'bg-blue-500' :
                      'bg-slate-400'
                    }`}
                    style={{ width: `${holding.progress}%` }}
                  />
                </div>
              </div>
              <div className="text-4xl opacity-20">
                {holding.status === 'completed' ? '✓' :
                 holding.canRedeem ? '🎯' :
                 holding.status === 'pending' ? '⏳' : '🔒'}
              </div>
            </div>
          </div>

          {/* 盈亏概览 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">盈亏概览</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">持仓市值</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">¥{currentValue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">持仓成本</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">¥{totalCost.toFixed(2)}</span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {holding.status === 'completed' ? '已实现盈亏' : '未实现盈亏'}
                </span>
                <div className="text-right">
                  <p className={`text-lg font-bold ${profitLossColor}`}>
                    {holding.unrealizedProfit >= 0 ? '+' : ''}¥{holding.unrealizedProfit.toFixed(2)}
                  </p>
                  <p className={`text-xs font-bold ${profitLossColor}`}>
                    {holding.unrealizedProfitPercent >= 0 ? '+' : ''}{holding.unrealizedProfitPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 详细信息 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">详细信息</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">申购日期</span>
                <span className="font-semibold text-slate-900 dark:text-white">{holding.purchaseDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">预计到账</span>
                <span className="font-semibold text-slate-900 dark:text-white">{holding.estimatedSellDate}</span>
              </div>
              {holding.actualSellDate && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">实际卖出</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{holding.actualSellDate}</span>
                </div>
              )}
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">申购价格</span>
                <span className="font-semibold text-slate-900 dark:text-white">¥{holding.purchasePrice.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">当前净值</span>
                <span className="font-semibold text-slate-900 dark:text-white">¥{holding.currentPrice.toFixed(3)}</span>
              </div>
              {holding.sellPrice && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">卖出价格</span>
                  <span className="font-semibold text-slate-900 dark:text-white">¥{holding.sellPrice.toFixed(3)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">持仓份额</span>
                <span className="font-semibold text-slate-900 dark:text-white">{holding.shares.toLocaleString()} 份</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">成本价</span>
                <span className="font-semibold text-slate-900 dark:text-white">¥{holding.cost.toFixed(3)}</span>
              </div>
            </div>
          </div>

          {/* 费用明细 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">费用明细</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">申购费率</span>
                <span className="font-semibold text-slate-900 dark:text-white">{holding.fees.purchase.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">赎回费率</span>
                <span className="font-semibold text-slate-900 dark:text-white">{holding.fees.redeem.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">交易佣金</span>
                <span className="font-semibold text-slate-900 dark:text-white">{holding.fees.trading.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">总费用率</span>
                <span className="font-semibold text-slate-900 dark:text-white">{holding.fees.total.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* 备注 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">备注</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  编辑
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none"
                  placeholder="记录套利策略或其他信息..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setNotes(holding.notes || '');
                      setIsEditing(false);
                    }}
                    className="flex-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="flex-1 py-1.5 rounded-lg bg-primary text-white text-xs font-bold"
                  >
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {holding.notes || '暂无备注'}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-3 flex gap-2">
          <button
            onClick={handleDelete}
            className="px-4 py-2.5 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            删除
          </button>
          {holding.canRedeem && holding.status !== 'completed' && (
            <button
              onClick={() => {
                onSell(holding);
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
            >
              卖出结算
            </button>
          )}
          {!holding.canRedeem && holding.status !== 'completed' && (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              关闭
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HoldingDetailModal;
