import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../../styles';
import { music } from '../../api';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { usePlayer } from '../../context/PlayerContext';
import { LinearGradient } from 'expo-linear-gradient';
import { ReviewList } from '../../components/reviews';
import { getReviewsByItem } from '../../api/reviews';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';

// Define the route params type
type AlbumDetailParams = {
  albumId: string;
  albumName?: string;
  artistName?: string;
  coverUrl?: string;
};

type RootStackParamList = {
  AlbumDetail: AlbumDetailParams;
};

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

type AlbumDetailRouteProp = RouteProp<AppStackParamList, 'AlbumDetail'>;

const AlbumDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const { getToken } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AlbumDetailRouteProp>();
  const routeParams = route.params || {}; 
  const albumId = routeParams.albumId || routeParams.id || '';
  const { albumName, artistName, coverUrl } = routeParams;
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tracks' | 'reviews'>('tracks');
  const [reviewsCount, setReviewsCount] = useState(0);
  const windowWidth = Dimensions.get('window').width;
  
  const player = usePlayer();
  
  // Ekranın hangi modda olduğunu izlemek için yeni state
  const [screenMode, setScreenMode] = useState<'tracks' | 'reviews'>('tracks');
  
  useEffect(() => {
    loadAlbumData();
  }, [albumId]);
  
  const loadAlbumData = async () => {
    setLoading(true);
    try {
      // Ensure we have a token and albumId
      const token = await getToken();
      if (!token || !albumId) {
        throw new Error('Missing token or album ID');
      }

      // Fetch album data
      const albumData = await music.getAlbum(token, albumId);
      setAlbum(albumData);
      
      // Fetch review count
      const { count } = await getReviewsByItem(albumId, 'album', 1, 1);
      setReviewsCount(count);
    } catch (error) {
      console.error('Error loading album data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Parçayı çalma işlevi
  const handlePlayTrack = async (track: any, index: number) => {
    try {
      // Convert album tracks to SpotifyTrack format if needed
      const trackList = album.tracks.items.map((track: any) => ({
        ...track,
        album: {
          id: album.id,
          name: album.name,
          images: album.images
        }
      }));
      
      // Play the selected track with the album's track list
      await player.play(trackList[index], trackList);
    } catch (error) {
      console.error('Track playback error:', error);
    }
  };
  
  // Navigate to the write review screen
  const handleWriteReview = () => {
    if (!albumId) return;
    
    navigation.navigate('CreateReview', {
      itemId: albumId,
      itemType: 'album',
      itemName: album?.name,
      itemImage: album?.images?.[0]?.url
    });
  };
  
  // Tab'a tıklandığında hem activeTab hem de screenMode'u güncelleme
  const handleTabPress = (tab: 'tracks' | 'reviews') => {
    setActiveTab(tab);
    setScreenMode(tab);
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Loading album...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={loadAlbumData}
          >
            <Text style={{ color: 'white' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!album) return null;
  
  // Track listesi içeren ekran
  const renderTracksScreen = () => (
    <ScrollView 
      showsVerticalScrollIndicator={false}
    >
      {/* Header bölümü */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Cover art ve bilgi */}
      <LinearGradient
        colors={[`${theme.colors.primary}30`, theme.colors.background]}
        style={styles.albumGradient}
      >
        <View style={styles.albumHeader}>
          <Image 
            source={{ uri: album.images[0]?.url || 'https://via.placeholder.com/300' }}
            style={[styles.albumCover, {
              shadowColor: theme.colors.text.primary,
              borderColor: theme.colors.background === '#121212' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            }]}
          />
          <Text style={[styles.albumTitle, { color: theme.colors.text.primary }]}>
            {album.name}
          </Text>
          <TouchableOpacity
            onPress={() => {
              // @ts-ignore
              navigation.navigate('ArtistDetail', { id: album.artists[0].id });
            }}
          >
            <Text style={[styles.albumArtist, { color: theme.colors.primary }]}>
              {album.artists.map((a: any) => a.name).join(', ')}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.albumInfo, { color: theme.colors.text.secondary }]}>
            {album.album_type.charAt(0).toUpperCase() + album.album_type.slice(1)} • {album.release_date.split('-')[0]} • {album.total_tracks} songs
          </Text>
        </View>
      </LinearGradient>
      
      {/* Tab navigation */}
      <View style={[styles.tabContainer, { borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            { width: windowWidth / 2 }
          ]}
          onPress={() => handleTabPress('tracks')}
        >
          <Text 
            style={[
              styles.tabText,
              { color: activeTab === 'tracks' ? theme.colors.primary : theme.colors.text.secondary }
            ]}
          >
            Tracks
          </Text>
          {activeTab === 'tracks' && (
            <View style={[styles.activeTabIndicator, { backgroundColor: theme.colors.primary }]} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            { width: windowWidth / 2 }
          ]}
          onPress={() => handleTabPress('reviews')}
        >
          <Text 
            style={[
              styles.tabText,
              { color: activeTab === 'reviews' ? theme.colors.primary : theme.colors.text.secondary }
            ]}
          >
            Reviews ({reviewsCount})
          </Text>
          {activeTab === 'reviews' && (
            <View style={[styles.activeTabIndicator, { backgroundColor: theme.colors.primary }]} />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Şarkı listesi */}
      <View style={styles.trackListContainer}>
        {album.tracks.items.map((track: any, index: number) => (
          <TouchableOpacity 
            key={track.id}
            style={[
              styles.trackItem, 
              { borderBottomColor: theme.colors.divider }
            ]}
            onPress={() => handlePlayTrack(track, index)}
          >
            <View style={styles.trackIndexContainer}>
              <Text style={[styles.trackIndex, { color: theme.colors.text.secondary }]}>
                {index + 1}
              </Text>
            </View>
            <View style={styles.trackInfo}>
              <Text style={[styles.trackName, { color: theme.colors.text.primary }]}>
                {track.name}
              </Text>
              <View style={styles.trackArtists}>
                {track.explicit && (
                  <View style={[styles.explicitBadge, { backgroundColor: theme.colors.text.secondary }]}>
                    <Text style={styles.explicitText}>E</Text>
                  </View>
                )}
                <Text style={[styles.trackArtist, { color: theme.colors.text.secondary }]}>
                  {track.artists.map((artist: any) => artist.name).join(', ')}
                </Text>
              </View>
            </View>
            <View style={styles.trackControls}>
              <Text style={[styles.trackDuration, { color: theme.colors.text.secondary }]}>
                {Math.floor(track.duration_ms / 60000)}:
                {(Math.floor((track.duration_ms % 60000) / 1000) < 10 ? '0' : '')}
                {Math.floor((track.duration_ms % 60000) / 1000)}
              </Text>
              <TouchableOpacity style={styles.trackOptions}>
                <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
  
  // Reviews ekranı
  const renderReviewsScreen = () => (
    <ScrollView 
      showsVerticalScrollIndicator={false}
    >
      {/* Header bölümü */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Cover art ve bilgi */}
      <LinearGradient
        colors={[`${theme.colors.primary}30`, theme.colors.background]}
        style={styles.albumGradient}
      >
        <View style={styles.albumHeader}>
          <Image 
            source={{ uri: album.images[0]?.url || 'https://via.placeholder.com/300' }}
            style={[styles.albumCover, {
              shadowColor: theme.colors.text.primary,
              borderColor: theme.colors.background === '#121212' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            }]}
          />
          <Text style={[styles.albumTitle, { color: theme.colors.text.primary }]}>
            {album.name}
          </Text>
          <TouchableOpacity
            onPress={() => {
              // @ts-ignore
              navigation.navigate('ArtistDetail', { id: album.artists[0].id });
            }}
          >
            <Text style={[styles.albumArtist, { color: theme.colors.primary }]}>
              {album.artists.map((a: any) => a.name).join(', ')}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.albumInfo, { color: theme.colors.text.secondary }]}>
            {album.album_type.charAt(0).toUpperCase() + album.album_type.slice(1)} • {album.release_date.split('-')[0]} • {album.total_tracks} songs
          </Text>
        </View>
      </LinearGradient>
      
      {/* Tab navigation */}
      <View style={[styles.tabContainer, { borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            { width: windowWidth / 2 }
          ]}
          onPress={() => handleTabPress('tracks')}
        >
          <Text 
            style={[
              styles.tabText,
              { color: activeTab === 'tracks' ? theme.colors.primary : theme.colors.text.secondary }
            ]}
          >
            Tracks
          </Text>
          {activeTab === 'tracks' && (
            <View style={[styles.activeTabIndicator, { backgroundColor: theme.colors.primary }]} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            { width: windowWidth / 2 }
          ]}
          onPress={() => handleTabPress('reviews')}
        >
          <Text 
            style={[
              styles.tabText,
              { color: activeTab === 'reviews' ? theme.colors.primary : theme.colors.text.secondary }
            ]}
          >
            Reviews ({reviewsCount})
          </Text>
          {activeTab === 'reviews' && (
            <View style={[styles.activeTabIndicator, { backgroundColor: theme.colors.primary }]} />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Reviews section */}
      <View style={styles.reviewsContainer}>
        <View style={styles.reviewsHeader}>
          <Text style={[styles.reviewsSectionTitle, { color: theme.colors.text.primary }]}>
            Reviews
          </Text>
          <TouchableOpacity 
            style={[styles.writeReviewButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleWriteReview}
          >
            <Ionicons name="create-outline" size={18} color="#fff" style={styles.writeReviewIcon} />
            <Text style={styles.writeReviewText}>Write a Review</Text>
          </TouchableOpacity>
        </View>
        
        <ReviewList 
          itemId={albumId}
          itemType="album"
          onReviewPress={(review) => 
            navigation.navigate('ReviewDetail', { reviewId: review.id })
          }
          onLikePress={(review) => 
            console.log('Like pressed for review:', review.id)
          }
          onCommentPress={(review) => 
            navigation.navigate('ReviewDetail', { reviewId: review.id, showComments: true })
          }
          emptyStateMessage="No reviews yet for this album. Be the first to share your thoughts!"
        />
      </View>
    </ScrollView>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {screenMode === 'tracks' ? renderTracksScreen() : renderReviewsScreen()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  albumGradient: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  albumHeader: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  albumCover: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 0.5,
  },
  albumTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  albumArtist: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  albumInfo: {
    fontSize: 14,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    marginTop: -20,
    backgroundColor: 'transparent',
  },
  tabButton: {
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '40%',
    borderRadius: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  trackListContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  trackIndexContainer: {
    width: 30,
    alignItems: 'center',
  },
  trackIndex: {
    fontSize: 14,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  trackArtists: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackArtist: {
    fontSize: 14,
  },
  explicitBadge: {
    width: 16,
    height: 16,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  explicitText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  trackControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackDuration: {
    fontSize: 14,
    marginRight: 12,
  },
  trackOptions: {
    padding: 5,
  },
  reviewsContainer: {
    padding: 16,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewsSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  writeReviewIcon: {
    marginRight: 6,
  },
  writeReviewText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default AlbumDetailScreen;
