import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Design';
import { useTheme as useThemeStore } from './useStores';

interface ThemeContextType {
  colors: typeof Colors.light;
  isDark: boolean;
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const { theme, setTheme } = useThemeStore();

  // Determine the effective theme
  const effectiveTheme =
    theme === 'auto' ? (systemColorScheme === 'dark' ? 'dark' : 'light') : theme;

  const isDark = effectiveTheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const value: ThemeContextType = {
    colors,
    isDark,
    theme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
