import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing, layout, borderRadius } from '../../styles';
import { Card } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';
import { music } from '../../api/music';
import { SpotifyTrack } from '../../services/musicApi';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { renderTrackItem } from '../music/renderers/TrackRenderer';

// Defining the types for our data structures based on Spotify API
interface Album {
  id: string;
  name: string;
  artists: Array<{id: string; name: string}>;
  images: Array<{url: string; height: number | null; width: number | null}>;
  release_date: string;
}

interface Track {
  id: string;
  name: string;
  artists: Array<{id: string; name: string}>;
  album: {
    id: string;
    name: string;
    images: Array<{url: string; height: number | null; width: number | null}>;
  };
  duration_ms: number;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  images: Array<{url: string; height: number | null; width: number | null}>;
  owner: {
    id: string;
    display_name: string;
  };
}

// Main HomeScreen component
const HomeScreen: React.FC = () => {
  const { isAuthenticated, getToken, user } = useAuth();
  const navigation = useNavigation();
  const { isDarkMode, theme } = useTheme();
  const { play, pause, playerState } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for music data
  const [newReleases, setNewReleases] = useState<Album[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  
  // Greeting message based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // Fetch data from API
  const fetchData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const token = await getToken();
      
      if (!token) {
        console.error('No token available');
        setError('Authentication required');
        return;
      }

      // New Releases
      try {
        console.log('📀 Yeni albümler getiriliyor...');
        const newReleasesResponse = await music.getNewReleases(token, 10);
        
        if (newReleasesResponse?.albums?.items) {
          console.log(`✨ ${newReleasesResponse.albums.items.length} yeni albüm başarıyla yüklendi`);
          setNewReleases(newReleasesResponse.albums.items);
        } else {
          console.warn('⚠️ Yeni albümler bulunamadı');
        }
      } catch (error) {
        console.error('❌ Yeni albümleri getirirken hata:', error);
      }

      // Top Tracks or Recently Played
      try {
        console.log('🎵 Top tracks getiriliyor...');
        const topTracksResponse = await music.getUserTopTracks(token, 'short_term', 5);
        
        if (topTracksResponse?.items && topTracksResponse.items.length > 0) {
          console.log(`✨ ${topTracksResponse.items.length} top track başarıyla yüklendi`);
          setTopTracks(topTracksResponse.items);
        } else {
          // Top tracks yoksa son çalınanları göster
          console.log('🎵 Top tracks bulunamadı, son çalınan şarkılar getiriliyor...');
          const recentlyPlayedResponse = await music.getRecentlyPlayed(token, 5);
          
          if (recentlyPlayedResponse?.items && recentlyPlayedResponse.items.length > 0) {
            console.log(`✨ ${recentlyPlayedResponse.items.length} son çalınan şarkı başarıyla yüklendi`);
            const tracks = recentlyPlayedResponse.items.map(item => item.track);
            setTopTracks(tracks);
          } else {
            console.warn('⚠️ Top tracks veya son çalınanlar bulunamadı');
          }
        }
      } catch (error) {
        console.error('❌ Top tracks getirirken hata:', error);
      }

    } catch (apiError) {
      console.error('❌ Genel API hatası:', apiError);
      setError('Müzik verileriniz yüklenemedi. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Uygulama açıldığında verileri yükle - ProfileScreen ile aynı
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Navigasyon yardımcıları
  const navigateToAlbum = (albumId: string) => {
    // @ts-ignore
    navigation.navigate('AlbumDetail', { id: albumId });
  };
  
  const navigateToPlaylist = (playlistId: string) => {
    // @ts-ignore
    navigation.navigate('PlaylistDetail', { id: playlistId });
  };
  
  const navigateToArtist = (artistId: string) => {
    // @ts-ignore
    navigation.navigate('ArtistDetail', { id: artistId });
  };
  
  const navigateToTrack = (trackId: string) => {
    // @ts-ignore
    navigation.navigate('TrackDetail', { id: trackId });
  };
  
  // Navigate to see all new releases
  const navigateToAllNewReleases = () => {
    // @ts-ignore
    navigation.navigate('AllNewReleases', { 
      title: 'New Releases',
      albums: newReleases
    });
  };
  
  // Navigate to see all top tracks
  const navigateToAllTopTracks = () => {
    // @ts-ignore
    navigation.navigate('AllTracks', { 
      title: 'Your Top Tracks',
      tracks: topTracks
    });
  };

  // Pull to refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Format milliseconds to minutes:seconds
  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Test track for mini player
  const testTrack = {
    id: 'test-track-id',
    name: 'Test Track',
    album: {
      id: 'test-album-id',
      name: 'Test Album',
      images: [{ url: 'https://via.placeholder.com/300', height: 300, width: 300 }]
    },
    artists: [{ id: 'test-artist-id', name: 'Test Artist', uri: 'spotify:artist:test-artist-id' }],
    duration_ms: 210000, // 3:30
    explicit: false,
    popularity: 50,
    preview_url: null,
    external_urls: {
      spotify: 'https://open.spotify.com/track/test-track-id'
    },
    uri: 'spotify:track:test-track-id'
  };
  
  // Function to play test track
  const playTestTrack = () => {
    if (play) {
      play(testTrack);
    }
  };

  // Function to play real Spotify music
  const playRealMusic = async () => {
    try {
      // Popular tracks to test
      const spotifyTracks = [
        // Daft Punk - Get Lucky
        'spotify:track:2Foc5Q5nqNiosCNqttzHof', 
        // The Weeknd - Blinding Lights
        'spotify:track:0VjIjW4GlUZAMYd2vXMi3b',
        // Dua Lipa - Levitating
        'spotify:track:39LLxExYz6ewLAcYrzQQyP',
        // Bad Bunny - Tití Me Preguntó
        'spotify:track:1IHWl5LamUGEuP4ozKQSXZ'
      ];
      
      // Rastgele bir parça seç
      const randomIndex = Math.floor(Math.random() * spotifyTracks.length);
      const trackUri = spotifyTracks[randomIndex];
      
      const token = await getToken();
      if (!token) {
        console.error('Token not available');
        alert('Spotify token alınamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      // Önce cihazları kontrol edelim
      console.log('Checking available devices...');
      const devices = await music.getAvailableDevices(token);
      console.log('Available devices:', devices.devices);
      
      // Eğer hiç cihaz yoksa, kullanıcıya bilgi ver
      if (devices.devices.length === 0) {
        alert('Spotify cihazı bulunamadı. Lütfen önce Spotify uygulamasını açın ve bir şarkı çalmaya başlayın.');
        return;
      }
      
      // Aktif cihaz var mı kontrol et
      const activeDevice = devices.devices.find(device => device.is_active);
      
      if (!activeDevice && devices.devices.length > 0) {
        console.log('No active device, attempting to activate:', devices.devices[0].name);
        
        try {
          // İlk cihazı aktif yapmaya çalış
          await music.transferPlayback(token, devices.devices[0].id, true);
          console.log('Device activated successfully, waiting briefly...');
          
          // Kısa bir süre bekle - cihaz aktifleşmesi için
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Şimdi çalmayı dene
          await music.playTrack(token, trackUri, devices.devices[0].id);
          console.log('Started playing track on newly activated device');
          
          // Başarılı mesajı göster
          setTimeout(() => {
            alert('Şarkı çalınmaya başlandı! Mini player barı artık görünür olmalı.');
          }, 1000);
        } catch (err) {
          console.error('Error activating device:', err);
          alert('Spotify cihazı aktifleştirilemedi. Lütfen Spotify uygulamanızda manuel olarak bir şarkı çalın, sonra tekrar deneyin.');
          return;
        }
      } else if (activeDevice) {
        console.log('Using active device:', activeDevice.name);
        
        // Aktif cihaz varsa, o cihazda çalmaya başla
        try {
          await music.playTrack(token, trackUri, activeDevice.id);
          console.log('Started playing track on active device');
          
          // Başarılı mesajı göster
          setTimeout(() => {
            alert('Şarkı çalınmaya başlandı! Mini player barı artık görünür olmalı.');
          }, 1000);
        } catch (playError) {
          console.error('Error playing track on active device:', playError);
          if (playError instanceof Error && playError.message.includes('403')) {
            alert('Spotify Premium hesabınızla ilgili bir sorun var. Premium hesap gereklidir.');
          } else {
            alert('Şarkı çalınamadı. Lütfen Spotify uygulamanızda manuel olarak bir şarkı çalmayı deneyin ve tekrar deneyin.');
          }
          return;
        }
      } else {
        alert('Spotify cihazınızla ilgili bir sorun oluştu. Lütfen Spotify uygulamanızı kapatıp açın ve tekrar deneyin.');
        return;
      }
    } catch (error) {
      console.error('Error playing real Spotify music:', error);
      
      // Hata mesajının türüne göre özel işleme
      if (error instanceof SyntaxError && error.message.includes('JSON Parse')) {
        // JSON parsing hatası - bu genellikle iyi bir işaret, API düzgün cevap verdi
        console.log('Successfully started playing a Spotify track (ignoring JSON parse error)');
        setTimeout(() => {
          alert('Şarkı çalınmaya başlandı! Mini player barı artık görünür olmalı.');
        }, 500);
      } else if (error instanceof Error) {
        const errorMessage = error.message || 'Bilinmeyen hata';
        if (errorMessage.includes('NO_ACTIVE_DEVICE') || errorMessage.includes('404')) {
          alert('Spotify uygulamanızda aktif cihaz bulunamadı. Lütfen Spotify uygulamasını açın ve bir şarkı çalmaya başlayın, sonra tekrar deneyin.');
        } else if (errorMessage.includes('PREMIUM_REQUIRED') || errorMessage.includes('403')) {
          alert('Bu özellik için Spotify Premium aboneliği gereklidir.');
        } else {
          alert(`Spotify çalmada bir hata oluştu: ${errorMessage}\nLütfen Spotify uygulamanızın aktif olduğundan emin olun.`);
        }
      } else {
        alert('Spotify çalmada bir hata oluştu. Lütfen Spotify uygulamanızın aktif olduğundan emin olun.');
      }
    }
  };
  
  // Function to toggle play/pause
  const togglePlayPause = () => {
    if (playerState?.isPlaying) {
      pause?.();
    } else {
      if (playerState?.currentTrack) {
        // Resume current track
        play?.(playerState.currentTrack);
      } else {
        // Play test track if no track is playing
        playTestTrack();
      }
    }
  };

  // Render an album card
  const renderAlbumCard = ({ item }: { item: Album }) => {
    const handlePlayAlbum = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        
        const album = await music.getAlbum(token, item.id);
        if (album.tracks.items.length > 0) {
          await play?.(album.tracks.items[0], album.tracks.items);
        }
      } catch (error) {
        console.error('Error playing album:', error);
      }
    };
    
    return (
      <TouchableOpacity 
        style={styles.albumCard}
        activeOpacity={0.7}
        onPress={() => {
          // @ts-ignore
          navigation.navigate('AlbumDetail', { id: item.id });
        }}
      >
        <Image 
          source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/200' }} 
          style={styles.albumImage} 
        />
        <View style={styles.albumInfo}>
          <Text style={[styles.albumTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.albumArtist, { color: theme.colors.text.secondary }]} numberOfLines={1}>
            {item.artists.map(artist => artist.name).join(', ')}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayAlbum}
        >
          <Ionicons name="play" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Render header with user info and player controls
  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={[styles.greeting, { color: theme.colors.text.secondary }]}>
          {greeting}
        </Text>
        <Text style={[styles.username, { color: theme.colors.text.primary }]}>
          {user?.display_name || 'Music Lover'}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.avatarContainer}
        onPress={() => {
          // @ts-ignore
          navigation.navigate('Profile');
        }}
      >
        <Image 
          source={{ 
            uri: user?.images?.[0]?.url || 'https://via.placeholder.com/40'
          }} 
          style={styles.avatar} 
        />
      </TouchableOpacity>
    </View>
  );

  // Loading state
  const renderLoadingState = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={{ color: theme.colors.text.secondary, marginTop: spacing.md }}>
        Müzik verileriniz yükleniyor...
      </Text>
    </View>
  );

  // Error state
  const renderError = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
      <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
      <Text style={{ 
        color: theme.colors.text.primary, 
        fontSize: 18, 
        fontWeight: 'bold',
        marginTop: spacing.md,
        textAlign: 'center'
      }}>
        Bir şeyler yanlış gitti
      </Text>
      <Text style={{ 
        color: theme.colors.text.secondary, 
        marginTop: spacing.sm,
        textAlign: 'center',
        marginBottom: spacing.lg
      }}>
        {error}
      </Text>
      <TouchableOpacity 
        style={{
          backgroundColor: theme.colors.primary,
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
          borderRadius: borderRadius.md
        }}
        onPress={fetchData}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Tekrar Dene</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {loading ? (
        renderLoadingState()
      ) : error ? (
        renderError()
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          {renderHeader()}
          
          {/* New Releases Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                New Releases
              </Text>
              <TouchableOpacity onPress={navigateToAllNewReleases}>
                <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
                  Browse All
                </Text>
              </TouchableOpacity>
            </View>
            
            {newReleases.length > 0 ? (
              <FlatList
                data={newReleases}
                renderItem={renderAlbumCard}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.albumList}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                  No new releases available
                </Text>
              </View>
            )}
          </View>
          
          {/* Top Tracks Section */}
          <View style={[styles.section, styles.lastSection]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Your Top Tracks
              </Text>
              <TouchableOpacity onPress={navigateToAllTopTracks}>
                <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
                  Browse All
                </Text>
              </TouchableOpacity>
            </View>
            
            {topTracks.length > 0 ? (
              <View style={{ paddingHorizontal: spacing.base }}>
                {topTracks.map((track) => renderTrackItem({ item: track, index: 0, separators: { highlight: () => {}, unhighlight: () => {}, updateProps: () => {} } }))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                  No tracks available
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
      
      {/* Test Player Buttons - Ekranın sağ alt köşesinde */}
      <View style={styles.testButtonsContainer}>
        <TouchableOpacity 
          style={[
            styles.testPlayerButton, 
            { backgroundColor: theme.colors.primary, marginBottom: 8 }
          ]} 
          onPress={togglePlayPause}
        >
          <Text style={styles.testPlayerButtonText}>
            {playerState?.isPlaying ? 'Pause' : 'Play Test'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.testPlayerButton, 
            { backgroundColor: '#1DB954' /* Spotify Green */ }
          ]} 
          onPress={playRealMusic}
        >
          <Text style={styles.testPlayerButtonText}>
            Play Spotify
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.base, // Header için yatay padding korundu
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: spacing.xxs,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: 0, // Section için yatay padding kaldırıldı
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
    paddingHorizontal: spacing.base, // Tüm section başlıkları için aynı yatay padding
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  albumList: {
    paddingLeft: spacing.base, // Tüm yatay listeler için aynı sol padding
    paddingRight: spacing.base / 2,
  },
  albumCard: {
    width: 160,
    height: 210,
    marginRight: spacing.base,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  albumImage: {
    width: '100%',
    height: '100%',
  },
  albumInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.base,
    justifyContent: 'flex-end',
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  albumArtist: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  trackCover: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.sm,
    backgroundColor: '#eee',
  },
  trackInfo: {
    flex: 1,
    marginLeft: spacing.base,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  trackArtist: {
    fontSize: 14,
    marginTop: 2,
  },
  trackDuration: {
    fontSize: 13,
    marginRight: spacing.base,
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
  },
  testButtonsContainer: {
    position: 'absolute',
    bottom: layout.tabBarHeight + spacing.md,
    right: spacing.md,
    alignItems: 'flex-end',
    zIndex: 100,
  },
  testPlayerButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  testPlayerButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  // Last section style
  lastSection: {
    marginBottom: spacing.xxxl,
  },
  playButton: {
    padding: spacing.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

export default HomeScreen;
