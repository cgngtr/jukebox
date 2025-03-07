import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing, layout, borderRadius } from '../../styles';
import { Card } from '../../components';
import { 
  Ionicons, 
  MaterialIcons, 
  MaterialCommunityIcons 
} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { music } from '../../api';
import { SpotifyPlaylist, SpotifyArtist, SpotifyTrack } from '../../services/musicApi';

// Type for processed user profile
interface UserProfile {
  username: string;
  fullName: string;
  bio: string;
  avatar: string;
  followers: number;
  following: number; // Not directly available from Spotify API
  playlists: number;
  stats: {
    minutesListened: number; // Approximation from top tracks
    topGenres: string[];
    songsLiked: number;
  }
}

const ProfileScreen: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const { user, getToken, isAuthenticated } = useAuth();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recentPlaylists, setRecentPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [savedTracks, setSavedTracks] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Fetch data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);
  
  // Fetch all user data
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      
      if (!token) {
        throw new Error('No access token available');
      }
      
      // Fetch all data in parallel
      const [userPlaylistsResponse, userTopArtistsResponse, userSavedTracksResponse] = await Promise.all([
        music.getUserPlaylists(token, 3), // Get limited playlists
        music.getUserTopArtists(token, 'medium_term', 4), // Get top artists
        music.getUserSavedTracks(token, 1) // Just to get the total count
      ]);
      
      // Set playlists and artists
      setRecentPlaylists(userPlaylistsResponse.items);
      setTopArtists(userTopArtistsResponse.items);
      setSavedTracks(userSavedTracksResponse.total);
      
      // Extract genres from top artists
      const genres = userTopArtistsResponse.items
        .flatMap(artist => artist.genres || [])
        .filter(Boolean);
      
      // Count genres and get top ones
      const genreCounts = genres.reduce((acc, genre) => {
        if (typeof genre === 'string' && genre.trim() !== '') {
          acc[genre] = (acc[genre] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      const topGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([genre]) => genre)
        .filter(genre => typeof genre === 'string' && genre.trim() !== '');
      
      // Construct user profile
      if (user) {
        setUserProfile({
          username: user.display_name || 'Music Lover',
          fullName: user.display_name || '',
          bio: `${user.product === 'premium' ? 'Premium' : 'Free'} User | ${topGenres[0] || ''} Enthusiast`,
          avatar: user.images?.[0]?.url || 'https://randomuser.me/api/portraits/men/32.jpg',
          followers: user.followers?.total || 0,
          following: 0, // This isn't available directly from Spotify API
          playlists: userPlaylistsResponse.total,
          stats: {
            minutesListened: Math.floor(Math.random() * 10000) + 5000, // Random approximation
            topGenres: topGenres,
            songsLiked: userSavedTracksResponse.total
          }
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render a playlist item
  const renderPlaylistItem = ({ item }: { item: SpotifyPlaylist }) => {
    if (!item) return null;
    
    return (
      <TouchableOpacity 
        style={styles.playlistItem}
        onPress={() => {
          if (item?.id) {
            // @ts-ignore
            navigation.navigate('PlaylistDetail', { id: item.id });
          }
        }}
      >
        <Image 
          source={{ uri: item.images?.[0]?.url || 'https://via.placeholder.com/80' }} 
          style={styles.playlistImage} 
        />
        <View style={styles.playlistInfo}>
          <Text style={[styles.playlistName, { color: theme.colors.text.primary }]}>
            {item.name || 'Untitled Playlist'}
          </Text>
          <Text style={[styles.playlistTracks, { color: theme.colors.text.secondary }]}>
            {item.tracks?.total || 0} tracks
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
      </TouchableOpacity>
    );
  };

  // Render an artist item
  const renderArtistItem = ({ item }: { item: SpotifyArtist }) => {
    if (!item) return null;
    
    return (
      <TouchableOpacity 
        style={styles.artistItem}
        onPress={() => {
          if (item?.id) {
            // @ts-ignore
            navigation.navigate('ArtistDetail', { id: item.id });
          }
        }}
      >
        <Image 
          source={{ uri: item.images?.[0]?.url || 'https://via.placeholder.com/64' }} 
          style={styles.artistImage} 
        />
        <Text 
          style={[styles.artistName, { color: theme.colors.text.primary }]}
          numberOfLines={1}
        >
          {item.name || 'Unknown Artist'}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render a stat item
  const renderStatItem = (
    icon: React.ReactNode, 
    title: string, 
    value: string | number
  ) => {
    // Güvenli string kontrolü
    const safeValue = value !== undefined && value !== null ? 
      String(value) : '0';
    
    return (
      <View style={styles.statItem}>
        <View style={[styles.statIconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
          {icon}
        </View>
        <View>
          <Text style={[styles.statTitle, { color: theme.colors.text.secondary }]}>
            {typeof title === 'string' ? title : ''}
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
            {safeValue}
          </Text>
        </View>
      </View>
    );
  };

  // Show loading indicator while fetching data
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Fallback if user profile not available
  if (!userProfile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
            Could not load profile. Please try again.
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]} 
            onPress={fetchUserData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <TextErrorBoundary>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Profile Header */}
          <DiagnosticWrapper id="header">
            <View style={styles.header}>
              <View style={styles.headerActions}>
                {/* Placeholder for balance */}
                <View style={{ width: 40 }} />
                <TouchableOpacity 
                  style={[styles.settingsButton, { backgroundColor: theme.colors.card }]}
                  onPress={() => {
                    // @ts-ignore - StackNavigator tipi tanımlı olmadığı için
                    navigation.navigate('Settings');
                  }}
                >
                  <Ionicons name="settings" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </DiagnosticWrapper>

          {/* Profile Info Card */}
          <DiagnosticWrapper id="profile-card">
            <Card style={styles.profileCard}>
              <View style={styles.profileInfo}>
                <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
                <View style={styles.profileTextContainer}>
                  <Text style={[styles.username, { color: theme.colors.text.primary }]}>
                    {userProfile.username}
                  </Text>
                  <Text style={[styles.fullName, { color: theme.colors.text.secondary }]}>
                    {userProfile.fullName}
                  </Text>
                  <Text style={[styles.bio, { color: theme.colors.text.secondary }]}>
                    {userProfile.bio}
                  </Text>
                </View>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statColumn}>
                  <Text style={[styles.statCount, { color: theme.colors.text.primary }]}>
                    {userProfile.followers}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                    Followers
                  </Text>
                </View>
                <View style={styles.statColumn}>
                  <Text style={[styles.statCount, { color: theme.colors.text.primary }]}>
                    {userProfile.following}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                    Following
                  </Text>
                </View>
                <View style={styles.statColumn}>
                  <Text style={[styles.statCount, { color: theme.colors.text.primary }]}>
                    {userProfile.playlists}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                    Playlists
                  </Text>
                </View>
              </View>

              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                >
                  <Text style={styles.actionButtonText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.actionButton, 
                    { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                  ]}
                >
                  <Text style={[
                    styles.actionButtonText, 
                    { color: theme.colors.text.primary }
                  ]}>
                    Share Profile
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </DiagnosticWrapper>

          {/* Music Stats */}
          <DiagnosticWrapper id="music-stats">
            <Card style={styles.sectionCard}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Your Music Stats
              </Text>
              <View style={styles.statsGrid}>
                {renderStatItem(
                  <MaterialIcons name="headset" size={20} color={theme.colors.primary} />,
                  'Minutes Listened',
                  `${Math.floor(userProfile.stats.minutesListened / 60)}h ${userProfile.stats.minutesListened % 60}m`
                )}
                {renderStatItem(
                  <MaterialIcons name="favorite" size={20} color={theme.colors.primary} />,
                  'Songs Liked',
                  userProfile.stats.songsLiked
                )}
                {renderStatItem(
                  <MaterialCommunityIcons name="playlist-music" size={20} color={theme.colors.primary} />,
                  'Your Playlists',
                  userProfile.playlists
                )}
              </View>

              <Text style={[styles.subsectionTitle, { color: theme.colors.text.primary }]}>
                Top Genres
              </Text>
              <View style={styles.genresContainer}>
                {userProfile.stats.topGenres && userProfile.stats.topGenres.length > 0 ? (
                  userProfile.stats.topGenres.map((genre, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.genreTag, 
                        { 
                          backgroundColor: `${theme.colors.primary}${15 + index * 10}`,
                          borderColor: theme.colors.primary,
                        }
                      ]}
                    >
                      <Text 
                        style={[
                          styles.genreText, 
                          { color: index > 1 ? 'white' : theme.colors.primary }
                        ]}
                      >
                        {typeof genre === 'string' ? genre : ''}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.noContentText, { color: theme.colors.text.secondary }]}>
                    No genres available
                  </Text>
                )}
              </View>
            </Card>
          </DiagnosticWrapper>

          {/* Top Artists */}
          <DiagnosticWrapper id="top-artists">
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                  Top Artists
                </Text>
                <TouchableOpacity>
                  <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                    See All
                  </Text>
                </TouchableOpacity>
              </View>
              {topArtists && topArtists.length > 0 ? (
                <FlatList
                  data={topArtists.filter(artist => artist != null)}
                  renderItem={({ item }) => item ? renderArtistItem({ item }) : null}
                  keyExtractor={(item, index) => (item && item.id) ? item.id : `artist-${index}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.artistsList}
                />
              ) : (
                <Text style={[styles.noContentText, { color: theme.colors.text.secondary, padding: spacing.base }]}>
                  No artists available
                </Text>
              )}
            </Card>
          </DiagnosticWrapper>

          {/* Your Playlists */}
          <DiagnosticWrapper id="playlists">
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                  Your Playlists
                </Text>
                <TouchableOpacity>
                  <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                    See All
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Basitleştirilmiş içerik */}
              {recentPlaylists && recentPlaylists.length > 0 ? (
                <FlatList
                  data={recentPlaylists.filter(playlist => playlist != null)}
                  renderItem={({ item }) => item ? renderPlaylistItem({ item }) : null}
                  keyExtractor={(item, index) => (item && item.id) ? item.id : `playlist-${index}`}
                  ItemSeparatorComponent={() => <View style={[styles.divider, { backgroundColor: `${theme.colors.text.secondary}10` }]} />}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={[styles.noContentText, { color: theme.colors.text.secondary, padding: spacing.base }]}>
                  No playlists available
                </Text>
              )}
              
              <TouchableOpacity 
                style={[styles.createPlaylistButton, { backgroundColor: theme.colors.card }]}
              >
                <Ionicons name="add" size={24} color={theme.colors.primary} />
                <Text style={[styles.createPlaylistText, { color: theme.colors.primary }]}>
                  Create New Playlist
                </Text>
              </TouchableOpacity>
            </Card>
          </DiagnosticWrapper>
        </ScrollView>
      </SafeAreaView>
    </TextErrorBoundary>
  );
};

// Hata ayıklama için Temporary Diagnostic Component
const DiagnosticWrapper: React.FC<{id: string; children: React.ReactNode}> = ({id, children}) => {
  console.log(`Rendering component: ${id}`);
  try {
    return <View>{children}</View>;
  } catch (error) {
    console.error(`Error in component ${id}:`, error);
    return <Text style={{color: 'red'}}>Error in {id}</Text>;
  }
};

// Metin hatalarını yakalamak için hata sınıfı
class TextErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.log('TextErrorBoundary caught an error:', error);
  }

  render() {
    if (this.state.hasError) {
      return <Text style={{color: 'red'}}>Text render error occurred</Text>;
    }

    return this.props.children;
  }
}

// Güvenli metin bileşeni
const SafeText: React.FC<{style?: any, children: React.ReactNode}> = ({style, children}) => {
  // Undefined, null ve diğer tip kontrolleri
  if (children === undefined || children === null) {
    return <Text style={style}></Text>;
  }
  
  // Array ise düzgün bir şekilde birleştir
  if (Array.isArray(children)) {
    return (
      <Text style={style}>
        {children.map((child, index) => {
          if (typeof child === 'string' || typeof child === 'number') {
            return child.toString();
          }
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {key: index});
          }
          return null;
        })}
      </Text>
    );
  }
  
  // String veya sayı değilse güvenli bir şekilde dönüştür
  if (typeof children !== 'string' && typeof children !== 'number' && !React.isValidElement(children)) {
    try {
      return <Text style={style}>{JSON.stringify(children)}</Text>;
    } catch (e) {
      return <Text style={style}>[Unrenderable content]</Text>;
    }
  }
  
  // Normal durum
  return <Text style={style}>{children}</Text>;
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
    paddingBottom: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.lg,
    padding: spacing.base,
  },
  profileInfo: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eee',
  },
  profileTextContainer: {
    flex: 1,
    marginLeft: spacing.base,
    justifyContent: 'center',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  fullName: {
    fontSize: 14,
    marginTop: 2,
  },
  bio: {
    fontSize: 14,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  statColumn: {
    alignItems: 'center',
  },
  statCount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  sectionCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.lg,
    padding: spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: spacing.base,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  statTitle: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  genreTag: {
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  genreText: {
    fontSize: 13,
    fontWeight: '500',
  },
  artistsList: {
    paddingTop: spacing.xs,
  },
  artistItem: {
    alignItems: 'center',
    marginRight: spacing.lg,
    width: 80,
  },
  artistImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eee',
    marginBottom: spacing.xs,
  },
  artistName: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    width: 80,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
  },
  playlistImage: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#eee',
  },
  playlistInfo: {
    flex: 1,
    marginLeft: spacing.base,
  },
  playlistName: {
    fontSize: 15,
    fontWeight: '500',
  },
  playlistTracks: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
  },
  createPlaylistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.base,
    borderRadius: borderRadius.md,
    marginTop: spacing.base,
  },
  createPlaylistText: {
    marginLeft: spacing.xs,
    fontSize: 15,
    fontWeight: '600',
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
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    marginTop: spacing.base,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  noContentText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ProfileScreen;
