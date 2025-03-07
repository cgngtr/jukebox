import React, { useState, useEffect } from 'react';
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
import { music } from '../../api/music';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

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
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();
  
  // Artık ProfileScreen ile tam olarak aynı yapıyı kullanıyoruz
  // Mock hook yerine gerçek useAuth hook'unu kullanıyoruz
  const { user, getToken, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [greeting, setGreeting] = useState('Good Morning');
  const [newReleases, setNewReleases] = useState<Album[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState<Playlist[]>([]);
  const [featuredPlaylistMessage, setFeaturedPlaylistMessage] = useState('');

  // Selamlama metnini günün saatine göre ayarla
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);
  
  // Fetch all data - TAMAMEN ProfileScreen'deki yapıyla aynı
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      // ProfileScreen'deki aynı token alma yöntemini kullanıyoruz
      const token = await getToken();
      console.log('📢 API token durumu:', token ? '✓ Token alındı' : '✗ Token alınamadı');
      
      if (!token) {
        console.error('❌ Token alınamadı veya geçersiz');
        setError('Authentication failed. Please log in again.');
        setLoading(false);
        return;
      }
      
      // API çağrıları - ProfileScreen formatında
      console.log('🎯 ProfileScreen formatında API çağrıları başlatılıyor...');
      
      try {
        // New Releases
        try {
          console.log('📀 Yeni çıkan albümler getiriliyor...');
          const newReleasesResponse = await music.getNewReleases(token, 10);
          console.log('📝 API cevabı alındı:', newReleasesResponse ? 'Başarılı' : 'Başarısız');
          
          if (newReleasesResponse?.albums?.items) {
            console.log(`✨ ${newReleasesResponse.albums.items.length} yeni albüm başarıyla yüklendi`);
            setNewReleases(newReleasesResponse.albums.items);
          } else {
            console.warn('⚠️ Yeni albümler bulunamadı');
          }
        } catch (error) {
          console.error('❌ Yeni albümleri getirirken hata:', error);
        }
        
        // Top Tracks
        try {
          console.log('🎧 En çok dinlediğiniz şarkılar getiriliyor...');
          const topTracksResponse = await music.getUserTopTracks(token, 'medium_term', 5);
          console.log('📝 API cevabı alındı:', topTracksResponse ? 'Başarılı' : 'Başarısız');
          
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
        
        // Featured Playlists
        try {
          console.log('📋 Öne çıkan çalma listeleri getiriliyor...');
          const featuredResponse = await music.getFeaturedPlaylists(token, 10);
          console.log('📝 API cevabı alındı:', featuredResponse ? 'Başarılı' : 'Başarısız');
          
          if (featuredResponse?.playlists?.items) {
            console.log(`✨ ${featuredResponse.playlists.items.length} öne çıkan çalma listesi başarıyla yüklendi`);
            setFeaturedPlaylists(featuredResponse.playlists.items);
            setFeaturedPlaylistMessage(featuredResponse.message || 'Featured Playlists');
          } else {
            console.warn('⚠️ Öne çıkan çalma listeleri bulunamadı');
          }
        } catch (error) {
          console.error('❌ Öne çıkan çalma listelerini getirirken hata:', error);
        }
        
      } catch (apiError) {
        console.error('❌ Genel API hatası:', apiError);
        setError('Müzik verileriniz yüklenemedi. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
      }
      
    } catch (err) {
      console.error('❌ Kritik hata:', err);
      setError('Bir şeyler yanlış gitti. Yenilemek için aşağı çekin veya uygulamayı yeniden başlatın.');
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

  // Render an album card
  const renderAlbumCard = ({ item }: { item: Album }) => (
    <TouchableOpacity 
      style={styles.albumCard}
      activeOpacity={0.7}
      onPress={() => navigateToAlbum(item.id)}
    >
      <Image 
        source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/150' }} 
        style={styles.albumCover} 
      />
      <LinearGradient
        colors={[
          'rgba(0,0,0,0)',
          isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)'
        ]}
        style={styles.albumGradient}
      >
        <Text style={styles.albumTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.albumArtist} numberOfLines={1}>
          {item.artists.map(artist => artist.name).join(', ')}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Render a track item
  const renderTrackItem = ({ item }: { item: Track }) => (
    <TouchableOpacity 
      style={[
        styles.trackItem,
        { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }
      ]}
      activeOpacity={0.7}
      onPress={() => navigateToTrack(item.id)}
    >
      <Image 
        source={{ uri: item.album.images[0]?.url || 'https://via.placeholder.com/60' }} 
        style={styles.trackCover} 
      />
      <View style={styles.trackInfo}>
        <Text style={[styles.trackTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.trackArtist, { color: theme.colors.text.secondary }]} numberOfLines={1}>
          {item.artists.map(artist => artist.name).join(', ')}
        </Text>
      </View>
      <Text style={[styles.trackDuration, { color: theme.colors.text.secondary }]}>
        {formatDuration(item.duration_ms)}
      </Text>
    </TouchableOpacity>
  );

  // Render a featured playlist card
  const renderPlaylistCard = ({ item }: { item: Playlist }) => (
    <TouchableOpacity 
      style={styles.featuredCard} 
      activeOpacity={0.7}
      onPress={() => navigateToPlaylist(item.id)}
    >
      <Image
        source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/200' }}
        style={styles.featuredImage}
      />
      <View style={styles.featuredGradient}>
        <View style={styles.featuredContent}>
          <Text style={styles.featuredTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.featuredSubtitle} numberOfLines={2}>
            {item.description || `By ${item.owner.display_name}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Show loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Loading your music...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={fetchData}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeText, { color: theme.colors.text.secondary }]}>
              {greeting}
            </Text>
            <Text style={[styles.nameText, { color: theme.colors.text.primary }]}>
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

        {/* New Releases */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              New Releases
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
                See All
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

        {/* Top Tracks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Your Top Tracks
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          
          {topTracks.length > 0 ? (
            <Card style={styles.tracksCard}>
              {topTracks.slice(0, 5).map((track) => (
                <React.Fragment key={track.id}>
                  {renderTrackItem({ item: track })}
                </React.Fragment>
              ))}
            </Card>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                No top tracks available yet
              </Text>
            </View>
          )}
        </View>

        {/* Featured Playlists */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              {featuredPlaylistMessage}
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
                Browse All
              </Text>
            </TouchableOpacity>
          </View>
          
          {featuredPlaylists.length > 0 ? (
            <FlatList
              data={featuredPlaylists}
              renderItem={renderPlaylistCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                No featured playlists available
              </Text>
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
    paddingBottom: layout.tabBarHeight + spacing.xl, // Extra bottom padding for tabBar
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: spacing.xxs,
  },
  avatarContainer: {
    height: 40,
    width: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  avatar: {
    height: 40,
    width: 40,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  lastSection: {
    marginBottom: spacing.xxxl,
  },
  albumList: {
    paddingBottom: spacing.sm,
  },
  albumCard: {
    width: 180,
    height: 240,
    marginRight: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  albumCover: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.lg,
  },
  albumGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  albumArtist: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tracksCard: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
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
    marginLeft: spacing.sm,
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
  },
  featuredList: {
    paddingBottom: spacing.sm,
  },
  featuredCard: {
    width: 220,
    height: 220,
    marginRight: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  featuredContent: {
    padding: spacing.md,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.base,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    marginTop: spacing.base,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.pill,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    marginLeft: 56 + spacing.base, // Match the left edge of track info
  },
});

export default HomeScreen;
