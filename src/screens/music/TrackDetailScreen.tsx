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

const TrackDetailScreen = () => {
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
});

export default TrackDetailScreen;
