/**
 * 深色模式管理 Hook
 */

import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'lof_monitor_theme';

export const useDarkMode = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // 从 localStorage 读取保存的主题
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
    if (saved) return saved;

    // 如果没有保存，检查系统偏好
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 保存到 localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');

  return {
    theme,
    isDark,
    toggleTheme,
    setLightTheme,
    setDarkTheme
  };
};
