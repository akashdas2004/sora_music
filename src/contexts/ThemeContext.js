import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { colors as defaultColors } from '../constants/colors';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [colors, setColors] = useState(defaultColors);

  useEffect(() => {
    // You could use device theme if you want
    // setIsDarkMode(deviceTheme === 'dark');
  }, [deviceTheme]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Update colors based on theme
  useEffect(() => {
    if (isDarkMode) {
      setColors(defaultColors); // Dark theme colors
    } else {
      // Light theme colors (if you want to implement)
      setColors({
        ...defaultColors,
        background: '#f8f8f8',
        card: '#ffffff',
        text: '#121212',
        textSecondary: '#555555',
        border: '#e0e0e0',
      });
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};