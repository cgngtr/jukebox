import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  FlatList,
  TextInput 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing, layout, borderRadius } from '../../styles';
import { Card } from '../../components';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Categories for search filters
const searchCategories = [
  { id: 'all', name: 'All' },
  { id: 'songs', name: 'Songs' },
  { id: 'artists', name: 'Artists' },
  { id: 'albums', name: 'Albums' },
  { id: 'playlists', name: 'Playlists' },
];

// Mock search history
const recentSearches = [
  { id: '1', query: 'Daft Punk', type: 'artist' },
  { id: '2', query: 'Blinding Lights', type: 'song' },
  { id: '3', query: 'Adele', type: 'artist' },
  { id: '4', query: 'Hip Hop Mix', type: 'playlist' },
];

// Mock trending searches
const trendingSearches = [
  { id: '1', query: 'Weekend', type: 'artist' },
  { id: '2', query: 'Taylor Swift', type: 'artist' },
  { id: '3', query: 'Billie Eilish', type: 'artist' },
  { id: '4', query: 'Top 50 - Global', type: 'playlist' },
];

const SearchScreen: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  // Handle category selection
  const handleCategoryPress = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  // Handle search submission
  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      setIsSearching(true);
      // In a real app, this would trigger an API call
      console.log('Searching for:', searchQuery);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
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

  // Render search item
  const renderSearchItem = (item: { id: string; query: string; type: string }) => {
    const iconName = 
      item.type === 'artist' ? 'person' :
      item.type === 'song' ? 'musical-note' :
      item.type === 'playlist' ? 'list' : 'search';

    return (
      <TouchableOpacity style={styles.searchItem}>
        <View style={[styles.searchIconContainer, { backgroundColor: theme.colors.card }]}>
          <Ionicons name={iconName} size={18} color={theme.colors.text.secondary} />
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
          renderItem={({ item }) => renderCategory(item)}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isSearching ? (
          // Search results would go here
          <View style={styles.noResultsContainer}>
            <Text style={[styles.noResultsText, { color: theme.colors.text.secondary }]}>
              No results for "{searchQuery}" yet
            </Text>
          </View>
        ) : (
          <>
            {/* Recent Searches Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                  Recent Searches
                </Text>
                <TouchableOpacity>
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
            
            {/* Trending Searches Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                  Trending
                </Text>
              </View>
              <Card style={styles.searchListCard}>
                {trendingSearches.map((item, index) => (
                  <React.Fragment key={item.id}>
                    {renderSearchItem(item)}
                    {index !== trendingSearches.length - 1 && (
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
    height: 44,
    fontSize: 16,
  },
  clearButton: {
    padding: spacing.xs,
  },
  categoriesContainer: {
    paddingVertical: spacing.sm,
  },
  categoriesList: {
    paddingHorizontal: spacing.base,
  },
  categoryPill: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    marginRight: spacing.sm,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginTop: spacing.base,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchListCard: {
    padding: 0,
    overflow: 'hidden',
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
  },
  searchIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchItemContent: {
    flex: 1,
    marginLeft: spacing.base,
  },
  searchItemText: {
    fontSize: 15,
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
    marginLeft: spacing.xl + spacing.lg,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxxl,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SearchScreen;
