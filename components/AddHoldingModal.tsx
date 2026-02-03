/**
 * 添加持仓弹窗 - 优化版
 * 只需输入基金代码，其他信息自动获取
 * 支持选择交易账户，自动带出费率
 */

import React, { useState, useEffect } from 'react';
import { StockData } from '../types';
import { fetchLofByCode } from '../services/api';
import { useTradingAccounts } from '../hooks/useTradingAccounts';

interface AddHoldingModalProps {
  onClose: () => void;
  onAdd: (data: {
    name: string;
    code: string;
    exchange: 'SZ' | 'SH';
    type: string;
    purchaseDate: string;
    purchasePrice: number;
    shares: number;
    currentPrice: number;
    fees: { purchase: number; redeem: number; trading: number; total: number };
    transferDays: number;
    estimatedSellDate: string;
    notes?: string;
  }) => void;
  stockData?: StockData; // 从监控页面传入的数据
}

const AddHoldingModal: React.FC<AddHoldingModalProps> = ({ onClose, onAdd, stockData }) => {
  const today = new Date().toISOString().split('T')[0];
  const { accounts, defaultAccount } = useTradingAccounts();

  const [code, setCode] = useState(stockData?.code || '');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(defaultAccount?.id || '');
  const [fundInfo, setFundInfo] = useState<{
    name: string;
    exchange: 'SZ' | 'SH';
    iopv: number;
    fees: { purchase: number; redeem: number; trading: number };
  } | null>(stockData ? {
    name: stockData.name,
    exchange: stockData.exchange,
    iopv: stockData.iopv,
    fees: stockData.fees || { purchase: 0.12, redeem: 0.05, trading: 0.03 }
  } : null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    purchaseDate: today,
    purchasePrice: stockData?.iopv || 0,
    purchaseAmount: 10000, // 申购金额（用户输入）
    currentPrice: stockData?.iopv || 0,
    purchaseFee: defaultAccount?.fees.purchase || 0.12,
    redeemFee: defaultAccount?.fees.redeem || 0.05,
    tradingFee: defaultAccount?.fees.trading || 0.03,
    transferDays: stockData?.transferDays || 2,
    notes: ''
  });

  // 当选择的账户改变时，自动更新费率
  useEffect(() => {
    if (selectedAccountId) {
      const account = accounts.find(acc => acc.id === selectedAccountId);
      if (account) {
        setFormData(prev => ({
          ...prev,
          purchaseFee: account.fees.purchase,
          redeemFee: account.fees.redeem,
          tradingFee: account.fees.trading
        }));
      }
    }
  }, [selectedAccountId, accounts]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 根据代码查询基金信息
  const handleCodeChange = async (inputCode: string) => {
    setCode(inputCode);
    setError('');

    // 清除之前的基金信息
    if (!inputCode.trim()) {
      setFundInfo(null);
      return;
    }

    // 代码长度检查（LOF代码通常是6位数字）
    if (inputCode.length !== 6) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const lofData = await fetchLofByCode(inputCode);

      if (lofData) {
        const cell = lofData.cell;
        const exchange = cell.stock_cd.startsWith('sz') ? 'SZ' : 'SH';
        const iopv = parseFloat(cell.estimate_value || cell.price);

        setFundInfo({
          name: cell.fund_nm,
          exchange: exchange,
          iopv: iopv,
          fees: {
            purchase: 0.12,
            redeem: 0.05,
            trading: 0.03
          }
        });

        // 自动填充价格
        setFormData(prev => ({
          ...prev,
          purchasePrice: iopv,
          currentPrice: iopv
        }));
      } else {
        setError('未找到该基金代码，请检查是否正确');
        setFundInfo(null);
      }
    } catch (err) {
      console.error('查询基金信息失败:', err);
      setError('查询失败，请稍后重试');
      setFundInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedSellDate = () => {
    const date = new Date(formData.purchaseDate);
    date.setDate(date.getDate() + formData.transferDays);
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
  };

  const handleSubmit = () => {
    if (!fundInfo) {
      alert('请先输入基金代码并查询基金信息');
      return;
    }

    if (formData.purchasePrice <= 0 || formData.purchaseAmount <= 0) {
      alert('请填写有效的申购价格和申购金额');
      return;
    }

    const totalFees = formData.purchaseFee + formData.redeemFee + formData.tradingFee * 2;

    onAdd({
      name: fundInfo.name,
      code: code,
      exchange: fundInfo.exchange,
      type: `T+${formData.transferDays} 套利周期`,
      purchaseDate: new Date(formData.purchaseDate).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
      purchasePrice: formData.purchasePrice,
      shares: calculatedShares,
      currentPrice: formData.currentPrice,
      fees: {
        purchase: formData.purchaseFee,
        redeem: formData.redeemFee,
        trading: formData.tradingFee,
        total: totalFees
      },
      transferDays: formData.transferDays,
      estimatedSellDate: calculateEstimatedSellDate(),
      notes: formData.notes
    });

    onClose();
  };

  // 计算实际份额：申购金额扣除申购费用后 / 申购价格
  const purchaseFeeAmount = formData.purchaseAmount * (formData.purchaseFee / 100);
  const netPurchaseAmount = formData.purchaseAmount - purchaseFeeAmount; // 扣除申购费后的净申购金额
  const calculatedShares = formData.purchasePrice > 0 ? Math.floor(netPurchaseAmount / formData.purchasePrice) : 0; // 份额向下取整

  // 实际成本（包含申购费）
  const totalCost = formData.purchaseAmount;
  const costPerShare = calculatedShares > 0 ? totalCost / calculatedShares : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">添加持仓</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* 基金代码查询 */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">基金代码</h3>

            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                maxLength={6}
                className="w-full px-3 py-3 pr-10 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg font-bold text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                placeholder="输入6位基金代码，如：162411"
                disabled={!!stockData}
              />
              {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
              )}
              {fundInfo && !loading && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-500">
                  check_circle
                </span>
              )}
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-base">error</span>
                  <p className="text-xs text-red-800 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* 基金信息显示 */}
            {fundInfo && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg">done_all</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">{fundInfo.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-emerald-800 dark:text-emerald-300">
                      <span className="font-mono font-semibold">{code}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-800/50 font-bold">
                        {fundInfo.exchange === 'SZ' ? '深圳' : '上海'}
                      </span>
                      <span>IOPV: ¥{fundInfo.iopv.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 申购信息 - 只有查询到基金后才显示 */}
          {fundInfo && (
            <>
              {/* 选择交易账户 */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">交易账户</h3>

                {accounts.length === 0 ? (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-base">info</span>
                      <div>
                        <p className="text-xs text-orange-800 dark:text-orange-300">
                          暂无交易账户，将使用默认费率
                        </p>
                        <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                          建议在设置中添加账户以快速选择费率
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-medium"
                  >
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} - {account.broker} (申购{account.fees.purchase}% 赎回{account.fees.redeem}% 佣金{account.fees.trading}%)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">申购信息</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">申购日期</label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => handleChange('purchaseDate', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">转托管天数</label>
                    <select
                      value={formData.transferDays}
                      onChange={(e) => handleChange('transferDays', parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                    >
                      <option value={1}>T+1</option>
                      <option value={2}>T+2</option>
                      <option value={3}>T+3</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">申购价格（IOPV）</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.purchasePrice}
                      onChange={(e) => handleChange('purchasePrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">申购金额（元）</label>
                    <input
                      type="number"
                      value={formData.purchaseAmount}
                      onChange={(e) => handleChange('purchaseAmount', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                      placeholder="10000"
                    />
                  </div>
                </div>

                {/* 自动计算的份额显示 */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">预计获得份额</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {calculatedShares.toLocaleString()} 份
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1">
                    = (申购金额 - 申购费) / 申购价格
                  </p>
                </div>
              </div>

              {/* 费用设置 */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">费用设置</h3>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">申购费率 %</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.purchaseFee}
                      onChange={(e) => handleChange('purchaseFee', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">赎回费率 %</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.redeemFee}
                      onChange={(e) => handleChange('redeemFee', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">交易佣金 %</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.tradingFee}
                      onChange={(e) => handleChange('tradingFee', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 成本预览 */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg">calculate</span>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-bold text-blue-900 dark:text-blue-200">成本计算</p>
                    <div className="text-xs text-blue-800 dark:text-blue-300 space-y-0.5">
                      <p>申购金额: ¥{formData.purchaseAmount.toFixed(2)}</p>
                      <p>申购费用 ({formData.purchaseFee}%): -¥{purchaseFeeAmount.toFixed(2)}</p>
                      <p>净申购金额: ¥{netPurchaseAmount.toFixed(2)}</p>
                      <p className="font-bold">预计份额: {calculatedShares.toLocaleString()} 份</p>
                      <p className="font-bold">成本价: {costPerShare.toFixed(3)} 元/份</p>
                      <p>预计到账: {calculateEstimatedSellDate()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 备注 */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">备注（可选）</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none"
                  placeholder="记录套利策略或其他信息..."
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-3 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!fundInfo || loading}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            添加持仓
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddHoldingModal;
