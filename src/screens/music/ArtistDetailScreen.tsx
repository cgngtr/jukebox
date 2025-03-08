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

const ArtistDetailScreen = () => {
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
                <TouchableOpacity style={styles.playButton}>
                  <Ionicons name="play" size={22} color={theme.colors.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
              {index < topTracks.slice(0, 5).length - 1 && (
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
  trackDivider: {
    height: 1,
    marginHorizontal: spacing.lg,
    opacity: 0.08,
  },
});

export default ArtistDetailScreen;
