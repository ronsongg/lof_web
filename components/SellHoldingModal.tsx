/**
 * 卖出结算弹窗
 * 输入卖出价格并完成套利结算
 */

import React, { useState } from 'react';
import { HoldingData } from '../types';

interface SellHoldingModalProps {
  holding: HoldingData;
  onClose: () => void;
  onConfirm: (sellPrice: number) => void;
}

const SellHoldingModal: React.FC<SellHoldingModalProps> = ({ holding, onClose, onConfirm }) => {
  const [sellPrice, setSellPrice] = useState(holding.currentPrice);

  const totalShares = holding.shares;
  const totalCost = holding.cost * totalShares;
  const totalRevenue = sellPrice * totalShares;
  const tradingFee = totalRevenue * (holding.fees.trading / 100);
  const netRevenue = totalRevenue - tradingFee;
  const realizedProfit = netRevenue - totalCost;
  const realizedProfitPercent = (realizedProfit / totalCost) * 100;

  const handleConfirm = () => {
    if (sellPrice <= 0) {
      alert('请输入有效的卖出价格');
      return;
    }

    if (confirm(`确定以 ¥${sellPrice.toFixed(3)} 的价格卖出「${holding.name}」吗？`)) {
      onConfirm(sellPrice);
    }
  };

  const profitColor = realizedProfit >= 0 ? 'text-profit-green' : 'text-loss-red';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">卖出结算</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* 基金信息 */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{holding.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{holding.code} · {holding.shares.toLocaleString()} 份</p>
          </div>

          {/* 卖出价格输入 */}
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">卖出价格</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">¥</span>
              <input
                type="number"
                step="0.001"
                value={sellPrice}
                onChange={(e) => setSellPrice(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg font-bold text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                placeholder="0.000"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              当前净值参考: ¥{holding.currentPrice.toFixed(3)}
            </p>
          </div>

          {/* 结算预览 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg">calculate</span>
              <div className="flex-1 space-y-2">
                <p className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">结算预览</p>

                <div className="space-y-1.5 text-xs text-blue-800 dark:text-blue-300">
                  <div className="flex justify-between">
                    <span>持仓成本</span>
                    <span className="font-semibold">¥{totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>卖出金额</span>
                    <span className="font-semibold">¥{totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>交易费用 ({holding.fees.trading}%)</span>
                    <span className="font-semibold">-¥{tradingFee.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-blue-200 dark:bg-blue-700 my-1" />
                  <div className="flex justify-between">
                    <span>净收入</span>
                    <span className="font-semibold">¥{netRevenue.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-blue-200 dark:border-blue-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-blue-900 dark:text-blue-200">实现盈亏</span>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${profitColor}`}>
                        {realizedProfit >= 0 ? '+' : ''}¥{realizedProfit.toFixed(2)}
                      </p>
                      <p className={`text-xs font-bold ${profitColor}`}>
                        {realizedProfitPercent >= 0 ? '+' : ''}{realizedProfitPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 提示 */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-base">info</span>
              <p className="text-xs text-orange-800 dark:text-orange-300">
                请确认卖出价格准确无误。结算后将无法撤销，盈亏将计入历史记录。
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-3 flex gap-2 rounded-b-3xl sm:rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
          >
            确认卖出
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellHoldingModal;
