import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { spacing } from '../styles';
import { SPOTIFY_CLIENT_ID } from '@env';
import { music } from '../api';
import { DEFAULT_MARKET } from '../services/musicApi';

const SpotifyTestScreen: React.FC = () => {
  const { theme } = useTheme();
  const { isAuthenticated, login, logout, user, getToken } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  
  // Test ediliyor uyarısını görüntüle
  const showTestMessage = (message: string) => {
    setErrorMessage(null);
    setLoading(true);
    console.log('Test: ' + message);
    return () => setLoading(false);
  };

  // Hata mesajını görüntüle
  const showError = (error: any) => {
    console.error('Test Error:', error);
    setErrorMessage(error?.message || 'Bilinmeyen hata');
    setLoading(false);
  };

  // Oturum açma durumunu kontrol et
  const testAuthStatus = async () => {
    const done = showTestMessage('Oturum durumu kontrol ediliyor...');
    try {
      console.log('Auth Status:', isAuthenticated ? 'Oturum açık' : 'Oturum açık değil');
      if (user) {
        console.log('Kullanıcı:', user.display_name);
      }
      
      // Token kontrolü
      const token = await getToken();
      console.log('Token var mı?', token ? 'Evet' : 'Hayır');
      if (token) {
        console.log('Token:', token.substring(0, 10) + '...');
      }
    } catch (error) {
      showError(error);
    } finally {
      done();
    }
  };

  // Test: Öne çıkan çalma listelerini getir (Basit test - en_US locale, timestamp yok)
  const testGetFeaturedPlaylistsSimple = async () => {
    // Doğrudan bilgi mesajını göster
    showFeaturedPlaylistsInfo();
  };

  // Test: Öne çıkan çalma listelerini getir (Gelişmiş test - timestamp ile)
  const testGetFeaturedPlaylistsWithTimestamp = async () => {
    // Doğrudan bilgi mesajını göster
    showFeaturedPlaylistsInfo();
  };

  // Uygulamada tanımlı client ID'yi görüntüle
  const testEnvironmentVariables = () => {
    const done = showTestMessage('Ortam değişkenleri kontrol ediliyor...');
    try {
      if (SPOTIFY_CLIENT_ID) {
        console.log('SPOTIFY_CLIENT_ID başarıyla yüklendi:', 
          SPOTIFY_CLIENT_ID.substring(0, 4) + '...' + SPOTIFY_CLIENT_ID.substring(SPOTIFY_CLIENT_ID.length - 4));
        setErrorMessage(null);
      } else {
        throw new Error('SPOTIFY_CLIENT_ID bulunamadı!');
      }
    } catch (error) {
      showError(error);
    } finally {
      done();
    }
  };

  // Test: Kullanıcı profilini getir
  const testGetUserProfile = async () => {
    const done = showTestMessage('Kullanıcı profili getiriliyor...');
    try {
      // Bu fonksiyon token gerektiriyor
      if (!isAuthenticated) {
        throw new Error('Önce oturum açmalısınız!');
      }
      
      // AuthContext'ten token al
      const token = await getToken();
      
      if (!token) {
        throw new Error('Token alınamadı');
      }
      
      // Sadece /me endpoint'ine basit bir istek
      const response = await music.getCurrentUser(token);
      console.log('User profile:', response);
      setErrorMessage(null);
    } catch (error) {
      showError(error);
    } finally {
      done();
    }
  };

  // Test: Müzik kategorilerini getir
  const testGetCategories = async () => {
    const done = showTestMessage('Müzik kategorileri getiriliyor...');
    try {
      if (!isAuthenticated) {
        throw new Error('Önce oturum açmalısınız!');
      }
      
      const token = await getToken();
      
      if (!token) {
        throw new Error('Token alınamadı');
      }
      
      // Kullanıcı profilini getir
      const userProfile = await music.getCurrentUser(token);
      const userCountry = userProfile.country || 'TR';
      
      // Kategorileri belirli bir market için getir
      const response = await music.getCategories(token, 20, userCountry);
      console.log('Categories:', response);
      setErrorMessage(null);
    } catch (error) {
      showError(error);
    } finally {
      done();
    }
  };

  // Test: Yeni çıkan albümleri getir
  const testGetNewReleases = async () => {
    const done = showTestMessage('Yeni çıkan albümler getiriliyor...');
    try {
      if (!isAuthenticated) {
        throw new Error('Önce oturum açmalısınız!');
      }
      
      const token = await getToken();
      
      if (!token) {
        throw new Error('Token alınamadı');
      }
      
      // Kullanıcı profilini getir
      const userProfile = await music.getCurrentUser(token);
      const userCountry = userProfile.country || 'TR';
      
      // Yeni çıkan albümleri kullanıcının ülkesi için getir
      const response = await music.getNewReleases(token, 20, userCountry);
      console.log('New releases:', response);
      setErrorMessage(null);
    } catch (error) {
      showError(error);
    } finally {
      done();
    }
  };

  // Test hardcoded market değeriyle Featured Playlists alma
  const testGetFeaturedPlaylistsWithHardcodedMarket = async () => {
    // Doğrudan bilgi mesajını göster
    showFeaturedPlaylistsInfo();
  };

  // Test: Kategori tabanlı çalma listeleri getir
  const testGetCategoryPlaylists = async () => {
    const done = showTestMessage('Kategori bazlı çalma listeleri getiriliyor...');
    try {
      if (!isAuthenticated) {
        throw new Error('Önce oturum açmalısınız!');
      }
      
      const token = await getToken();
      
      if (!token) {
        throw new Error('Token alınamadı');
      }
      
      // Kategorileri getir
      const categoriesResponse = await music.getCategories(token, 10, 'US');
      
      if (!categoriesResponse.categories.items.length) {
        throw new Error('Hiç kategori bulunamadı');
      }
      
      // İlk kategoriyi seç
      const category = categoriesResponse.categories.items[0];
      console.log(`Selected category: ${category.name} (${category.id})`);
      
      // Bu kategoriden çalma listelerini getir
      const playlistsResponse = await music.getCategoryPlaylists(token, category.id, 10, 'US');
      
      if (playlistsResponse.playlists.items.length) {
        console.log(`Found ${playlistsResponse.playlists.items.length} playlists in category ${category.name}`);
        setPlaylists(playlistsResponse.playlists.items);
      } else {
        throw new Error(`${category.name} kategorisinde çalma listesi bulunamadı`);
      }
      
    } catch (error) {
      showError(error);
    } finally {
      done();
    }
  };

  // Test: Kullanıcının çalma listelerini getir
  const testGetUserPlaylists = async () => {
    const done = showTestMessage('Kullanıcı çalma listeleri getiriliyor...');
    try {
      if (!isAuthenticated) {
        throw new Error('Önce oturum açmalısınız!');
      }
      
      const token = await getToken();
      
      if (!token) {
        throw new Error('Token alınamadı');
      }
      
      // Kullanıcının çalma listelerini getir
      const response = await music.getUserPlaylists(token);
      
      if (response.items.length) {
        console.log(`Found ${response.items.length} user playlists`);
        setPlaylists(response.items);
      } else {
        console.log('No user playlists found');
        setErrorMessage('Kullanıcı çalma listesi bulunamadı');
      }
    } catch (error) {
      showError(error);
    } finally {
      done();
    }
  };

  // Featured Playlists hakkında bilgi göster
  const showFeaturedPlaylistsInfo = () => {
    setErrorMessage(
      'Featured Playlists API, yalnızca Spotify Premium hesaplarına açık olabilir ' +
      'veya geliştirici hesabınızda bazı kısıtlamalar olabilir. ' +
      'Bunun yerine "Kategori Bazlı Çalma Listeleri" veya "Kullanıcının Çalma Listeleri" ' +
      'butonlarını kullanabilirsiniz.'
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.header, { color: theme.colors.text.primary }]}>
          Spotify API Testi
        </Text>
        
        {/* Bağlantı Durumu */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Bağlantı Durumu
          </Text>
          <Text style={[styles.statusText, { color: theme.colors.text.secondary }]}>
            {isAuthenticated ? '✅ Oturum açık' : '❌ Oturum açık değil'}
          </Text>
          
          {isAuthenticated && user && (
            <Text style={[styles.userInfo, { color: theme.colors.primary }]}>
              Merhaba, {user.display_name}
            </Text>
          )}
          
          <View style={styles.buttonContainer}>
            <Button 
              title={isAuthenticated ? "Oturumu Kapat" : "Spotify ile Giriş Yap"} 
              onPress={isAuthenticated ? logout : login}
              color={theme.colors.primary}
            />
          </View>
        </View>
        
        {/* Test Araçları */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Test Araçları
          </Text>
          
          <View style={styles.buttonRow}>
            <Button 
              title="Ortam Değişkenlerini Test Et" 
              onPress={testEnvironmentVariables}
              color={theme.colors.secondary}
            />
          </View>
          
          <View style={styles.buttonRow}>
            <Button 
              title="Oturum Durumunu Kontrol Et" 
              onPress={testAuthStatus}
              color={theme.colors.secondary}
            />
          </View>
          
          <View style={styles.buttonRow}>
            <Button 
              title="Öne Çıkan Çalma Listeleri Getirme Sorunu (Bilgi)" 
              onPress={testGetFeaturedPlaylistsSimple}
              color={theme.colors.secondary}
              disabled={!isAuthenticated}
            />
          </View>
          
          <View style={styles.buttonRow}>
            <Button 
              title="Kullanıcının Çalma Listelerini Getir" 
              onPress={testGetUserPlaylists}
              color={theme.colors.primary}
              disabled={!isAuthenticated}
            />
          </View>
          
          <View style={styles.buttonRow}>
            <Button 
              title="Kategori Bazlı Çalma Listeleri Getir" 
              onPress={testGetCategoryPlaylists}
              color={theme.colors.primary}
              disabled={!isAuthenticated}
            />
          </View>
          
          <View style={styles.buttonRow}>
            <Button 
              title="Kullanıcı Profilini Getir" 
              onPress={testGetUserProfile}
              color={theme.colors.secondary}
              disabled={!isAuthenticated}
            />
          </View>
          
          <View style={styles.buttonRow}>
            <Button 
              title="Müzik Kategorilerini Getir" 
              onPress={testGetCategories}
              color={theme.colors.secondary}
              disabled={!isAuthenticated}
            />
          </View>
          
          <View style={styles.buttonRow}>
            <Button 
              title="Yeni Çıkan Albümleri Getir" 
              onPress={testGetNewReleases}
              color={theme.colors.secondary}
              disabled={!isAuthenticated}
            />
          </View>
          
          {/* Yükleniyor İndikatörü */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
                İşlem devam ediyor...
              </Text>
            </View>
          )}
          
          {/* Hata Mesajı */}
          {errorMessage && (
            <View style={[styles.errorContainer, { backgroundColor: `${theme.colors.error}20` }]}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                Hata: {errorMessage}
              </Text>
            </View>
          )}

          {/* API Sonuçları */}
          {playlists.length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={[styles.resultsTitle, { color: theme.colors.text.primary }]}>
                Çalma Listeleri ({playlists.length})
              </Text>
              {playlists.map((playlist, index) => (
                <View 
                  key={playlist.id} 
                  style={[
                    styles.playlistItem, 
                    { backgroundColor: theme.colors.card }
                  ]}
                >
                  <Text style={[styles.playlistName, { color: theme.colors.text.primary }]}>
                    {index + 1}. {playlist.name}
                  </Text>
                  <Text style={[styles.playlistInfo, { color: theme.colors.text.secondary }]}>
                    {playlist.tracks.total} şarkı • {playlist.owner.display_name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: spacing.lg,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.base,
  },
  statusText: {
    fontSize: 16,
    marginBottom: spacing.base,
  },
  userInfo: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.base,
  },
  buttonContainer: {
    marginVertical: spacing.sm,
  },
  buttonRow: {
    marginVertical: spacing.xs,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.base,
    padding: spacing.sm,
  },
  loadingText: {
    marginLeft: spacing.sm,
  },
  errorContainer: {
    padding: spacing.base,
    borderRadius: 8,
    marginTop: spacing.base,
  },
  errorText: {
    fontSize: 14,
  },
  resultsContainer: {
    marginTop: spacing.lg,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  playlistItem: {
    padding: spacing.base,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  playlistName: {
    fontSize: 15,
    fontWeight: '500',
  },
  playlistInfo: {
    fontSize: 13,
    marginTop: 4,
  },
});

export default SpotifyTestScreen; 