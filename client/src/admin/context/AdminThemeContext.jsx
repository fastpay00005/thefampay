import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminThemeContext = createContext({
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const AdminThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('fampay_admin_theme');
    return saved !== null ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('fampay_admin_theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);
  const setTheme = (theme) => setIsDark(theme === 'dark');

  return (
    <AdminThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => useContext(AdminThemeContext);
