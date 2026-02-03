/**
 * 交易账户管理弹窗
 * 显示、添加、编辑、删除交易账户
 */

import React, { useState } from 'react';
import { TradingAccount } from '../types';
import { useTradingAccounts } from '../hooks/useTradingAccounts';

interface AccountManagementModalProps {
  onClose: () => void;
}

const AccountManagementModal: React.FC<AccountManagementModalProps> = ({ onClose }) => {
  const { accounts, addAccount, updateAccount, deleteAccount, setDefaultAccount } = useTradingAccounts();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TradingAccount | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    broker: '',
    accountNumber: '',
    purchaseFee: 0.12,
    redeemFee: 0.05,
    tradingFee: 0.03
  });

  const resetForm = () => {
    setFormData({
      name: '',
      broker: '',
      accountNumber: '',
      purchaseFee: 0.12,
      redeemFee: 0.05,
      tradingFee: 0.03
    });
    setShowAddForm(false);
    setEditingAccount(null);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.broker) {
      alert('请填写账户名称和券商名称');
      return;
    }

    if (editingAccount) {
      // 更新账户
      updateAccount(editingAccount.id, {
        name: formData.name,
        broker: formData.broker,
        accountNumber: formData.accountNumber,
        fees: {
          purchase: formData.purchaseFee,
          redeem: formData.redeemFee,
          trading: formData.tradingFee
        }
      });
    } else {
      // 添加新账户
      addAccount({
        name: formData.name,
        broker: formData.broker,
        accountNumber: formData.accountNumber,
        fees: {
          purchase: formData.purchaseFee,
          redeem: formData.redeemFee,
          trading: formData.tradingFee
        },
        isDefault: accounts.length === 0
      });
    }

    resetForm();
  };

  const handleEdit = (account: TradingAccount) => {
    setFormData({
      name: account.name,
      broker: account.broker,
      accountNumber: account.accountNumber,
      purchaseFee: account.fees.purchase,
      redeemFee: account.fees.redeem,
      tradingFee: account.fees.trading
    });
    setEditingAccount(account);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个账户吗？')) {
      deleteAccount(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">交易账户管理</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* 账户列表 */}
          {!showAddForm && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">已添加 {accounts.length} 个账户</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>添加账户</span>
                </button>
              </div>

              {accounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">account_balance</span>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">暂无交易账户</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">添加账户后可快速选择费率</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {accounts.map((account) => (
                    <div
                      key={account.id}
                      className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{account.name}</h3>
                            {account.isDefault && (
                              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                                默认
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{account.broker}</p>
                          {account.accountNumber && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                              {account.accountNumber}
                            </p>
                          )}

                          {/* 费率信息 */}
                          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                            <div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">申购费</p>
                              <p className="text-xs font-semibold text-slate-900 dark:text-white">{account.fees.purchase}%</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">赎回费</p>
                              <p className="text-xs font-semibold text-slate-900 dark:text-white">{account.fees.redeem}%</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">交易佣金</p>
                              <p className="text-xs font-semibold text-slate-900 dark:text-white">{account.fees.trading}%</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 ml-2">
                          <button
                            onClick={() => handleEdit(account)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(account.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-lg">delete</span>
                          </button>
                        </div>
                      </div>

                      {/* 设为默认按钮 */}
                      {!account.isDefault && (
                        <button
                          onClick={() => setDefaultAccount(account.id)}
                          className="w-full mt-3 py-1.5 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                        >
                          设为默认账户
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* 添加/编辑表单 */}
          {showAddForm && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <button
                  onClick={resetForm}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">arrow_back</span>
                </button>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingAccount ? '编辑账户' : '添加账户'}
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">账户名称</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                    placeholder="如：华泰证券主账户"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">券商名称</label>
                  <input
                    type="text"
                    value={formData.broker}
                    onChange={(e) => setFormData(prev => ({ ...prev, broker: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                    placeholder="如：华泰证券"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">账户号码（可选）</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-mono"
                    placeholder="123****890"
                  />
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">费率设置</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">申购费 %</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.purchaseFee}
                        onChange={(e) => setFormData(prev => ({ ...prev, purchaseFee: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">赎回费 %</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.redeemFee}
                        onChange={(e) => setFormData(prev => ({ ...prev, redeemFee: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">交易佣金 %</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.tradingFee}
                        onChange={(e) => setFormData(prev => ({ ...prev, tradingFee: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={resetForm}
                    className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
                  >
                    {editingAccount ? '保存' : '添加'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountManagementModal;
