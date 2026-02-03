import React from 'react';
import { HoldingData } from '../types';

const mockHoldings: HoldingData[] = [
  {
    id: '1',
    name: '华宝油气',
    code: '162411',
    type: 'T+2 套利周期',
    status: 'Waiting Confirm',
    statusText: '等待确认 T+1',
    statusColor: 'warning',
    progress: 66,
    purchaseDate: '10-24',
    estimatedSellDate: '10-26',
    price: 0.542,
    cost: 0.528,
    feeAmount: 12.50,
    unrealizedProfit: 840.00,
    unrealizedProfitPercent: 2.65
  },
  {
    id: '2',
    name: '纳斯达克LOF',
    code: '161121',
    type: 'T+0 盘中套利',
    status: 'Ready',
    statusText: '已就绪',
    statusColor: 'success',
    progress: 100,
    purchaseDate: '10-25',
    price: 1.284,
    cost: 1.250,
    feeAmount: 4.80,
    unrealizedProfit: 2105.40,
    unrealizedProfitPercent: 4.21,
    canRedeem: true
  },
  {
    id: '3',
    name: '黄金基金',
    code: '161217',
    type: 'T+3 海外套利',
    status: 'Locked',
    statusText: '锁定期 T+0',
    statusColor: 'slate',
    progress: 25,
    purchaseDate: '10-25',
    estimatedSellDate: '10-29',
    price: 4.102,
    cost: 4.150,
    feeText: '计算中...',
    unrealizedProfit: -42.00,
    unrealizedProfitPercent: -1.15
  }
];

const HoldingsView: React.FC = () => {
  return (
    <div className="pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center h-12 px-4 justify-between max-w-md mx-auto">
          <div className="w-10 flex items-center justify-start">
            <button className="p-1">
              <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">notifications</span>
            </button>
          </div>
          <h1 className="text-[17px] font-bold tracking-tight text-slate-800 dark:text-white">持仓账本</h1>
          <div className="w-10 flex items-center justify-end">
            <button className="p-1">
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">add_circle</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {/* Stats Cards */}
        <div className="flex gap-3 p-4">
          <div className="flex-1 rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">浮动盈亏</p>
            <p className="text-profit-green text-lg font-bold leading-tight">+¥12,450.00</p>
            <div className="flex items-center gap-0.5 text-profit-green text-[11px] font-semibold mt-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>+5.24%</span>
            </div>
          </div>
          <div className="flex-1 rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">累计实现盈亏</p>
            <p className="text-loss-red text-lg font-bold leading-tight">-¥3,240.50</p>
            <div className="flex items-center gap-0.5 text-loss-red text-[11px] font-semibold mt-1">
              <span className="material-symbols-outlined text-[14px]">trending_down</span>
              <span>-1.12%</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4">
          <div className="flex border-b border-slate-200 dark:border-slate-700 gap-8">
            <a className="relative flex flex-col items-center justify-center pb-3 pt-2 text-primary-dark cursor-pointer">
              <p className="text-sm font-bold">全部持仓</p>
              <div className="absolute bottom-0 w-8 h-0.5 bg-primary-dark rounded-full"></div>
            </a>
            <a className="flex flex-col items-center justify-center pb-3 pt-2 text-slate-500 dark:text-slate-400 cursor-pointer">
              <p className="text-sm font-medium">已申购</p>
            </a>
            <a className="flex flex-col items-center justify-center pb-3 pt-2 text-slate-500 dark:text-slate-400 cursor-pointer">
              <p className="text-sm font-medium">已到账</p>
            </a>
          </div>
        </div>

        {/* List Header */}
        <div className="flex items-center justify-between px-4 pt-6 pb-2">
          <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-200">活跃套利组合</h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">共 4 笔</span>
        </div>

        {/* List Items */}
        <div className="space-y-3 px-4 pb-4">
          {mockHoldings.map((holding) => (
            <div key={holding.id} className={`flex flex-col rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden ${holding.status === 'Locked' ? 'opacity-90' : ''}`}>
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
                    'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                  }`}>
                    {holding.statusText}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1">
                  <div
                    className={`absolute top-0 left-0 h-full rounded-full ${
                        holding.statusColor === 'success' ? 'bg-profit-green' : 'bg-primary-dark'
                    }`}
                    style={{ width: `${holding.progress}%`, opacity: holding.status === 'Locked' ? 0.3 : 1 }}
                  ></div>
                </div>

                {/* Dates */}
                <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 -mt-1">
                  <span>{holding.canRedeem ? '买入' : '申购'} {holding.purchaseDate}</span>
                  <span>{holding.canRedeem ? '即时可赎' : `预计 ${holding.estimatedSellDate || '可卖 ' + holding.estimatedSellDate}`}</span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">现价 / 成本</span>
                    <p className="text-[14px] font-semibold text-slate-800 dark:text-white">
                      {holding.price.toFixed(3)} <span className="text-slate-400 dark:text-slate-500 font-normal">/ {holding.cost.toFixed(3)}</span>
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">{holding.feeText ? '费用明细' : '预估手续费'}</span>
                    <p className="text-[14px] font-semibold text-slate-400 dark:text-slate-500">
                      {holding.feeText || `¥${holding.feeAmount?.toFixed(2)}`}
                    </p>
                  </div>
                </div>

                {/* Footer / Action */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-700">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">{holding.status === 'Locked' ? '浮动盈亏' : '未实现利润'}</span>
                    <p className={`text-[16px] font-bold ${holding.unrealizedProfit >= 0 ? 'text-profit-green' : 'text-loss-red'}`}>
                      {holding.unrealizedProfit >= 0 ? '+' : ''}¥{holding.unrealizedProfit.toFixed(2)}
                      <span className="text-[12px] font-semibold ml-1">
                         ({holding.unrealizedProfitPercent >= 0 ? '+' : ''}{holding.unrealizedProfitPercent}%)
                      </span>
                    </p>
                  </div>
                  <button className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
                    holding.canRedeem
                      ? 'bg-primary-dark text-white shadow-sm hover:bg-primary-dark/90'
                      : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                  }`}>
                    {holding.canRedeem ? '卖出结算' : (holding.status === 'Locked' ? '管理' : '详情')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HoldingsView;
