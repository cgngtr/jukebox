import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../../styles';
import { music } from '../../api';
import { useNavigation, useRoute } from '@react-navigation/native';

const AlbumDetailScreen = () => {
  const { theme } = useTheme();
  const { getToken } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // @ts-ignore
  const { id } = route.params;
  
  useEffect(() => {
    loadAlbumData();
  }, [id]);
  
  const loadAlbumData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication required');
      
      // Get album details
      const albumData = await music.getAlbum(token, id);
      setAlbum(albumData);
    } catch (error: any) {
      console.error('Error loading album data:', error);
      setError(error.message || 'Failed to load album data');
    } finally {
      setLoading(false);
    }
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
        </View>
        
        {/* Album Header */}
        <View style={styles.albumHeader}>
          <Image 
            source={{ uri: album.images[0]?.url || 'https://via.placeholder.com/300' }}
            style={styles.albumCover}
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
        
        {/* Tracks Section */}
        <View style={styles.section}>
          {album.tracks.items.map((track: any, index: number) => (
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
                <View style={styles.trackInfo}>
                  <Text style={[styles.trackName, { color: theme.colors.text.primary }]}>
                    {track.name}
                  </Text>
                  <Text style={[styles.trackArtist, { color: theme.colors.text.secondary }]}>
                    {track.explicit && <Text>🅴 </Text>}
                    {track.artists.map((a: any) => a.name).join(', ')}
                  </Text>
                </View>
                <TouchableOpacity style={styles.playButton}>
                  <Ionicons name="play" size={22} color={theme.colors.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
              {index < album.tracks.items.length - 1 && (
                <View style={[styles.trackDivider, { backgroundColor: theme.colors.text.primary }]} />
              )}
            </React.Fragment>
          ))}
        </View>
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
  
  // Album styles
  albumHeader: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  albumCover: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  albumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  albumArtist: {
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  albumInfo: {
    fontSize: 14,
    textAlign: 'center',
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
});

export default AlbumDetailScreen;
