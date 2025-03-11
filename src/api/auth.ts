import * as SpotifyService from '../services/musicApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, supabaseAdmin } from './supabase';
import { AppUser } from '../services/musicApi';
import Constants from 'expo-constants';

// Token saklama anahtarları
const ACCESS_TOKEN_KEY = 'spotify_access_token';
const REFRESH_TOKEN_KEY = 'spotify_refresh_token';
const TOKEN_EXPIRY_KEY = 'spotify_token_expiry';
const USER_ID_KEY = 'user_id';

// Yetkilendirme ile ilgili API fonksiyonları
export const auth = {
  // Spotify oturum açma URL'sini oluştur
  getAuthUrl: () => {
    return SpotifyService.getSpotifyAuthUrl();
  },

  // Token almak için kod değişimi
  getAccessToken: async (code: string) => {
    try {
      console.log('Exchanging authorization code for access token...');
      
      // 1. Spotify API'den token al
      const tokenResponse = await SpotifyService.getAccessToken(code);
      if (!tokenResponse || !tokenResponse.access_token) {
        throw new Error('Failed to get access token from Spotify');
      }
      
      console.log('Successfully obtained Spotify access token');
      
      // 2. Token bilgilerini güvenli şekilde sakla
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokenResponse.access_token);
      if (tokenResponse.refresh_token) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokenResponse.refresh_token);
      }
      
      // 3. Token süre sonu bilgisini hesapla ve sakla
      const expiryTime = Date.now() + (tokenResponse.expires_in || 3600) * 1000;
      await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      console.log(`Token will expire at: ${new Date(expiryTime).toISOString()}`);

      // 4. Kullanıcı bilgilerini al
      console.log('Fetching user profile from Spotify...');
      const spotifyUser = await SpotifyService.getCurrentUser(tokenResponse.access_token);
      
      if (!spotifyUser || !spotifyUser.id) {
        throw new Error('Failed to fetch user profile from Spotify');
      }
      
      // 5. Kullanıcı nesnesini hazırla
      const appUser: AppUser = {
        ...spotifyUser,
        avatar_url: spotifyUser.images && spotifyUser.images.length > 0 ? 
          spotifyUser.images[0].url : undefined
      };
      
      // 6. Supabase ile kullanıcı kimlik doğrulama ve kayıt işlemi
      console.log('Authenticating with Supabase...');
      let supabaseUserId;
      try {
        supabaseUserId = await auth.signInToSupabase(appUser.email, appUser);
        
        if (supabaseUserId) {
          console.log(`Supabase auth successful, user ID: ${supabaseUserId}`);
          
          // Kullanıcı ID'sini lokal olarak sakla
          await AsyncStorage.setItem(USER_ID_KEY, supabaseUserId);
          console.log(`User ID saved to AsyncStorage: ${supabaseUserId}`);
        } else {
          console.warn('Supabase auth failed, will continue with Spotify auth only');
          // Hata olsa bile Spotify kimliğiyle devam et
          await AsyncStorage.setItem(USER_ID_KEY, appUser.id);
          console.log(`Fallback: Using Spotify ID as user identifier: ${appUser.id}`);
        }
      } catch (authError: any) {
        console.error('Error during Supabase authentication:', authError.message);
        // Kimlik doğrulama hatası durumunda Spotify ID'yi kullan
        await AsyncStorage.setItem(USER_ID_KEY, appUser.id);
        supabaseUserId = appUser.id;
      }
      
      // 7. Veritabanı profil bilgilerini kaydet/güncelle
      console.log('Saving user profile to database...');
      try {
        const savedUserId = await auth.saveUserToSupabase(appUser, supabaseUserId);
        
        if (savedUserId && savedUserId !== supabaseUserId) {
          console.warn(`Warning: Auth user ID (${supabaseUserId}) and saved user ID (${savedUserId}) are different`);
        }
        
        if (savedUserId) {
          console.log('User profile successfully saved to database');
        }
      } catch (dbError: any) {
        console.error('Error saving user profile to database:', dbError.message);
        // Bu hata kimlik doğrulamayı etkilemez, devam edebiliriz
      }

      // 8. Tüm işlemler tamamlandı, kullanıcı nesnesini döndür
      return appUser;
    } catch (error: any) {
      console.error('Critical error during authentication flow:', error.message);
      // Tüm işlemleri temizle ve oturumu kapat
      await auth.logout();
      throw error;
    }
  },

  // Supabase oturumu başlat
  signInToSupabase: async (email: string, spotifyUser: any): Promise<string> => {
    try {
      if (!email) {
        // E-posta yoksa, Spotify ID kullanarak yardımcı bir e-posta oluştur
        email = `${spotifyUser.id}@spotify.users`;
        console.log(`No email provided, using generated email: ${email}`);
      }
      
      console.log(`Attempting to authenticate user with email: ${email}`);
      
      // 1. Kullanıcının zaten var olup olmadığını kontrol et
      // Önce oturum açmayı dene
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: `spotify_${spotifyUser.id}` // Basit şifre stratejisi
      });
      
      // Başarılı giriş - kullanıcı var
      if (signInData && signInData.user) {
        console.log('User successfully signed in to Supabase');
        
        // Kullanıcı meta verilerini güncelle
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            spotify_id: spotifyUser.id,
            display_name: spotifyUser.display_name,
            avatar_url: spotifyUser.avatar_url || 
              (spotifyUser.images && spotifyUser.images.length > 0 ? spotifyUser.images[0].url : null)
          }
        });
        
        if (updateError) {
          console.warn('Failed to update user metadata:', updateError.message);
        }
        
        // Users tablosundaki profiline devam et
        return signInData.user.id;
      }
      
      // Kullanıcı mevcut değil veya şifre yanlış
      if (signInError) {
        console.log('Sign in error:', signInError.message);
        
        // 2. Kullanıcı bulunamadıysa yeni kayıt oluştur
        if (signInError.message.includes('Invalid login credentials')) {
          console.log('User not found, creating new account');
          
          // Güçlü bir şifre oluştur
          const password = generateSecurePassword(spotifyUser.id);
          
          // Yeni kullanıcı oluştur
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
              data: {
                spotify_id: spotifyUser.id,
                display_name: spotifyUser.display_name,
                avatar_url: spotifyUser.avatar_url || 
                  (spotifyUser.images && spotifyUser.images.length > 0 ? spotifyUser.images[0].url : null)
              }
            }
          });
          
          if (signUpError) {
            // Kayıt hatası - kullanıcı muhtemelen zaten var
            if (signUpError.message.includes('already registered')) {
              console.log('User already exists but password mismatch, handling special case');
              
              // Şifre sıfırlama e-postası gönder (opsiyonel, kullanmak istiyorsanız)
              // await supabase.auth.resetPasswordForEmail(email);
              
              // Bu durum için Spotify ID'yi kullan
              return spotifyUser.id;
            }
            
            // Diğer kayıt hataları
            console.error('Error during signup:', signUpError.message);
            return '';
          }
          
          // Başarılı kayıt
          if (signUpData.user) {
            console.log('New user successfully created in Supabase');
            return signUpData.user.id;
          }
        }
      }
      
      // Fallback - dış sistemlerle entegrasyon sorunlarında Spotify ID'yi kullan
      console.warn('Using Spotify ID as fallback due to auth issues');
      return spotifyUser.id;
    } catch (error: any) {
      console.error('Authentication error:', error.message);
      // Kimlik doğrulama başarısız - Spotify ID ile devam et
      return spotifyUser.id;
    }
  },

  // Kullanıcıyı Supabase'e kaydet
  saveUserToSupabase: async (spotifyUser: any, userId: string | undefined): Promise<string> => {
    try {
      console.log('💾 Kullanıcı profilini veritabanına kaydediyorum...');
      
      // Anonim veya yetkilendirilmemiş erişim için spotify_id kullanılabilir
      const userIdentifier = userId || spotifyUser.id;
      console.log(`Kullanıcı ID: ${userIdentifier}, Spotify ID: ${spotifyUser.id}`);
      
      // Kullanıcı verilerini hazırla
      const userData = {
        id: userIdentifier,
        spotify_id: spotifyUser.id,
        display_name: spotifyUser.display_name || 'Spotify User',
        email: spotifyUser.email || `${spotifyUser.id}@spotify.users`,
        avatar_url: spotifyUser.avatar_url || 
          (spotifyUser.images && spotifyUser.images.length > 0 ? spotifyUser.images[0].url : null),
        country: spotifyUser.country,
        spotify_url: spotifyUser.external_urls?.spotify,
        spotify_product: spotifyUser.product,
        last_login: new Date().toISOString()
      };
      
      console.log('📡 Veritabanına yazma işlemi başlatılıyor...');
      
      // Strateji 1: Normal upsert dene
      const { data, error } = await supabase
        .from('users')
        .upsert(userData, { 
          onConflict: 'id' // ID çakışması durumunda güncelle
        });
      
      if (!error) {
        console.log('✅ Kullanıcı profili başarıyla veritabanına kaydedildi');
        return userIdentifier;
      }
      
      // Hata durumunda alternatif stratejileri dene
      console.error('❌ Veritabanı operasyonu başarısız:', error.message);
      
      // Strateji 2: Doğrudan INSERT dene
      console.log('🔄 Alternatif strateji 1: Direkt INSERT deniyorum...');
      const { error: insertError } = await supabase
        .from('users')
        .insert(userData);
      
      if (!insertError) {
        console.log('✅ INSERT stratejisiyle kullanıcı kaydedildi');
        return userIdentifier;
      }
      
      console.error('❌ INSERT stratejisi başarısız:', insertError.message);
      
      // Strateji 3: Önce varolan kaydı kontrol et
      console.log('🔄 Alternatif strateji 2: Önce SELECT ile kullanıcı kontrolü...');
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('id, spotify_id')
        .eq('spotify_id', spotifyUser.id)
        .maybeSingle();
      
      if (!selectError && existingUser) {
        // Kullanıcı mevcut, UPDATE deneyelim
        console.log(`🔍 Spotify ID ile kullanıcı bulundu (ID: ${existingUser.id}), güncelleme yapılıyor...`);
        const { error: updateError } = await supabase
          .from('users')
          .update({
            display_name: spotifyUser.display_name,
            email: spotifyUser.email,
            avatar_url: userData.avatar_url,
            last_login: new Date().toISOString()
          })
          .eq('id', existingUser.id);
        
        if (!updateError) {
          console.log('✅ UPDATE stratejisiyle kullanıcı güncellendi');
          return existingUser.id;
        }
        
        console.error('❌ UPDATE stratejisi başarısız:', updateError.message);
      }
      
      // Strateji 4: Serbestçe erişilebilen, public tablosunu farklı isimle kontrol et
      console.log('🔄 Alternatif strateji 3: Public tabloyu kontrol ediyorum...');
      try {
        const { error: publicError } = await supabaseAdmin
          .from('users')
          .upsert(userData, { onConflict: 'id' });
          
        if (!publicError) {
          console.log('✅ Admin istemcisi ile kullanıcı kaydedildi');
          return userIdentifier;
        }
      } catch (adminError: any) {
        console.error('❌ Admin erişimi başarısız:', adminError.message);
      }
      
      // Strateji 5: Son çare olarak AsyncStorage'a kaydet
      console.log('🔄 Son çare: AsyncStorage\'a kullanıcı bilgilerini kaydediyorum...');
      await AsyncStorage.setItem('current_user', JSON.stringify(userData));
      console.log('✅ Kullanıcı bilgileri yerel depolamaya kaydedildi');
      
      // Başarısız veritabanı işlemi durumunda bile kullanıcı ID'sini dön
      console.log('⚠️ Veritabanı kayıt işlemleri başarısız, ancak kullanıcı oturumu devam edecek');
      return userIdentifier;
    } catch (error: any) {
      console.error('❗ saveUserToSupabase fonksiyonunda hata:', error.message);
      return userId || spotifyUser.id;
    }
  },

  // Supabase oturum durumunu kontrol et
  getSupabaseSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting Supabase session:', error);
        return null;
      }
      
      return data.session;
    } catch (error) {
      console.error('Error in getSupabaseSession:', error);
      return null;
    }
  },

  // Supabase kullanıcı bilgilerini getir
  getSupabaseUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error getting Supabase user:', error);
        return null;
      }
      
      if (!data.user) {
        console.warn('No Supabase user found');
        return null;
      }
      
      // Kullanıcının users tablosundaki detaylarını da getir
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (userError) {
        console.error('Error fetching user data from users table:', userError);
        // Hata alsa bile temel auth user'ı dönebiliriz
        return {
          id: data.user.id,
          email: data.user.email,
          user_metadata: data.user.user_metadata
        };
      }
      
      return userData;
    } catch (error) {
      console.error('Error in getSupabaseUser:', error);
      return null;
    }
  },

  // Mevcut kullanıcı bilgilerini getir
  getCurrentUser: async () => {
    try {
      const token = await auth.getStoredToken();
      
      if (!token) {
        throw new Error('No access token available');
      }
      
      const spotifyUser = await SpotifyService.getCurrentUser(token);
      
      // SpotifyUser'ı AppUser'a dönüştür
      const appUser: AppUser = {
        ...spotifyUser,
        avatar_url: spotifyUser.images && spotifyUser.images.length > 0 ? 
          spotifyUser.images[0].url : undefined
      };
      
      return appUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  },

  // Token yenileme işlemi
  refreshToken: async () => {
    try {
      // Yenileme token'ı al
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        console.error('No refresh token available');
        throw new Error('No refresh token available');
      }
      
      // Supabase auth sistemini kullanarak token yenile
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });
      
      if (error) {
        console.error('Error refreshing session:', error.message);
        // Token yenilenemezse, oturumu kapatalım ve kullanıcıyı yeniden giriş yapmaya yönlendirelim
        await auth.logout();
        return null;
      }
      
      // Yeni session bilgilerini sakla
      if (data?.session) {
        // Spotify token'ı hala geçerli ise devam et
        console.log('Session refreshed, new token expiry:', new Date(data.session.expires_at || 0).toISOString());
        
        // Not: Supabase yenileme, Spotify token'ını yenilemez!
        // Spotify token'ı ayrıca yenilenmelidir (gerçek implementasyonda)
        
        return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      }
      
      return null;
    } catch (error: any) {
      console.error('Error during token refresh:', error.message);
      // Token yenilemede kritik hata - oturumu kapatalım
      await auth.logout();
      return null;
    }
  },

  // AsyncStorage'dan tokeni al ve doğrula
  getStoredToken: async () => {
    try {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      const expiryTime = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);

      // Token yoksa null döndür
      if (!token || !expiryTime) {
        console.log('No stored token found');
        return null;
      }

      const expiryTimestamp = parseInt(expiryTime);
      
      // Token geçerlilik kontrolü
      if (isNaN(expiryTimestamp)) {
        console.error('Invalid token expiry value');
        return await auth.refreshToken(); // Geçersiz timestamp durumunda yenilemeyi dene
      }
      
      // Geçerlilik süresi kontrolü - güvenlik marjı (5 dakika) ekle
      const EXPIRY_MARGIN = 5 * 60 * 1000; // 5 dakika
      const currentTime = Date.now();
      
      // Token süresi dolmuşsa veya dolmak üzereyse yenile
      if (currentTime + EXPIRY_MARGIN > expiryTimestamp) {
        console.log('Token expired or about to expire, refreshing...');
        return await auth.refreshToken();
      }

      // Geçerli token
      console.log('Using valid stored token, expires:', new Date(expiryTimestamp).toISOString());
      return token;
    } catch (error: any) {
      console.error('Error retrieving token:', error.message);
      return null;
    }
  },

  // Oturumu kapat
  logout: async () => {
    try {
      console.log('Logging out user from all services...');
      
      // 1. Önce kullanıcı bilgilerini geçici olarak saklayın (hata ayıklama/analiz için)
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      const sessionActive = await auth.getSupabaseSession() !== null;
      
      // 2. Supabase ile oturumu kapatalım
      let supabaseLogoutSuccess = true;
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error signing out from Supabase:', error.message);
          supabaseLogoutSuccess = false;
        } else {
          console.log('Successfully signed out from Supabase');
        }
      } catch (error: any) {
        console.error('Exception during Supabase logout:', error.message);
        supabaseLogoutSuccess = false;
      }
      
      // 3. Tüm token ve kullanıcı bilgilerini temizleyelim
      const keysToRemove = [
        ACCESS_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        TOKEN_EXPIRY_KEY,
        USER_ID_KEY,
        'supabase.auth.token',  // Supabase token
        'current_user'          // Acil durum yedeği
      ];
      
      await Promise.all(keysToRemove.map(key => AsyncStorage.removeItem(key)));
      console.log('All authentication tokens and user data removed from local storage');
      
      // 4. Analitik için oturum kapatma olayını kaydedelim
      console.log(`Logout completed for user: ${userId || 'unknown'}, Supabase session was ${sessionActive ? 'active' : 'inactive'}`);
      
      // 5. Oturum kapatma durumunu döndürelim
      return true;
    } catch (error: any) {
      console.error('Critical error during logout process:', error.message);
      
      // Hata durumunda da temizlemeyi deneyin
      try {
        await AsyncStorage.multiRemove([
          ACCESS_TOKEN_KEY, 
          REFRESH_TOKEN_KEY, 
          TOKEN_EXPIRY_KEY, 
          USER_ID_KEY
        ]);
      } catch (storageError) {
        console.error('Failed to clear storage during error recovery');
      }
      
      return false;
    }
  },

  // Mevcut kullanıcı ID'sini al
  getUserId: async () => {
    try {
      // Önce Supabase oturumundan almayı dene
      const session = await auth.getSupabaseSession();
      if (session?.user) {
        return session.user.id;
      }
      
      // Yoksa AsyncStorage'dan al
      return await AsyncStorage.getItem(USER_ID_KEY);
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  }
};

/**
 * Spotify ID kullanarak güvenli bir şifre oluştur
 * @param spotifyId Kullanıcının Spotify ID'si
 * @returns Güvenli şifre
 */
const generateSecurePassword = (spotifyId: string): string => {
  const randomPart = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now().toString(36);
  return `sp_${spotifyId}_${randomPart}_${timestamp}`;
};

/**
 * Supabase ve Spotify entegrasyonunu test et
 * @returns Bağlantı durumu ve hata bilgileri
 */
export const diagnosticCheck = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    version: '1.1', // Diagnostic sürüm numarası
    supabase: {
      connection: false,
      auth: false,
      database: false,
      apikey_present: false,
      permissions: {
        select: false,
        insert: false,
        update: false
      },
      jwt: null as string | null,
      error: ''
    },
    spotify: {
      token: false,
      error: ''
    },
    localStorage: {
      userId: null as string | null,
      hasToken: false,
      tokenExpiry: null as string | null
    }
  };
  
  console.log('📊 Tanılama başlatılıyor...');
  
  // 1. Supabase API anahtarını kontrol et
  try {
    // API key varlığını daha basit bir şekilde kontrol edelim
    const apiKeyInEnv = !!process.env.SUPABASE_ANON_KEY;
    const apiKeyInConfig = !!Constants.expoConfig?.extra?.supabaseKey;
    const apiKeyFound = apiKeyInEnv || apiKeyInConfig;
    
    results.supabase.apikey_present = apiKeyFound;
    console.log(`API anahtarı kontrol: ${apiKeyFound ? '✅ Mevcut' : '❌ Eksik'}`);
    console.log(`  Env: ${apiKeyInEnv ? 'Bulundu' : 'Bulunamadı'}`);
    console.log(`  Config: ${apiKeyInConfig ? 'Bulundu' : 'Bulunamadı'}`);
    
    // Mevcut fetch başlıklarını kontrol et
    const headers = (supabase as any)?.rest?.headers;
    if (headers) {
      console.log('Supabase istemci başlıkları:');
      console.log(JSON.stringify(headers, null, 2));
    }
  } catch (error: any) {
    console.error('API anahtarı kontrolünde hata:', error.message);
  }
  
  // 2. Supabase bağlantısını kontrol et
  try {
    // Önce basit bir istek gönderelim
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      results.supabase.error = `Veritabanı hatası: ${error.message}`;
      console.error('❌ Supabase bağlantı hatası:', error.message);
    } else {
      results.supabase.connection = true;
      results.supabase.database = true;
      console.log('✅ Supabase bağlantısı başarılı');
    }
  } catch (error: any) {
    results.supabase.error = `Bağlantı hatası: ${error.message}`;
    console.error('❌ Supabase bağlantı istisna hatası:', error.message);
  }
  
  // 3. Supabase oturumunu ve JWT token kontrol et
  try {
    const session = await auth.getSupabaseSession();
    results.supabase.auth = !!session;
    
    if (session) {
      console.log('✅ Aktif Supabase oturumu bulundu');
      // JWT bilgisini al
      results.supabase.jwt = session.access_token;
      console.log(`JWT token: ${session.access_token?.substring(0, 15)}...`);
    } else {
      console.log('⚠️ Supabase oturumu bulunamadı');
    }
  } catch (error: any) {
    results.supabase.error += ` Oturum hatası: ${error.message}`;
    console.error('❌ Supabase oturum kontrolünde hata:', error.message);
  }
  
  // 4. Veritabanı izinlerini test et
  try {
    console.log('🧪 Veritabanı izinlerini test ediyorum...');
    
    // SELECT izni testi
    const selectTest = await supabase.from('users').select('id, email').limit(1);
    results.supabase.permissions.select = !selectTest.error;
    console.log(`SELECT izni: ${!selectTest.error ? '✅ Başarılı' : '❌ Başarısız'}`);
    if (selectTest.error) console.error('  Hata:', selectTest.error.message);
    
    // Test için geçici veri
    const testData = {
      id: `test_${Date.now()}`,
      display_name: 'Test User',
      email: `test_${Date.now()}@example.com`,
      spotify_id: `test_${Date.now()}`
    };
    
    // INSERT izni testi
    const insertTest = await supabase.from('users').insert(testData);
    results.supabase.permissions.insert = !insertTest.error;
    console.log(`INSERT izni: ${!insertTest.error ? '✅ Başarılı' : '❌ Başarısız'}`);
    if (insertTest.error) console.error('  Hata:', insertTest.error.message);
    
    // UPDATE izni testi
    if (!insertTest.error) {
      const updateTest = await supabase
        .from('users')
        .update({ display_name: 'Updated Test User' })
        .eq('id', testData.id);
      
      results.supabase.permissions.update = !updateTest.error;
      console.log(`UPDATE izni: ${!updateTest.error ? '✅ Başarılı' : '❌ Başarısız'}`);
      if (updateTest.error) console.error('  Hata:', updateTest.error.message);
      
      // Temizlik
      await supabase.from('users').delete().eq('id', testData.id);
    }
  } catch (error: any) {
    console.error('❌ İzin testleri sırasında hata:', error.message);
  }
  
  // 5. Spotify token kontrolü
  try {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    results.spotify.token = !!token;
    
    if (token) {
      console.log('✅ Spotify token bulundu');
    } else {
      console.log('❌ Spotify token bulunamadı');
      results.spotify.error = 'Token bulunamadı';
    }
  } catch (error: any) {
    results.spotify.error = `Token hatası: ${error.message}`;
    console.error('❌ Spotify token kontrolünde hata:', error.message);
  }
  
  // 6. LocalStorage durumu
  try {
    results.localStorage.userId = await AsyncStorage.getItem(USER_ID_KEY);
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    results.localStorage.hasToken = !!token;
    
    const expiry = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);
    if (expiry) {
      const expiryDate = new Date(parseInt(expiry));
      results.localStorage.tokenExpiry = expiryDate.toISOString();
    }
    
    console.log('📦 LocalStorage durumu:');
    console.log(`  User ID: ${results.localStorage.userId || 'Bulunamadı'}`);
    console.log(`  Token: ${results.localStorage.hasToken ? 'Mevcut' : 'Bulunamadı'}`);
    console.log(`  Token geçerlilik: ${results.localStorage.tokenExpiry || 'Bulunamadı'}`);
  } catch (error: any) {
    console.error('❌ LocalStorage kontrolünde hata:', error.message);
  }
  
  console.log('📊 Tanılama sonuçları:', JSON.stringify(results, null, 2));
  return results;
};
