/**
 * 交易账户管理 Hook
 * 处理账户的增删改查，保存到 localStorage
 */

import { useState, useEffect } from 'react';
import { TradingAccount } from '../types';

const STORAGE_KEY = 'lof_trading_accounts';

interface UseTradingAccountsReturn {
  accounts: TradingAccount[];
  defaultAccount: TradingAccount | null;
  addAccount: (account: Omit<TradingAccount, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAccount: (id: string, updates: Partial<TradingAccount>) => void;
  deleteAccount: (id: string) => void;
  setDefaultAccount: (id: string) => void;
}

export const useTradingAccounts = (): UseTradingAccountsReturn => {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);

  // 从 localStorage 加载账户
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAccounts(parsed);
      } catch (error) {
        console.error('Failed to parse trading accounts:', error);
        setAccounts([]);
      }
    }
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    if (accounts.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    }
  }, [accounts]);

  // 添加账户
  const addAccount = (accountData: Omit<TradingAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newAccount: TradingAccount = {
      ...accountData,
      id: `account_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      // 如果是第一个账户，自动设为默认
      isDefault: accounts.length === 0 ? true : accountData.isDefault
    };

    // 如果设为默认，取消其他账户的默认状态
    if (newAccount.isDefault) {
      setAccounts(prev => [
        ...prev.map(acc => ({ ...acc, isDefault: false })),
        newAccount
      ]);
    } else {
      setAccounts(prev => [...prev, newAccount]);
    }
  };

  // 更新账户
  const updateAccount = (id: string, updates: Partial<TradingAccount>) => {
    setAccounts(prev => prev.map(account => {
      if (account.id === id) {
        return {
          ...account,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      // 如果更新的账户被设为默认，取消其他账户的默认状态
      if (updates.isDefault && account.id !== id) {
        return { ...account, isDefault: false };
      }
      return account;
    }));
  };

  // 删除账户
  const deleteAccount = (id: string) => {
    setAccounts(prev => {
      const filtered = prev.filter(acc => acc.id !== id);

      // 如果删除的是默认账户，且还有其他账户，将第一个设为默认
      const deletedAccount = prev.find(acc => acc.id === id);
      if (deletedAccount?.isDefault && filtered.length > 0) {
        filtered[0].isDefault = true;
      }

      return filtered;
    });
  };

  // 设置默认账户
  const setDefaultAccount = (id: string) => {
    setAccounts(prev => prev.map(account => ({
      ...account,
      isDefault: account.id === id,
      updatedAt: account.id === id ? new Date().toISOString() : account.updatedAt
    })));
  };

  // 获取默认账户
  const defaultAccount = accounts.find(acc => acc.isDefault) || accounts[0] || null;

  return {
    accounts,
    defaultAccount,
    addAccount,
    updateAccount,
    deleteAccount,
    setDefaultAccount
  };
};
