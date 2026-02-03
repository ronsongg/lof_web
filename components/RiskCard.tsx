import React from 'react';

const RiskCard: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-base font-bold text-slate-900 dark:text-white">资金与敞口周期</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">以 T 日 (今天) 申购为例</p>
        </div>
        <div className="flex items-center gap-1 rounded bg-orange-50 dark:bg-orange-900/20 px-2 py-1 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800">
          <span className="material-symbols-outlined text-[16px]">warning</span>
          <span className="text-[10px] font-bold uppercase">波动风险</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Progress Bar */}
        <div className="relative h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 flex overflow-hidden">
          <div className="w-1/2 bg-blue-500 relative">
            <div className="absolute inset-0 striped-bg"></div>
          </div>
          <div className="w-1/2 bg-orange-500"></div>
        </div>

        {/* Labels */}
        <div className="flex justify-between text-[10px] mt-1 relative">
          <div className="flex flex-col items-start relative z-10">
            <div className="absolute -top-3 left-0 w-0.5 h-2 bg-slate-300 dark:bg-slate-600"></div>
            <span className="font-bold text-slate-700 dark:text-slate-300">T 日 (申购)</span>
            <span className="text-blue-500 font-medium mt-0.5">资金冻结期</span>
          </div>
          <div className="flex flex-col items-center relative z-10 -ml-6">
             <div className="absolute -top-3 w-0.5 h-2 bg-slate-300 dark:bg-slate-600"></div>
            <span className="font-bold text-slate-700 dark:text-slate-300">T+1 (确认)</span>
            <span className="text-orange-500 font-medium mt-0.5">市场风险敞口</span>
          </div>
          <div className="flex flex-col items-end relative z-10">
            <div className="absolute -top-3 right-0 w-0.5 h-2 bg-emerald-500"></div>
            <span className="font-bold text-slate-700 dark:text-slate-300">T+2 (到账)</span>
            <span className="text-emerald-500 font-bold mt-0.5">可交易卖出</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 flex items-start gap-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
          <span className="material-symbols-outlined text-blue-500 text-[18px] mt-0.5">info</span>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            资金在 <span className="font-bold text-blue-600 dark:text-blue-400">T+0 ~ T+1</span> 为锁定期。在 <span className="font-bold text-orange-600 dark:text-orange-400">T+1 ~ T+2</span> 期间，您需承担市场波动带来的净值变化。
          </p>
        </div>
      </div>
    </div>
  );
};

export default RiskCard;
