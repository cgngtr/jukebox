import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  FlatList,
  TextInput,
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing, layout, borderRadius } from '../../styles';
import { Card } from '../../components';
import { Ionicons } from '@expo/vector-icons';
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
  const navigation = useNavigation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [recentSearches, setRecentSearches] = useState<Array<{ id: string; query: string; type: string }>>([]);

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
  };

  // Handle search submission
  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      saveSearchToHistory(searchQuery);
      
      // Navigate to search results screen
      // @ts-ignore
      navigation.navigate('SearchResults', {
        query: searchQuery,
        category: activeCategory
      });
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
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
          saveSearchToHistory(item.query);
          
          // Navigate to search results screen
          // @ts-ignore
          navigation.navigate('SearchResults', {
            query: item.query,
            category: activeCategory
          });
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
});

export default SearchScreen;
