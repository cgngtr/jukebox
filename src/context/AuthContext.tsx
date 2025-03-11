import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '../api';
import { SpotifyUser, AppUser } from '../services/musicApi';

// Auth context tip tanımlaması
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AppUser | null;
  login: () => Promise<void>;
  logout: () => Promise<boolean>;
  handleAuthRedirect: (url: string) => Promise<void>;
  getToken: () => Promise<string | null>;
}

// Varsayılan değerlerle context oluştur
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => {},
  logout: async () => false,
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
  const [user, setUser] = useState<AppUser | null>(null);

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

  // Yetkilendirme yönlendirmesini işle
  const handleAuthRedirect = async (url: string) => {
    try {
      console.log('handleAuthRedirect başlatılıyor...');
      setIsLoading(true);
      
      // URL'den code parametresini al
      const matches = url.match(/code=([^&]*)/);
      const authCode = matches?.[1];
      
      if (!authCode) {
        console.error('Auth code not found in redirect URL');
        throw new Error('Auth code not found in redirect URL');
      }
      
      console.log('Code parametresi alındı, token talep ediliyor...');
      
      try {
        // Token almak için API çağrısı
        const tokenData = await auth.getAccessToken(authCode);
        
        if (!tokenData) {
          throw new Error('Failed to get token from Spotify');
        }
        
        // Supabase oturumunu kontrol et
        const supabaseSession = await auth.getSupabaseSession();
        console.log('Supabase session check:', supabaseSession ? 'Active' : 'None');
        
        // Kullanıcı bilgilerini al
        const userInfo = await auth.getCurrentUser();
        setUser(userInfo);
        setIsAuthenticated(true);
        
        console.log('handleAuthRedirect tamamlandı. isAuthenticated: true');
      } catch (error) {
        console.error('Error handling auth redirect:', error);
        
        // Token alma başarısız oldu, ancak Spotify oturumu açılabildi
        // En azından mevcut oturumu kullanabiliriz
        const userInfo = await auth.getCurrentUser();
        
        if (userInfo) {
          console.log('Spotify authentication succeeded despite errors');
          setUser(userInfo);
          setIsAuthenticated(true);
          console.log('handleAuthRedirect tamamlandı. isAuthenticated: true (fallback)');
        } else {
          // Kimlik doğrulama tamamen başarısız
          setUser(null);
          setIsAuthenticated(false);
          console.log('handleAuthRedirect tamamlandı. isAuthenticated: false');
          throw error;
        }
      }
    } catch (error) {
      console.error('Error handling auth redirect:', error);
      setUser(null);
      setIsAuthenticated(false);
      console.log('handleAuthRedirect tamamlandı. isAuthenticated: false');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Oturumu kapat
  const logout = async () => {
    try {
      console.log('AuthContext: Logout işlemi başlatılıyor...');
      setIsLoading(true);
      
      // AsyncStorage'dan token bilgilerini sil
      await auth.logout();
      console.log('AuthContext: AsyncStorage temizlendi');
      
      // User ve authentication durumunu güncelle
      setUser(null);
      setIsAuthenticated(false);
      console.log('AuthContext: Kullanıcı durumu güncellendi, isAuthenticated=false');
      
      return true; // Logout işlemi başarılı
    } catch (error) {
      console.error('AuthContext: Logout sırasında hata:', error);
      return false; // Logout işlemi başarısız
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
