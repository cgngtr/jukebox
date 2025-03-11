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
type TrackDetailParams = {
  trackId: string;
  trackName?: string;
  artistName?: string;
  coverUrl?: string;
  albumId?: string;
  albumName?: string;
};

type RootStackParamList = {
  TrackDetail: TrackDetailParams;
};

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

type TrackDetailRouteProp = RouteProp<AppStackParamList, 'TrackDetail'>;

const TrackDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const { getToken } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TrackDetailRouteProp>();
  const routeParams = route.params || {};
  const trackId = routeParams.trackId || routeParams.id || '';
  const { trackName, artistName, coverUrl, albumId, albumName } = routeParams;
  const [track, setTrack] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const player = usePlayer();
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [reviewsCount, setReviewsCount] = useState(0);
  const windowWidth = Dimensions.get('window').width;
  const [screenMode, setScreenMode] = useState<'details' | 'reviews'>('details');
  
  useEffect(() => {
    loadTrackData();
  }, [trackId]);
  
  const loadTrackData = async () => {
    setLoading(true);
    try {
      // Ensure we have a token and trackId
      const token = await getToken();
      if (!token || !trackId) {
        throw new Error('Missing token or track ID');
      }

      // Fetch track data
      const trackData = await music.getTrack(token, trackId);
      setTrack(trackData);
      
      // Fetch review count
      const { count } = await getReviewsByItem(trackId, 'track', 1, 1);
      setReviewsCount(count);
    } catch (error) {
      console.error('Error loading track data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Parçayı çalma işlevi
  const handlePlayTrack = async () => {
    try {
      if (!track) return;
      
      // Convert track to SpotifyTrack format if needed
      const spotifyTrack = {
        ...track,
        uri: `spotify:track:${track.id}`,
        external_urls: {
          spotify: `https://open.spotify.com/track/${track.id}`
        }
      };
      
      // Play the track
      await player.play(spotifyTrack);
    } catch (error) {
      console.error('Track playback error:', error);
    }
  };
  
  // Navigate to the write review screen
  const handleWriteReview = () => {
    if (!trackId) return;
    
    navigation.navigate('CreateReview', {
      itemId: trackId,
      itemType: 'track',
      itemName: track?.name,
      itemImage: track?.coverUrl
    });
  };
  
  // Navigate to album
  const handleAlbumPress = () => {
    // Use the album ID from either the track.album.id (from API) or the route params
    const albumIdentifier = track?.album?.id || albumId;
    
    if (albumIdentifier) {
      navigation.navigate('AlbumDetail', {
        id: albumIdentifier,
        albumId: albumIdentifier,
        albumName: track?.album?.name || albumName || 'Unknown Album',
        artistName: track?.artists?.[0]?.name || artistName,
        coverUrl: track?.album?.images?.[0]?.url || coverUrl
      });
    }
  };
  
  // Tab'a tıklandığında hem activeTab hem de screenMode'u güncelleme
  const handleTabPress = (tab: 'details' | 'reviews') => {
    setActiveTab(tab);
    setScreenMode(tab);
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Loading track...
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
            onPress={loadTrackData}
          >
            <Text style={{ color: 'white' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!track) return null;
  
  // Details screen
  const renderDetailsScreen = () => (
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
        style={styles.trackGradient}
      >
        <View style={styles.trackHeader}>
          <Image 
            source={{ uri: track.album?.images?.[0]?.url || coverUrl || 'https://via.placeholder.com/300' }}
            style={[styles.trackCover, {
              shadowColor: theme.colors.text.primary,
              borderColor: theme.colors.background === '#121212' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            }]}
          />
          <Text style={[styles.trackTitle, { color: theme.colors.text.primary }]}>
            {track.name}
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (track?.artists?.[0]?.id) {
                navigation.navigate('ArtistDetail', { id: track.artists[0].id });
              }
            }}
          >
            <Text style={[styles.trackArtist, { color: theme.colors.primary }]}>
              {track.artists?.map((a: any) => a.name).join(', ') || artistName}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
            onPress={handlePlayTrack}
          >
            <Ionicons name="play" size={24} color="#fff" />
            <Text style={styles.playButtonText}>Play Track</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      {/* Tab navigation */}
      <View style={[styles.tabContainer, { borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            { width: windowWidth / 2 }
          ]}
          onPress={() => handleTabPress('details')}
        >
          <Text 
            style={[
              styles.tabText,
              { color: activeTab === 'details' ? theme.colors.primary : theme.colors.text.secondary }
            ]}
          >
            Details
          </Text>
          {activeTab === 'details' && (
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
      
      {/* Track details */}
      <View style={styles.detailsContainer}>
        <View style={[styles.detailCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.detailSectionTitle, { color: theme.colors.text.primary }]}>
            Album
          </Text>
          
          <TouchableOpacity 
            style={styles.albumLink}
            onPress={handleAlbumPress}
          >
            <Image
              source={{ uri: track.album?.images?.[0]?.url || coverUrl || 'https://via.placeholder.com/300' }}
              style={styles.albumThumbnail}
            />
            <View style={styles.albumInfo}>
              <Text style={[styles.albumName, { color: theme.colors.text.primary }]}>
                {track.album?.name || albumName || 'Unknown Album'}
              </Text>
              <Text style={[styles.albumYear, { color: theme.colors.text.secondary }]}>
                {track.album?.release_date ? track.album.release_date.split('-')[0] : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.detailCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.detailSectionTitle, { color: theme.colors.text.primary }]}>
            Track Info
          </Text>
          
          <View style={styles.trackInfoRow}>
            <Text style={[styles.trackInfoLabel, { color: theme.colors.text.secondary }]}>
              Duration
            </Text>
            <Text style={[styles.trackInfoValue, { color: theme.colors.text.primary }]}>
              {Math.floor(track.duration_ms / 60000)}:
              {(Math.floor((track.duration_ms % 60000) / 1000) < 10 ? '0' : '')}
              {Math.floor((track.duration_ms % 60000) / 1000)}
            </Text>
          </View>
          
          <View style={styles.trackInfoRow}>
            <Text style={[styles.trackInfoLabel, { color: theme.colors.text.secondary }]}>
              Popularity
            </Text>
            <View style={styles.popularityContainer}>
              <View 
                style={[
                  styles.popularityBar, 
                  { backgroundColor: theme.colors.divider }
                ]}
              >
                <View 
                  style={[
                    styles.popularityFill, 
                    { 
                      backgroundColor: theme.colors.primary,
                      width: `${track.popularity || 0}%` 
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.popularityText, { color: theme.colors.text.primary }]}>
                {track.popularity || 0}%
              </Text>
            </View>
          </View>
          
          {track.explicit && (
            <View style={styles.trackInfoRow}>
              <Text style={[styles.trackInfoLabel, { color: theme.colors.text.secondary }]}>
                Content
              </Text>
              <View style={[styles.explicitBadge, { backgroundColor: theme.colors.text.secondary }]}>
                <Text style={styles.explicitText}>EXPLICIT</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
  
  // Reviews screen
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
        style={styles.trackGradient}
      >
        <View style={styles.trackHeader}>
          <Image 
            source={{ uri: track.album?.images?.[0]?.url || coverUrl || 'https://via.placeholder.com/300' }}
            style={[styles.trackCover, {
              shadowColor: theme.colors.text.primary,
              borderColor: theme.colors.background === '#121212' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            }]}
          />
          <Text style={[styles.trackTitle, { color: theme.colors.text.primary }]}>
            {track.name}
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (track?.artists?.[0]?.id) {
                navigation.navigate('ArtistDetail', { id: track.artists[0].id });
              }
            }}
          >
            <Text style={[styles.trackArtist, { color: theme.colors.primary }]}>
              {track.artists?.map((a: any) => a.name).join(', ') || artistName}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      {/* Tab navigation */}
      <View style={[styles.tabContainer, { borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            { width: windowWidth / 2 }
          ]}
          onPress={() => handleTabPress('details')}
        >
          <Text 
            style={[
              styles.tabText,
              { color: activeTab === 'details' ? theme.colors.primary : theme.colors.text.secondary }
            ]}
          >
            Details
          </Text>
          {activeTab === 'details' && (
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
          itemId={trackId}
          itemType="track"
          onReviewPress={(review) => 
            navigation.navigate('ReviewDetail', { reviewId: review.id })
          }
          onLikePress={(review) => 
            console.log('Like pressed for review:', review.id)
          }
          onCommentPress={(review) => 
            navigation.navigate('ReviewDetail', { reviewId: review.id, showComments: true })
          }
          emptyStateMessage="No reviews yet for this track. Be the first to share your thoughts!"
        />
      </View>
    </ScrollView>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {screenMode === 'details' ? renderDetailsScreen() : renderReviewsScreen()}
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
  trackGradient: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  trackHeader: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  trackCover: {
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
  trackTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  trackArtist: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 8,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  detailsContainer: {
    padding: 16,
  },
  detailCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  albumLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 6,
  },
  albumInfo: {
    flex: 1,
    marginLeft: 16,
  },
  albumName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  albumYear: {
    fontSize: 14,
  },
  trackInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trackInfoLabel: {
    fontSize: 14,
  },
  trackInfoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  popularityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '60%',
  },
  popularityBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  popularityFill: {
    height: '100%',
  },
  popularityText: {
    fontSize: 14,
    fontWeight: '500',
    width: 40,
    textAlign: 'right',
  },
  explicitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  explicitText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
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

export default TrackDetailScreen;
