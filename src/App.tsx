import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { AppNavigator } from './navigation';
import * as Linking from 'expo-linking';

// Main App component
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PlayerProvider>
          <AppWithTheme />
        </PlayerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Separate component to use the theme after provider is setup
const AppWithTheme = () => {
  const { isDarkMode } = useTheme();
  const { handleAuthRedirect } = useAuth();
  
  // URL yönlendirmelerini işleme
  useEffect(() => {
    // İlk başlangıç URL'ini kontrol et
    const getInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleURL(initialUrl);
      }
    };
    
    // URL değişikliklerini dinle
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleURL(url);
    });
    
    getInitialURL();
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  // URL'leri işle ve AuthContext'e aktar
  const handleURL = (url: string) => {
    console.log('Deep Link URL:', url);
    
    if (url.includes('auth/callback')) {
      handleAuthRedirect(url);
    }
  };
  
  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </>
  );
};
