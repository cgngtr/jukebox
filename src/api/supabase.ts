import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ortam yapılandırmasını belirle
const isProduction = process.env.NODE_ENV === 'production';
const appVersion = Constants.expoConfig?.version || '1.0.0';

// Supabase URL ve API anahtarını yapılandır
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.SUPABASE_URL || 'https://oflqkfyqbhckiawnizeq.supabase.co';
const supabaseKey = Constants.expoConfig?.extra?.supabaseKey || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mbHFrZnlxYmhja2lhd25pemVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2NDc2ODcsImV4cCI6MjA1NzIyMzY4N30.7FClTLEELEZAqiMs2ME45DMOlSf7TCGvMBdS4EYS04w';

// Zaman aşımı ve yeniden deneme yapılandırmaları
const TIMEOUT_DURATION = 30000; // 30 saniye
const MAX_RETRIES = 3;

/**
 * Üretim ortamına hazır Supabase istemcisi
 * - Persistent auth oturumları
 * - Token otomatik yenileme
 * - Hata işleme
 * - Zaman aşımı yönetimi
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: AsyncStorage,
    storageKey: 'supabase.auth.token',
  },
  global: {
    headers: {
      'X-Client-Info': `jukebox-app/${appVersion}`,
      'apikey': supabaseKey, // API anahtarını her istekte ekleyin
      'Authorization': `Bearer ${supabaseKey}` // Anonim istekler için yetkilendirme
    },
    // Custom fetch ile zaman aşımı ve yeniden deneme ekleme
    fetch: async (url, options = {}) => {
      // İstek için controller oluştur
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);
      
      // Hata durumunda yeniden deneme mekanizması
      let lastError: any;
      let attempts = 0;
      
      while (attempts < MAX_RETRIES) {
        try {
          // Mevcut başlıkları al ve özel başlıkları ekle
          const headers = {
            ...(options as any)?.headers,
            'X-Client-Info': `jukebox-app/${appVersion}`,
            'Content-Type': 'application/json',
            'apikey': supabaseKey // Her istekte API anahtarını ekle
          };
          
          // Mevcut bir Authorization başlığı varsa kullan, yoksa anonim token kullan
          if (!(options as any)?.headers?.Authorization) {
            headers['Authorization'] = `Bearer ${supabaseKey}`;
          }
          
          const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
          });
          
          // Başarılı yanıt
          clearTimeout(timeoutId);
          return response;
        } catch (error: any) {
          lastError = error;
          attempts++;
          
          // Kullanıcı iptali durumunda yeniden deneme
          if (error.name === 'AbortError' && attempts < MAX_RETRIES) {
            console.log(`Request timeout, retrying (${attempts}/${MAX_RETRIES})...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Artan bekleme süresi
            continue;
          }
          
          // Diğer hatalar veya maksimum yeniden deneme 
          clearTimeout(timeoutId);
          throw error;
        }
      }
      
      // Tüm denemeler başarısız oldu
      clearTimeout(timeoutId);
      throw lastError;
    }
  },
  db: {
    schema: 'public'
  }
});

// Aynı istemci tüm API çağrıları için kullanılacak
export const supabaseAdmin = supabase;

/**
 * Bağlantı ve kimlik doğrulama durumunu kontrol et
 * @returns {Promise<boolean>} Bağlantı durumu
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Önce bağlantıyı kontrol et
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection error:', error.message);
      return false;
    }
    
    // Oturum bilgisini kontrol et
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session) {
      console.log('Supabase connection successful with active session');
    } else {
      console.log('Supabase connection successful, no active session');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to check Supabase connection:', error);
    return false;
  }
};
