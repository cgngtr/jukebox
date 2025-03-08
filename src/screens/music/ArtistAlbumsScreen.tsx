import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { spacing, borderRadius } from '../../styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { renderAlbumCard } from './renderers/AlbumRenderer';
import { music } from '../../api';

interface Album {
  id: string;
  name: string;
  artists: Array<{id: string; name: string}>;
  images: Array<{url: string; height: number | null; width: number | null}>;
  release_date?: string;
  album_type: string;
  total_tracks: number;
}

const ArtistAlbumsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { getToken } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  
  const { 
    artistId,
    artistName = 'Artist Albums'
  } = route.params as { 
    artistId: string;
    artistName: string;
  };
  
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  useEffect(() => {
    loadArtistAlbums();
  }, [artistId]);
  
  const loadArtistAlbums = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication required');
      
      // Use the search endpoint to find albums by this artist
      const searchResults = await music.search(
        token,
        `artist:${artistName}`,
        ['album'],
        50  // Get up to 50 albums
      );
      
      if (searchResults.albums && searchResults.albums.items) {
        // Filter albums to only include those by this artist
        const artistAlbums = searchResults.albums.items.filter(album => 
          album.artists.some(artist => artist.id === artistId)
        );
        setAlbums(artistAlbums);
      } else {
        setAlbums([]);
      }
    } catch (error: any) {
      console.error('Error loading artist albums:', error);
      setError(error.message || 'Failed to load artist albums');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            {artistName}'s Albums
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Loading albums...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
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
          {artistName}'s Albums
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
      
      {/* Albums */}
      <FlatList
        data={albums}
        renderItem={renderAlbumCard}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode === 'grid' ? 'grid' : 'list'} // Force re-render when changing view mode
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          error ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
              <TouchableOpacity 
                style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
                onPress={loadArtistAlbums}
              >
                <Text style={{ color: 'white' }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                No albums found for this artist
              </Text>
            </View>
          )
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.base,
    fontSize: 16,
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
});

export default ArtistAlbumsScreen; 