import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  FlatList
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { renderArtistItem, renderArtistGridItem } from './renderers/ArtistRenderer';

interface Artist {
  id: string;
  name: string;
  images: Array<{url: string; height: number | null; width: number | null}>;
  genres?: string[];
  popularity?: number;
  followers?: {
    total: number;
  };
}

const AllTopArtistsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  
  const { 
    artists = [], 
    title = 'Top Artists'
  } = route.params as { 
    artists: Artist[]; 
    title: string;
  };
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
        <TouchableOpacity 
          style={styles.viewModeButton}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          <Ionicons 
            name={viewMode === 'grid' ? 'list' : 'grid'} 
            size={22} 
            color={theme.colors.primary} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Artists */}
      <FlatList
        data={artists}
        renderItem={viewMode === 'grid' ? renderArtistGridItem : renderArtistItem}
        keyExtractor={(item, index) => item?.id || `artist-${index}`}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode === 'grid' ? 'grid' : 'list'} // Force re-render when changing view mode
        horizontal={viewMode === 'list'}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          viewMode === 'list' && styles.horizontalList
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
              No artists found
            </Text>
          </View>
        }
      />
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
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  viewModeButton: {
    padding: spacing.xs,
  },
  listContent: {
    padding: spacing.base,
    paddingBottom: 100, // Extra space at bottom
  },
  horizontalList: {
    flexGrow: 1,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AllTopArtistsScreen; 