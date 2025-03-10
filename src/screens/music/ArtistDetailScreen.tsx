import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  FlatList,
  Modal,
  Dimensions,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, borderRadius } from '../../styles';
import { music } from '../../api';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePlayer } from '../../context/PlayerContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ArtistDetailScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const { getToken } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const [artist, setArtist] = useState<any>(null);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [recentAlbums, setRecentAlbums] = useState<any[]>([]);
  const [similarArtists, setSimilarArtists] = useState<any[]>([]);
  const [artistBio, setArtistBio] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);
  
  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  const modalBackdropAnim = useRef(new Animated.Value(0)).current;
  
  // @ts-ignore
  const { id } = route.params;
  
  const player = usePlayer();
  
  useEffect(() => {
    loadArtistData();
  }, [id]);
  
  const loadArtistData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication required');
      
      // Get artist details
      const artistData = await music.getArtist(token, id);
      setArtist(artistData);
      
      // Get artist top tracks
      const topTracksData = await music.getArtistTopTracks(token, id);
      setTopTracks(topTracksData.tracks);
      
      // Get artist albums using search
      const searchResults = await music.search(
        token,
        `artist:${artistData.name}`,
        ['album'],
        20
      );
      
      if (searchResults.albums && searchResults.albums.items) {
        // Filter albums to only include those by this artist
        const artistAlbums = searchResults.albums.items.filter(album => 
          album.artists.some(artist => artist.id === id)
        );
        
        // Sort by release date, most recent first
        artistAlbums.sort((a, b) => {
          const dateA = new Date(a.release_date || '');
          const dateB = new Date(b.release_date || '');
          return dateB.getTime() - dateA.getTime();
        });
        
        // Get the 3 most recent albums
        setRecentAlbums(artistAlbums.slice(0, 3));
      }
      
      // Load similar artists
      try {
        // In a real app, this would be the proper API call:
        // const relatedArtists = await music.getRelatedArtists(token, id);
        
        // Benzer sanatçıları aynı genre altında ve benzer popülerlikte arayarak bulalım
        if (artistData.genres && artistData.genres.length > 0) {
          // Ana genre'ı al
          const mainGenre = artistData.genres[0]; 
          
          // Bu genre için sanatçı ara
          const genreSearchResults = await music.search(
            token,
            `genre:"${mainGenre}"`,
            ['artist'],
            20
          );
          
          if (genreSearchResults.artists && genreSearchResults.artists.items) {
            // Şu anki sanatçıyı filtrele ve popülerliğe göre sırala
            const similarPopularity = artistData.popularity;
            
            // Popülerlik benzerliğine göre sırala (popülerlik farkı en az olanları önce göster)
            const similarArtistsByPopularity = genreSearchResults.artists.items
              .filter(artist => artist.id !== id) // Aynı sanatçıyı çıkar
              .sort((a, b) => {
                const popDiffA = Math.abs(a.popularity - similarPopularity);
                const popDiffB = Math.abs(b.popularity - similarPopularity);
                return popDiffA - popDiffB;
              })
              .slice(0, 6); // En iyi 6 sanatçıyı al
            
            setSimilarArtists(similarArtistsByPopularity);
          }
        }
      } catch (error) {
        console.error('Error loading similar artists:', error);
        // Sanatçı sayfasının tamamının yüklenmesini engelleme
      }
      
      // Generate artist bio (in a real app, this would come from the API)
      generateArtistBio(artistData);
      
      // Check if user is following this artist
      try {
        // This would be the real API call to check if following
        // For demo purposes, we'll randomly set the follow status
        setIsFollowing(Math.random() > 0.5);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
      
    } catch (error: any) {
      console.error('Error loading artist data:', error);
      setError(error.message || 'Failed to load artist data');
    } finally {
      setLoading(false);
    }
  };

  const generateArtistBio = (artistData: any) => {
    if (!artistData || !artistData.genres || artistData.genres.length === 0) {
      setArtistBio("No information available about this artist.");
      return;
    }
    
    // In a real app, you would fetch this from an API
    // This is a more sophisticated placeholder to simulate real artist bios
    const genres = artistData.genres.join(', ');
    const popularity = artistData.popularity;
    let bio = "";
    
    // Generate different bios based on artist name for demo purposes
    if (artistData.name.toLowerCase() === 'opeth') {
      bio = `Opeth is a Swedish progressive metal band formed in Stockholm in 1989. The band has consistently incorporated progressive, folk, blues, classical, and jazz influences into their usually lengthy compositions, as well as strong influences from death metal. Many songs include acoustic guitar passages and strong dynamic shifts, as well as death growls. Opeth is also well known for their incorporation of Mellotron in their work. Opeth has released thirteen studio albums, three live DVDs, three live albums, and two boxsets.\n\nTheir latest release "In Cauda Venenum" was released in 2019, to critical acclaim. Opeth has seen several lineup changes, with vocalist/guitarist Mikael Åkerfeldt being the band's driving force since 1990. The band includes influences ranging from progressive rock giants such as King Crimson, Yes, and Pink Floyd; to death metal bands such as Death, Morbid Angel, and Mayhem. The band's sound has evolved greatly over their career, from their early days as a straight-up death metal band to their current, more progressive style.`;
    } else if (artistData.genres.some((g: string) => g.includes('metal'))) {
      bio = `${artistData.name} is a renowned band in the ${artistData.genres[0]} scene, known for their technical prowess and innovative sound. With a strong following of ${artistData.followers.total.toLocaleString()} dedicated fans, they've made their mark on the genre through powerful performances and sophisticated compositions.\n\nTheir music spans multiple metal subgenres including ${genres}, creating a unique sonic landscape that continues to influence other artists in the scene. Their high popularity score of ${popularity} reflects their significant impact on the modern metal landscape.\n\nThe band continues to push boundaries and explore new musical territories while maintaining their distinctive sound that fans have come to love over the years.`;
    } else {
      bio = `${artistData.name} has established themselves as a significant figure in the ${artistData.genres[0]} genre, blending various musical influences into their distinctive sound. With ${artistData.followers.total.toLocaleString()} followers, they've built a substantial audience through their authentic approach to music.\n\nTheir sound encompasses elements of ${genres}, creating a rich musical tapestry that resonates with listeners across different backgrounds. With a popularity score of ${popularity}, they've made an undeniable impact on the contemporary music scene.\n\nTheir artistry continues to evolve, bringing fresh perspectives while staying true to the core elements that define their unique musical identity.`;
    }
    
    setArtistBio(bio);
  };

  const navigateToArtistAlbums = () => {
    // @ts-ignore
    navigation.navigate('ArtistAlbums', { artistId: id, artistName: artist?.name });
  };
  
  const navigateToArtist = (artistId: string) => {
    // @ts-ignore
    navigation.push('ArtistDetail', { id: artistId });
  };
  
  const navigateToDiscovery = () => {
    // This would navigate to a discovery feature
    console.log(`Discover artists like ${artist?.name}`);
    // In a real app: navigation.navigate('DiscoverSimilar', { artistId: id, artistName: artist?.name });
  };
  
  const toggleFollow = async () => {
    if (!artist) return;
    
    setFollowLoading(true);
    try {
      // This would be the real API call to follow/unfollow the artist
      // For now, just toggle the state
      setIsFollowing(!isFollowing);
      
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setFollowLoading(false);
    }
  };
  
  const showBioModalWithAnimation = () => {
    setShowBioModal(true);
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(modalBackdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
  };
  
  const hideBioModalWithAnimation = () => {
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      }),
      Animated.timing(modalBackdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      })
    ]).start(() => {
      setShowBioModal(false);
    });
  };
  
  // Parçayı çalma işlevi
  const handlePlayTrack = async (track: any, index: number) => {
    try {
      // Play the selected track with the artist's top tracks
      await player.play(topTracks[index], topTracks);
    } catch (error) {
      console.error('Track playback error:', error);
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Loading artist...
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
            onPress={loadArtistData}
          >
            <Text style={{ color: 'white' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!artist) return null;

  // Determine how many tracks to show based on showAllTracks state
  const tracksToShow = showAllTracks ? 10 : 5;

  // Album rendering function
  const renderAlbum = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.albumItem}
      onPress={() => {
        // @ts-ignore
        navigation.navigate('AlbumDetail', { id: item.id });
      }}
    >
      <Image 
        source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/150' }} 
        style={styles.albumCover} 
      />
      <Text 
        style={[styles.albumName, { color: theme.colors.text.primary }]}
        numberOfLines={1}
      >
        {item.name}
      </Text>
      <Text 
        style={[styles.albumYear, { color: theme.colors.text.secondary }]}
        numberOfLines={1}
      >
        {item.release_date?.split('-')[0] || ''}
      </Text>
    </TouchableOpacity>
  );
  
  // Similar artist rendering function
  const renderSimilarArtist = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.similarArtistItem}
      onPress={() => navigateToArtist(item.id)}
    >
      <Image 
        source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/120' }} 
        style={styles.similarArtistImage} 
      />
      <Text 
        style={[styles.similarArtistName, { color: theme.colors.text.primary }]}
        numberOfLines={2}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
  
  // Truncate the bio text for preview
  const truncatedBio = artistBio.length > 150 
    ? artistBio.substring(0, 150) + "..." 
    : artistBio;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.discoverButton}
            onPress={navigateToDiscovery}
          >
            <Text style={[styles.discoverButtonText, { color: theme.colors.primary }]}>
              Discover similar
            </Text>
            <Ionicons name="compass-outline" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Artist Header */}
        <View style={styles.artistHeader}>
          <Image 
            source={{ uri: artist.images[0]?.url || 'https://via.placeholder.com/200' }}
            style={styles.artistImage}
          />
          <Text style={[styles.artistName, { color: theme.colors.text.primary }]}>
            {artist.name}
          </Text>
          <Text style={[styles.artistStats, { color: theme.colors.text.secondary }]}>
            {artist.followers.total.toLocaleString()} followers
          </Text>
          
          <View style={styles.genresContainer}>
            {artist.genres.slice(0, 3).map((genre: string, index: number) => (
              <View 
                key={index} 
                style={[styles.genrePill, { backgroundColor: theme.colors.card }]}
              >
                <Text style={[styles.genreText, { color: theme.colors.text.primary }]}>
                  {genre}
                </Text>
              </View>
            ))}
          </View>
          
          {/* Follow Button */}
          <TouchableOpacity
            style={[
              styles.followButton,
              { backgroundColor: isFollowing ? 'transparent' : theme.colors.primary,
                borderColor: theme.colors.primary,
                borderWidth: isFollowing ? 1 : 0 }
            ]}
            onPress={toggleFollow}
            disabled={followLoading}
          >
            {followLoading ? (
              <ActivityIndicator size="small" color={isFollowing ? theme.colors.primary : 'white'} />
            ) : (
              <>
                <Ionicons 
                  name={isFollowing ? "checkmark" : "add"} 
                  size={18} 
                  color={isFollowing ? theme.colors.primary : 'white'} 
                />
                <Text 
                  style={[
                    styles.followButtonText, 
                    { color: isFollowing ? theme.colors.primary : 'white' }
                  ]}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Popular Tracks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Popular
            </Text>
          </View>
          
          {topTracks.slice(0, tracksToShow).map((track: any, index: number) => (
            <React.Fragment key={track.id}>
              <TouchableOpacity 
                style={styles.trackItem}
                onPress={() => {
                  // @ts-ignore
                  navigation.navigate('TrackDetail', { id: track.id });
                }}
              >
                <Text style={[styles.trackIndex, { color: theme.colors.text.secondary }]}>
                  {index + 1}
                </Text>
                <Image 
                  source={{ uri: track.album.images[0]?.url || 'https://via.placeholder.com/60' }}
                  style={styles.trackImage}
                />
                <View style={styles.trackInfo}>
                  <Text style={[styles.trackName, { color: theme.colors.text.primary }]}>
                    {track.name}
                  </Text>
                  <Text style={[styles.trackArtist, { color: theme.colors.text.secondary }]}>
                    {track.explicit && <Text>🅴 </Text>}
                    {track.artists.map((a: any) => a.name).join(', ')}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.playButton}
                  onPress={() => handlePlayTrack(track, index)}
                >
                  <Ionicons name="play" size={22} color={theme.colors.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
              {index < topTracks.slice(0, tracksToShow).length - 1 && (
                <View style={[styles.trackDivider, { backgroundColor: theme.colors.text.primary }]} />
              )}
            </React.Fragment>
          ))}

          {/* Load More button */}
          {topTracks.length > 5 && (
            <TouchableOpacity 
              style={[styles.loadMoreButton, { borderColor: theme.colors.primary }]}
              onPress={() => setShowAllTracks(!showAllTracks)}
            >
              <Text style={[styles.loadMoreText, { color: theme.colors.primary }]}>
                {showAllTracks ? 'Show Less' : 'Load More'}
              </Text>
              <Ionicons 
                name={showAllTracks ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Discography Section */}
        {recentAlbums.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Discography
              </Text>
              <TouchableOpacity onPress={navigateToArtistAlbums}>
                <Text style={[styles.seeAllButton, { color: theme.colors.primary }]}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={recentAlbums}
              renderItem={renderAlbum}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.albumsContainer}
            />
          </View>
        )}
        
        {/* Similar Artists Section */}
        {similarArtists.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Similar Artists
              </Text>
            </View>
            
            <FlatList
              data={similarArtists}
              renderItem={renderSimilarArtist}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarArtistsContainer}
            />
          </View>
        )}
        
        {/* About Section - Now at the bottom */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              About
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.aboutContainer, { backgroundColor: theme.colors.card }]}
            onPress={showBioModalWithAnimation}
          >
            <Text style={[styles.aboutText, { color: theme.colors.text.primary }]}>
              {truncatedBio}
            </Text>
            {artistBio.length > 150 && (
              <Text style={[styles.readMoreText, { color: theme.colors.primary }]}>
                Read more
              </Text>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Bottom padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* Full Bio Modal */}
      <Modal
        visible={showBioModal}
        transparent={true}
        onRequestClose={hideBioModalWithAnimation}
        animationType="none"
      >
        <Animated.View 
          style={[
            styles.modalBackdrop,
            {
              opacity: modalBackdropAnim,
              backgroundColor: 'rgba(0,0,0,0.5)'
            }
          ]}
          onTouchEnd={hideBioModalWithAnimation}
        />
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: modalScaleAnim }],
              backgroundColor: theme.colors.background
            }
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
              About {artist.name}
            </Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={hideBioModalWithAnimation}
            >
              <View style={[
                styles.closeButtonCircle, 
                { backgroundColor: 'rgba(0,0,0,0.05)' }
              ]}>
                <Ionicons name="close" size={20} color={theme.colors.text.primary} />
              </View>
            </TouchableOpacity>
          </View>
          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.modalBioText, { color: theme.colors.text.primary }]}>
              {artistBio}
            </Text>
          </ScrollView>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 255, 0.3)',
    backgroundColor: 'rgba(100, 100, 255, 0.05)',
  },
  discoverButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  seeAllButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Artist styles
  artistHeader: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  artistImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginBottom: spacing.lg,
  },
  artistName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  artistStats: {
    fontSize: 16,
    marginBottom: spacing.base,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  genrePill: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    margin: spacing.xs,
  },
  genreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Follow button
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 25,
    marginTop: spacing.sm,
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  
  // Album styles
  albumsContainer: {
    paddingHorizontal: spacing.lg,
  },
  albumItem: {
    width: 120,
    marginRight: spacing.lg,
  },
  albumCover: {
    width: 120,
    height: 120,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  albumName: {
    fontSize: 14,
    fontWeight: '500',
  },
  albumYear: {
    fontSize: 12,
  },
  
  // Similar artists styles
  similarArtistsContainer: {
    paddingHorizontal: spacing.lg,
  },
  similarArtistItem: {
    width: 100,
    marginRight: spacing.lg,
    alignItems: 'center',
  },
  similarArtistImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.xs,
  },
  similarArtistName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // About section
  aboutContainer: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 22,
  },
  readMoreText: {
    marginTop: spacing.sm,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Track item styles
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
  },
  trackIndex: {
    fontSize: 16,
    width: 30,
    textAlign: 'center',
  },
  trackImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: spacing.base,
  },
  trackInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  trackName: {
    fontSize: 16,
    fontWeight: '500',
  },
  trackArtist: {
    fontSize: 14,
    marginTop: 2,
  },
  playButton: {
    padding: spacing.xs,
  },
  trackDivider: {
    height: 1,
    marginHorizontal: spacing.lg,
    opacity: 0.08,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xl,
    borderWidth: 1,
    borderRadius: 20,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: spacing.xs,
  },
  
  // Modal styles
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.75,
    marginLeft: -(SCREEN_WIDTH * 0.9) / 2,
    marginTop: -(SCREEN_HEIGHT * 0.75) / 2,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 1.5, // Çok daha fazla padding
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  modalBioText: {
    fontSize: 16,
    lineHeight: 26,
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  closeButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ArtistDetailScreen;
