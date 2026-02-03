import React, { useState } from 'react';
import CacheManager from './CacheManager';
import AccountManagementModal from './AccountManagementModal';

interface SettingItem {
  id: string;
  label: string;
  type: 'toggle' | 'action' | 'info';
  value?: boolean;
  info?: string;
  icon: string;
  color?: string;
}

const SettingsView: React.FC = () => {
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [settings, setSettings] = useState<SettingItem[]>([
    {
      id: 'notifications',
      label: '价格提醒',
      type: 'toggle',
      value: true,
      info: '溢价率达到目标时推送',
      icon: 'notifications_active',
      color: 'text-primary'
    },
    {
      id: 'autoRefresh',
      label: '自动刷新',
      type: 'toggle',
      value: true,
      info: '每2分钟自动更新行情',
      icon: 'sync',
      color: 'text-emerald-500'
    },
    {
      id: 'darkMode',
      label: '深色模式',
      type: 'toggle',
      value: false,
      info: '跟随系统或手动设置',
      icon: 'dark_mode',
      color: 'text-slate-600 dark:text-slate-400'
    }
  ]);

  const handleToggle = (id: string) => {
    setSettings(prev => prev.map(setting =>
      setting.id === id ? { ...setting, value: !setting.value } : setting
    ));
  };

  return (
    <div className="pb-24 min-h-screen bg-bg-light dark:bg-bg-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center h-12 px-4 justify-between max-w-md mx-auto">
          <div className="w-10"></div>
          <h1 className="text-[17px] font-bold tracking-tight text-slate-800 dark:text-white">设置</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {/* User Info Card */}
        <div className="p-4">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl">account_circle</span>
              </div>
              <div>
                <h2 className="text-lg font-bold">投资者</h2>
                <p className="text-sm text-white/80 mt-1">账户 ID: LOF******2024</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Groups */}
        <div className="px-4 space-y-6">
          {/* General Settings */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-1">通用设置</h3>
            <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
              {settings.map((setting, index) => (
                <div
                  key={setting.id}
                  className={`flex items-center justify-between p-4 ${
                    index !== settings.length - 1 ? 'border-b border-slate-50 dark:border-slate-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${setting.color || 'text-slate-400'}`}>
                      {setting.icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{setting.label}</p>
                      {setting.info && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{setting.info}</p>
                      )}
                    </div>
                  </div>
                  {setting.type === 'toggle' && (
                    <button
                      onClick={() => handleToggle(setting.id)}
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        setting.value ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                          setting.value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Data Management */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-1">账户管理</h3>

            {/* 交易账户管理 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setShowAccountModal(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">account_balance</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">交易账户</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">管理券商账户和费率</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">chevron_right</span>
              </button>
            </div>
          </section>

          {/* Data Management */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-1">数据管理</h3>

            {/* 缓存管理器 */}
            <CacheManager />

            {/* 其他数据操作 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 mt-4">
              <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-500">download</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">导出持仓数据</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">chevron_right</span>
              </button>
            </div>
          </section>

          {/* About */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-1">关于</h3>
            <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="p-4 border-b border-slate-50 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">版本</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">v1.0.0</span>
                </div>
              </div>
              <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <span className="text-sm font-semibold text-slate-800 dark:text-white">使用条款</span>
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">chevron_right</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 border-t border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <span className="text-sm font-semibold text-slate-800 dark:text-white">隐私政策</span>
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">chevron_right</span>
              </button>
            </div>
          </section>
        </div>

        {/* Logout Button */}
        <div className="px-4 mt-8 mb-6">
          <button className="w-full bg-white dark:bg-slate-800 border-2 border-loss-red/20 dark:border-loss-red/30 text-loss-red rounded-xl py-3 font-bold hover:bg-loss-red/5 dark:hover:bg-loss-red/10 transition-colors">
            退出登录
          </button>
        </div>
      </main>

      {/* 账户管理弹窗 */}
      {showAccountModal && (
        <AccountManagementModal onClose={() => setShowAccountModal(false)} />
      )}
    </div>
  );
};

export default SettingsView;
