import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { theme, getThemedStyles } from '../styles';

// Theme context type definition
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  theme: typeof theme.light | typeof theme.dark;
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  setTheme: () => {},
  theme: theme.light,
});

// Custom hook for using the theme context
export const useTheme = () => useContext(ThemeContext);

// Theme provider component props
interface ThemeProviderProps {
  children: ReactNode;
}

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Get the device color scheme
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  // Listen for device theme changes
  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Set theme explicitly
  const setTheme = (isDark: boolean) => {
    setIsDarkMode(isDark);
  };

  // Get the current theme styles
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      isDarkMode,
      toggleTheme,
      setTheme,
      theme: currentTheme,
    }),
    [isDarkMode, currentTheme]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;
