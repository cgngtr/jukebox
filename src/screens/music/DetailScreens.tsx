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

// Artist Detail Screen
export const ArtistDetailScreen = () => {
  const { theme } = useTheme();
  const { getToken } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const [artist, setArtist] = useState<any>(null);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // @ts-ignore
  const { id } = route.params;
  
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
    } catch (error: any) {
      console.error('Error loading artist data:', error);
      setError(error.message || 'Failed to load artist data');
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
        </View>
        
        {/* Top Tracks Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Popular
          </Text>
          
          {topTracks.slice(0, 5).map((track, index) => (
            <TouchableOpacity 
              key={track.id}
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
              <TouchableOpacity style={styles.playButton}>
                <Ionicons name="play" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Album Detail Screen
export const AlbumDetailScreen = () => {
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
            <TouchableOpacity 
              key={track.id}
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
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Track Detail Screen
export const TrackDetailScreen = () => {
  const { theme } = useTheme();
  const { getToken } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const [track, setTrack] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // @ts-ignore
  const { id } = route.params;
  
  useEffect(() => {
    loadTrackData();
  }, [id]);
  
  const loadTrackData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication required');
      
      // Get track details
      const trackData = await music.getTrack(token, id);
      setTrack(trackData);
    } catch (error: any) {
      console.error('Error loading track data:', error);
      setError(error.message || 'Failed to load track data');
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
            Loading track...
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
            onPress={loadTrackData}
          >
            <Text style={{ color: 'white' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!track) return null;
  
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
        
        {/* Track Details */}
        <View style={styles.trackDetailHeader}>
          <Image
            source={{ uri: track.album.images[0]?.url || 'https://via.placeholder.com/300' }}
            style={styles.trackCover}
          />
          <Text style={[styles.trackDetailName, { color: theme.colors.text.primary }]}>
            {track.name}
          </Text>
          <TouchableOpacity
            onPress={() => {
              // @ts-ignore
              navigation.navigate('ArtistDetail', { id: track.artists[0].id });
            }}
          >
            <Text style={[styles.trackDetailArtist, { color: theme.colors.primary }]}>
              {track.artists.map((a: any) => a.name).join(', ')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              // @ts-ignore
              navigation.navigate('AlbumDetail', { id: track.album.id });
            }}
            style={styles.albumButton}
          >
            <Text style={[styles.albumButtonText, { color: theme.colors.text.secondary }]}>
              From the album: <Text style={{ color: theme.colors.primary }}>{track.album.name}</Text>
            </Text>
          </TouchableOpacity>
          
          {/* Play button */}
          <TouchableOpacity 
            style={[styles.playTrackButton, { backgroundColor: theme.colors.primary }]}
          >
            <Ionicons name="play" size={24} color="white" />
            <Text style={styles.playText}>Play</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Playlist Detail Screen
export const PlaylistDetailScreen = () => {
  const { theme } = useTheme();
  const { getToken } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
            <TouchableOpacity 
              key={item.track.id}
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
              <TouchableOpacity style={styles.playButton}>
                <Ionicons name="play" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.base,
    paddingHorizontal: spacing.lg,
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
  
  // Track detail styles
  trackDetailHeader: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  trackCover: {
    width: 240,
    height: 240,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  trackDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  trackDetailArtist: {
    fontSize: 18,
    marginBottom: spacing.lg,
  },
  albumButton: {
    marginBottom: spacing.xl,
  },
  albumButtonText: {
    fontSize: 14,
  },
  playTrackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    borderRadius: 30,
  },
  playText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
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