import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '../api';
import { SpotifyUser } from '../services/musicApi';

// Auth context tip tanımlaması
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: SpotifyUser | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  handleAuthRedirect: (url: string) => Promise<void>;
  getToken: () => Promise<string | null>;
}

// Varsayılan değerlerle context oluştur
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => {},
  logout: async () => {},
  handleAuthRedirect: async () => {},
  getToken: async () => null,
});

// Auth context'ini kullanmak için hook
export const useAuth = () => useContext(AuthContext);

// Auth Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider bileşeni
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<SpotifyUser | null>(null);

  // Uygulama başlangıcında oturum durumunu kontrol et
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Oturum durumunu kontrol et
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const token = await auth.getStoredToken();

      if (token) {
        const userInfo = await auth.getCurrentUser();
        setUser(userInfo);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Spotify oturumu açma
  const login = async () => {
    try {
      console.log('Login başlatılıyor...');
      setIsLoading(true);
      
      // Spotify yetkilendirme URL'ini al
      const authUrl = auth.getAuthUrl();
      console.log('Auth URL alındı:', authUrl.substring(0, 50) + '...');
      
      // Mobil için ExpoWebBrowser, web için window kullan
      if (Platform.OS !== 'web') {
        console.log('Mobil platform için tarayıcı açılıyor...');
        // Web tarayıcısı aç
        const result = await WebBrowser.openAuthSessionAsync(authUrl);
        console.log('Tarayıcı sonucu:', result.type);
        
        if (result.type === 'success') {
          console.log('Başarılı yetkilendirme. Yönlendirme URL:', result.url.substring(0, 50) + '...');
          // Başarılı yetkilendirme yönlendirmesi
          await handleAuthRedirect(result.url);
          console.log('handleAuthRedirect tamamlandı. isAuthenticated:', isAuthenticated);
        } else {
          console.log('Kullanıcı yetkilendirmeyi iptal etti veya hata oluştu.');
        }
      } else {
        // Web için window.location kullan
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error('Error during login:', error);
    } finally {
      setIsLoading(false);
      console.log('Login işlemi tamamlandı. isAuthenticated:', isAuthenticated);
    }
  };

  // Auth yönlendirmesini işle
  const handleAuthRedirect = async (url: string) => {
    try {
      console.log('handleAuthRedirect başlatılıyor...');
      setIsLoading(true);
      
      // URL'den code parametresini çıkar
      const code = new URL(url).searchParams.get('code');
      
      if (!code) {
        console.log('URL\'de code parametresi bulunamadı');
        throw new Error('No code parameter found in the redirect URL');
      }
      
      console.log('Code parametresi alındı, token talep ediliyor...');
      // Code ile token al
      await auth.getAccessToken(code);
      
      console.log('Access token alındı, kullanıcı bilgileri getiriliyor...');
      // Kullanıcı bilgilerini getir
      const userInfo = await auth.getCurrentUser();
      console.log('Kullanıcı bilgileri alındı:', userInfo.display_name);
      
      setUser(userInfo);
      setIsAuthenticated(true);
      console.log('Kimlik doğrulama tamamlandı, isAuthenticated=true olarak ayarlandı');
    } catch (error) {
      console.error('Error handling auth redirect:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Oturumu kapat
  const logout = async () => {
    try {
      setIsLoading(true);
      await auth.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Token erişim metodu
  const getToken = async (): Promise<string | null> => {
    try {
      return await auth.getStoredToken();
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  // Context değerini memoize et
  const contextValue = React.useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      login,
      logout,
      handleAuthRedirect,
      getToken,
    }),
    [isAuthenticated, isLoading, user]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthContext;
