import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { spacing, layout, borderRadius } from '../../styles';
import { Card } from '../../components';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { music } from '../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// Categories for search filters
const searchCategories = [
  { id: 'all', name: 'All' },
  { id: 'tracks', name: 'Songs' },
  { id: 'artists', name: 'Artists' },
  { id: 'albums', name: 'Albums' },
  { id: 'playlists', name: 'Playlists' },
];

// Search history key for AsyncStorage
const SEARCH_HISTORY_KEY = 'spotify_search_history';

const SearchScreen: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { getToken } = useAuth();
  const navigation = useNavigation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<Array<{ id: string; query: string; type: string }>>([]);
  
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

  // Load search history on mount
  useEffect(() => {
    loadSearchHistory();
  }, []);

  // Load search history from AsyncStorage
  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (history) {
        setRecentSearches(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  // Save search to history
  const saveSearchToHistory = async (query: string, type: string = 'search') => {
    try {
      const newSearch = {
        id: Date.now().toString(),
        query,
        type,
      };
      
      // Add to local state
      const updatedHistory = [
        newSearch,
        ...recentSearches.filter(item => item.query !== query).slice(0, 9)
      ];
      setRecentSearches(updatedHistory);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  // Clear search history
  const clearSearchHistory = async () => {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
      setRecentSearches([]);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  // Handle category selection
  const handleCategoryPress = (categoryId: string) => {
    setActiveCategory(categoryId);
    
    // If already searched, filter results based on new category
    if (isSearching && searchQuery) {
      performSearch(searchQuery, [categoryId === 'all' ? '' : categoryId]);
    }
  };

  // Handle search submission
  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      setIsSearching(true);
      saveSearchToHistory(searchQuery);
      
      // Determine which types to search based on active category
      const typesToSearch = activeCategory === 'all' 
        ? ['track', 'artist', 'album', 'playlist'] 
        : [activeCategory.slice(0, -1)]; // Remove 's' from the end (tracks -> track)
      
      performSearch(searchQuery, typesToSearch);
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

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults({
      tracks: [],
      artists: [],
      albums: [],
      playlists: [],
    });
  };

  // Render category pill
  const renderCategory = (item: { id: string; name: string }) => {
    const isActive = activeCategory === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.categoryPill,
          {
            backgroundColor: isActive 
              ? theme.colors.primary 
              : isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          },
        ]}
        onPress={() => handleCategoryPress(item.id)}
      >
        <Text
          style={[
            styles.categoryText,
            { color: isActive ? 'white' : theme.colors.text.primary },
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render search history item
  const renderSearchItem = (item: { id: string; query: string; type: string }) => {
    const iconName = 
      item.type === 'artist' ? 'person' :
      item.type === 'track' ? 'musical-note' :
      item.type === 'album' ? 'disc' :
      item.type === 'playlist' ? 'list' : 'search';

    return (
      <TouchableOpacity 
        style={styles.searchItem}
        onPress={() => {
          setSearchQuery(item.query);
          handleSearch();
        }}
      >
        <View style={[styles.searchIconContainer, { backgroundColor: theme.colors.card }]}>
          <Ionicons name={iconName as any} size={18} color={theme.colors.text.secondary} />
        </View>
        <View style={styles.searchItemContent}>
          <Text style={[styles.searchItemText, { color: theme.colors.text.primary }]}>
            {item.query}
          </Text>
          <Text style={[styles.searchItemSubtext, { color: theme.colors.text.secondary }]}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
        </View>
        <TouchableOpacity style={styles.searchItemAction}>
          <Ionicons name="time-outline" size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Render track search result
  const renderTrackResult = (item: any) => (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => handleSearchItemPress(item, 'track')}
    >
      <Image 
        source={{ uri: item.album.images[0]?.url || 'https://via.placeholder.com/60' }} 
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
      <TouchableOpacity style={styles.playButton}>
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

  // Render search results section
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
            onPress={() => handleSearch()}
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
            No results found for "{searchQuery}"
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.resultsContainer}>
        {/* Tracks Section */}
        {searchResults.tracks.length > 0 && (activeCategory === 'all' || activeCategory === 'tracks') && (
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
        {searchResults.artists.length > 0 && (activeCategory === 'all' || activeCategory === 'artists') && (
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
        {searchResults.albums.length > 0 && (activeCategory === 'all' || activeCategory === 'albums') && (
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
        {searchResults.playlists.length > 0 && (activeCategory === 'all' || activeCategory === 'playlists') && (
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
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={[
          styles.searchInputContainer,
          { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]}>
          <Ionicons 
            name="search" 
            size={20} 
            color={theme.colors.text.secondary} 
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text.primary }]}
            placeholder="Search songs, artists, albums..."
            placeholderTextColor={theme.colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons 
                name="close-circle" 
                size={18} 
                color={theme.colors.text.secondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories Filter */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={searchCategories}
          renderItem={({ item }) => item && renderCategory(item)}
          keyExtractor={(item, index) => item?.id || `category-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isSearching ? (
          // Search results
          renderSearchResults()
        ) : (
          <>
            {/* Recent Searches Section */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                    Recent Searches
                  </Text>
                  <TouchableOpacity onPress={clearSearchHistory}>
                    <Text style={[styles.sectionAction, { color: theme.colors.primary }]}>
                      Clear All
                    </Text>
                  </TouchableOpacity>
                </View>
                <Card style={styles.searchListCard}>
                  {recentSearches.map((item, index) => (
                    <React.Fragment key={item.id}>
                      {renderSearchItem(item)}
                      {index !== recentSearches.length - 1 && (
                        <View 
                          style={[styles.divider, { backgroundColor: theme.colors.divider }]}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </Card>
              </View>
            )}
            
            {/* Trending Searches Section (mock data) */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                  Trending
                </Text>
              </View>
              <Card style={styles.searchListCard}>
                {[
                  { id: '1', query: 'Weekend', type: 'artist' },
                  { id: '2', query: 'Taylor Swift', type: 'artist' },
                  { id: '3', query: 'Billie Eilish', type: 'artist' },
                  { id: '4', query: 'Top 50 - Global', type: 'playlist' },
                ].map((item, index, arr) => (
                  <React.Fragment key={item.id}>
                    {renderSearchItem(item)}
                    {index !== arr.length - 1 && (
                      <View 
                        style={[styles.divider, { backgroundColor: theme.colors.divider }]}
                      />
                    )}
                  </React.Fragment>
                ))}
              </Card>
            </View>
          </>
        )}
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
  searchHeader: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: spacing.xs,
  },
  categoriesContainer: {
    marginVertical: spacing.xs,
  },
  categoriesList: {
    paddingHorizontal: spacing.base,
  },
  categoryPill: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchListCard: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    paddingVertical: spacing.xs,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  searchIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  searchItemContent: {
    flex: 1,
  },
  searchItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchItemSubtext: {
    fontSize: 13,
    marginTop: 2,
  },
  searchItemAction: {
    padding: spacing.xs,
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.base,
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

export default SearchScreen;
