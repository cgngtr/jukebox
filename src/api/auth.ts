import * as SpotifyService from '../services/musicApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Token saklama anahtarları
const ACCESS_TOKEN_KEY = 'spotify_access_token';
const REFRESH_TOKEN_KEY = 'spotify_refresh_token';
const TOKEN_EXPIRY_KEY = 'spotify_token_expiry';

// Yetkilendirme ile ilgili API fonksiyonları
export const auth = {
  // Spotify oturum açma URL'sini oluştur
  getAuthUrl: () => {
    return SpotifyService.getSpotifyAuthUrl();
  },

  // Token almak için kod değişimi
  getAccessToken: async (code: string) => {
    try {
      const tokenResponse = await SpotifyService.getAccessToken(code);
      
      // Token bilgilerini sakla
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokenResponse.access_token);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokenResponse.refresh_token);
      
      // Token süre sonu bilgisini hesapla ve sakla
      const expiryTime = Date.now() + tokenResponse.expires_in * 1000;
      await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

      return tokenResponse;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  },

  // Mevcut kullanıcı bilgilerini getir
  getCurrentUser: async () => {
    try {
      const token = await auth.getStoredToken();
      
      if (!token) {
        throw new Error('No access token available');
      }
      
      return await SpotifyService.getCurrentUser(token);
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  },

  // AsyncStorage'dan tokeni al
  getStoredToken: async () => {
    try {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      const expiryTime = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);

      // Token yoksa null döndür
      if (!token || !expiryTime) {
        return null;
      }

      // Token süresi dolmuşsa refresh et
      if (Date.now() > parseInt(expiryTime)) {
        return await auth.refreshToken();
      }

      return token;
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  },

  // Token yenileme işlemi
  // Not: Bu kısım bir backend gerektiriyor çünkü client_secret güvenlik sebebiyle
  // istemci tarafında saklanmamalıdır. Bu sadece örnek bir implementasyondur.
  refreshToken: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      // Bu noktada gerçek bir implementasyonda, refresh token'ı kullanarak 
      // bir backend API'sine istek atılmalıdır. Backend, client_secret'ı güvenli
      // bir şekilde saklayabilir ve Spotify API'sine istek atabilir.
      
      // Örnek olarak, yeni token alındığını varsayın
      const newToken = 'example_new_token';
      const expiryTime = Date.now() + 3600 * 1000; // 1 saat
      
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, newToken);
      await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      
      return newToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Token yenilenemezse, tüm token bilgilerini sil ve kullanıcıyı yeniden oturum açmaya zorla
      await auth.logout();
      return null;
    }
  },

  // Oturumu kapat
  logout: async () => {
    try {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },
};
