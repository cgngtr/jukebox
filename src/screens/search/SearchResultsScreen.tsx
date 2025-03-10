import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { spacing, layout, borderRadius } from '../../styles';
import { Ionicons } from '@expo/vector-icons';
import { music } from '../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePlayer } from '../../context/PlayerContext';

// Search history key for AsyncStorage
const SEARCH_HISTORY_KEY = 'spotify_search_history';

const SearchResultsScreen: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { getToken } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const player = usePlayer();
  
  // Extract params from route
  const { query = '', category = 'all' } = route.params as { query: string; category: string };
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search results
  const [searchResults, setSearchResults] = useState<{
    tracks: any[];
    artists: any[];
    albums: any[];
    playlists: any[];
  }>({
    tracks: [],
    artists: [],
    albums: [],
    playlists: [],
  });

  // Perform search on mount or when parameters change
  useEffect(() => {
    if (query) {
      const typesToSearch = category === 'all' 
        ? ['track', 'artist', 'album', 'playlist'] 
        : [category.slice(0, -1)]; // Remove 's' from the end (tracks -> track)
      
      performSearch(query, typesToSearch);
    }
  }, [query, category]);

  // Save search to history
  const saveSearchToHistory = async (query: string, type: string = 'search') => {
    try {
      const newSearch = {
        id: Date.now().toString(),
        query,
        type,
      };
      
      // Get current history
      const historyJson = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      const currentHistory = historyJson ? JSON.parse(historyJson) : [];
      
      // Add to history
      const updatedHistory = [
        newSearch,
        ...currentHistory.filter((item: any) => item.query !== query).slice(0, 9)
      ];
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  // Perform search using Spotify API
  const performSearch = async (query: string, types: string[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const results = await music.search(token, query, types);
      
      setSearchResults({
        tracks: results.tracks?.items || [],
        artists: results.artists?.items || [],
        albums: results.albums?.items || [],
        playlists: results.playlists?.items || [],
      });
    } catch (error: any) {
      console.error('Search error:', error);
      setError(error.message || 'An error occurred during search');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search item press
  const handleSearchItemPress = (item: any, type: string) => {
    // Save to recent searches
    saveSearchToHistory(item.name, type);
    
    // Navigate to details page based on type
    switch(type) {
      case 'artist':
        // @ts-ignore
        navigation.navigate('ArtistDetail', { id: item.id });
        break;
      case 'track':
        // @ts-ignore
        navigation.navigate('TrackDetail', { id: item.id });
        break;
      case 'album':
        // @ts-ignore
        navigation.navigate('AlbumDetail', { id: item.id });
        break;
      case 'playlist':
        // @ts-ignore
        navigation.navigate('PlaylistDetail', { id: item.id });
        break;
    }
  };

  // Parçayı çalma işlevi
  const handlePlayTrack = async (track: any) => {
    try {
      // Play the selected track
      await player.play(track);
    } catch (error) {
      console.error('Track playback error:', error);
    }
  };

  // Render track search result
  const renderTrackResult = (item: any) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSearchItemPress(item, 'track')}
    >
      <Image 
        source={{ uri: item.album?.images[0]?.url || 'https://via.placeholder.com/60' }} 
        style={styles.resultImage} 
      />
      <View style={styles.resultTextContainer}>
        <Text style={[styles.resultTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.resultSubtitle, { color: theme.colors.text.secondary }]} numberOfLines={1}>
          {item.artists.map((artist: any) => artist.name).join(', ')}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.playButton}
        onPress={(e: any) => {
          e.stopPropagation(); // Prevent navigation
          handlePlayTrack(item);
        }}
      >
        <Ionicons name="play" size={20} color={theme.colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render artist search result
  const renderArtistResult = (item: any) => (
    <TouchableOpacity 
      style={styles.artistResultItem}
      onPress={() => handleSearchItemPress(item, 'artist')}
    >
      <Image 
        source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/80' }} 
        style={styles.artistImage} 
      />
      <Text style={[styles.artistName, { color: theme.colors.text.primary }]} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Render album search result
  const renderAlbumResult = (item: any) => (
    <TouchableOpacity 
      style={styles.albumResultItem}
      onPress={() => handleSearchItemPress(item, 'album')}
    >
      <Image 
        source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/120' }} 
        style={styles.albumImage} 
      />
      <Text style={[styles.albumTitle, { color: theme.colors.text.primary }]} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={[styles.albumArtist, { color: theme.colors.text.secondary }]} numberOfLines={1}>
        {item.artists.map((artist: any) => artist.name).join(', ')}
      </Text>
    </TouchableOpacity>
  );

  // Render playlist search result
  const renderPlaylistResult = (item: any) => (
    <TouchableOpacity 
      style={styles.albumResultItem}
      onPress={() => handleSearchItemPress(item, 'playlist')}
    >
      <Image 
        source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/120' }} 
        style={styles.albumImage} 
      />
      <Text style={[styles.albumTitle, { color: theme.colors.text.primary }]} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={[styles.albumArtist, { color: theme.colors.text.secondary }]} numberOfLines={1}>
        {item.owner.display_name}
      </Text>
    </TouchableOpacity>
  );

  // Render search results
  const renderSearchResults = () => {
    // Check if any results are available
    const hasResults = 
      searchResults.tracks.length > 0 || 
      searchResults.artists.length > 0 || 
      searchResults.albums.length > 0 || 
      searchResults.playlists.length > 0;

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Searching...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={40} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => performSearch(query, category === 'all' 
              ? ['track', 'artist', 'album', 'playlist'] 
              : [category.slice(0, -1)])}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!hasResults) {
      return (
        <View style={styles.noResultsContainer}>
          <Text style={[styles.noResultsText, { color: theme.colors.text.secondary }]}>
            No results found for "{query}"
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.resultsContainer}>
        {/* Tracks Section */}
        {searchResults.tracks.length > 0 && (category === 'all' || category === 'tracks') && (
          <View style={styles.resultSection}>
            <Text style={[styles.resultSectionTitle, { color: theme.colors.text.primary }]}>
              Songs
            </Text>
            {searchResults.tracks.slice(0, 5).map((track, index) => (
              <React.Fragment key={track.id}>
                {renderTrackResult(track)}
                {index < 4 && (
                  <View style={[styles.resultDivider, { backgroundColor: theme.colors.divider }]} />
                )}
              </React.Fragment>
            ))}
            {searchResults.tracks.length > 5 && (
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                  See all {searchResults.tracks.length} songs
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Artists Section */}
        {searchResults.artists.length > 0 && (category === 'all' || category === 'artists') && (
          <View style={styles.resultSection}>
            <Text style={[styles.resultSectionTitle, { color: theme.colors.text.primary }]}>
              Artists
            </Text>
            <FlatList
              data={searchResults.artists.filter(Boolean)}
              renderItem={({ item }) => item && renderArtistResult(item)}
              keyExtractor={(item, index) => (item?.id || `artist-${index}`)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.artistsContainer}
            />
          </View>
        )}

        {/* Albums Section */}
        {searchResults.albums.length > 0 && (category === 'all' || category === 'albums') && (
          <View style={styles.resultSection}>
            <Text style={[styles.resultSectionTitle, { color: theme.colors.text.primary }]}>
              Albums
            </Text>
            <FlatList
              data={searchResults.albums.filter(Boolean)}
              renderItem={({ item }) => item && renderAlbumResult(item)}
              keyExtractor={(item, index) => (item?.id || `album-${index}`)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.albumsContainer}
            />
          </View>
        )}

        {/* Playlists Section */}
        {searchResults.playlists.length > 0 && (category === 'all' || category === 'playlists') && (
          <View style={styles.resultSection}>
            <Text style={[styles.resultSectionTitle, { color: theme.colors.text.primary }]}>
              Playlists
            </Text>
            <FlatList
              data={searchResults.playlists.filter(Boolean)}
              renderItem={({ item }) => item && renderPlaylistResult(item)}
              keyExtractor={(item, index) => (item?.id || `playlist-${index}`)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.albumsContainer}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
          Results for "{query}"
        </Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {renderSearchResults()}
      </ScrollView>
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
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: layout.tabBarHeight + spacing.xl, // Extra bottom padding for tabBar
  },
  noResultsContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
  resultSection: {
    marginBottom: spacing.lg,
  },
  resultSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.base,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  resultImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: spacing.base,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  resultSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  playButton: {
    padding: spacing.sm,
  },
  resultDivider: {
    height: 1,
  },
  seeAllButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  artistsContainer: {
    paddingRight: spacing.base,
  },
  artistResultItem: {
    width: 110,
    marginRight: spacing.md,
    alignItems: 'center',
  },
  artistImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: spacing.sm,
  },
  artistName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  albumsContainer: {
    paddingRight: spacing.base,
  },
  albumResultItem: {
    width: 140,
    marginRight: spacing.md,
  },
  albumImage: {
    width: 130,
    height: 130,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  albumArtist: {
    fontSize: 12,
    marginTop: 2,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: spacing.base,
  },
  errorContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: spacing.base,
    marginBottom: spacing.lg,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
});

export default SearchResultsScreen;
