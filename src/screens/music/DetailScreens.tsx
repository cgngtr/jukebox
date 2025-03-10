import ArtistDetailScreen from './ArtistDetailScreen';
import AlbumDetailScreen from './AlbumDetailScreen';
import TrackDetailScreen from './TrackDetailScreen';

// Re-export for backward compatibility
export { 
  ArtistDetailScreen,
  AlbumDetailScreen,
  TrackDetailScreen
};

// Keep PlaylistDetailScreen implementation here until it's separated
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
import { usePlayer } from '../../context/PlayerContext';

// Playlist Detail Screen
export const PlaylistDetailScreen = () => {
  const { theme } = useTheme();
  const { getToken } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const player = usePlayer();
  
  // @ts-ignore
  const { id } = route.params;
  
  useEffect(() => {
    loadPlaylistData();
  }, [id]);
  
  const loadPlaylistData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication required');
      
      // Get playlist details
      const playlistData = await music.getPlaylist(token, id);
      setPlaylist(playlistData);
    } catch (error: any) {
      console.error('Error loading playlist data:', error);
      setError(error.message || 'Failed to load playlist data');
    } finally {
      setLoading(false);
    }
  };
  
  // Parçayı çalma işlevi
  const handlePlayTrack = async (track: any, index: number) => {
    try {
      // Convert playlist tracks to SpotifyTrack format if needed
      const trackList = playlist.tracks.items.map((item: any) => ({
        ...item.track,
        album: item.track.album
      }));
      
      // Play the selected track with the playlist's track list
      await player.play(trackList[index], trackList);
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
            Loading playlist...
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
            onPress={loadPlaylistData}
          >
            <Text style={{ color: 'white' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!playlist) return null;
  
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
        
        {/* Playlist Header */}
        <View style={styles.playlistHeader}>
          <Image 
            source={{ uri: playlist.images[0]?.url || 'https://via.placeholder.com/300' }}
            style={styles.playlistCover}
          />
          <Text style={[styles.playlistTitle, { color: theme.colors.text.primary }]}>
            {playlist.name}
          </Text>
          <Text style={[styles.playlistDescription, { color: theme.colors.text.secondary }]}>
            {playlist.description}
          </Text>
          <Text style={[styles.playlistInfo, { color: theme.colors.text.secondary }]}>
            Created by <Text style={{ color: theme.colors.primary }}>{playlist.owner.display_name}</Text> • {playlist.followers.total.toLocaleString()} followers • {playlist.tracks.total} songs
          </Text>
        </View>
        
        {/* Tracks Section */}
        <View style={styles.section}>
          {playlist.tracks.items.map((item: any, index: number) => (
            <React.Fragment key={item.track.id}>
              <TouchableOpacity 
                style={styles.trackItem}
                onPress={() => {
                  // @ts-ignore
                  navigation.navigate('TrackDetail', { id: item.track.id });
                }}
              >
                <Text style={[styles.trackIndex, { color: theme.colors.text.secondary }]}>
                  {index + 1}
                </Text>
                <Image 
                  source={{ uri: item.track.album.images[0]?.url || 'https://via.placeholder.com/60' }}
                  style={styles.trackImage}
                />
                <View style={styles.trackInfo}>
                  <Text style={[styles.trackName, { color: theme.colors.text.primary }]}>
                    {item.track.name}
                  </Text>
                  <Text style={[styles.trackArtist, { color: theme.colors.text.secondary }]}>
                    {item.track.explicit && <Text>🅴 </Text>}
                    {item.track.artists.map((a: any) => a.name).join(', ')}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.playButton}
                  onPress={() => handlePlayTrack(item.track, index)}
                >
                  <Ionicons name="play" size={22} color={theme.colors.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
              {index < playlist.tracks.items.length - 1 && (
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
  
  // Playlist styles
  playlistHeader: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  playlistCover: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  playlistTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  playlistDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  playlistInfo: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 