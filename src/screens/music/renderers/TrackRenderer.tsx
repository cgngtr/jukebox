import React from 'react';
import { 
  TouchableOpacity, 
  Image, 
  Text, 
  StyleSheet, 
  View,
  ListRenderItem 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../context/ThemeContext';
import { usePlayer } from '../../../context/PlayerContext';
import { SpotifyTrack } from '../../../services/musicApi';
import { spacing, borderRadius } from '../../../styles';
import { Ionicons } from '@expo/vector-icons';

// Yerel Track tipi için arayüz
interface Track {
  id: string;
  name: string;
  artists: Array<{id: string; name: string}>;
  album: {
    id: string;
    name: string;
    images: Array<{url: string; height: number | null; width: number | null}>;
  };
  duration_ms: number;
  uri?: string; // Spotify URI for playback
}

// Format milliseconds to minutes:seconds
const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// Track'i SpotifyTrack formatına dönüştür
const convertToSpotifyTrack = (item: Track): SpotifyTrack => {
  return {
    id: item.id,
    name: item.name,
    artists: item.artists.map(artist => ({
      id: artist.id,
      name: artist.name,
      uri: `spotify:artist:${artist.id}`
    })),
    album: {
      id: item.album.id,
      name: item.album.name,
      images: item.album.images.map(img => ({
        url: img.url,
        height: img.height || 0, // null değeri 0'a dönüştür
        width: img.width || 0    // null değeri 0'a dönüştür
      }))
    },
    duration_ms: item.duration_ms,
    uri: item.uri || `spotify:track:${item.id}`,
    explicit: false,
    popularity: 0,
    preview_url: null,
    external_urls: {
      spotify: `https://open.spotify.com/track/${item.id}`
    }
  };
};

// Actual React component that uses hooks
const TrackItem: React.FC<{ item: Track }> = ({ item }) => {
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();
  const { play, playerState } = usePlayer();
  
  const navigateToTrack = (trackId: string) => {
    // @ts-ignore
    navigation.navigate('TrackDetail', { id: trackId });
  };
  
  // Parçayı Spotify ile çal
  const handlePlayTrack = async (e: any) => {
    e.stopPropagation(); // Ana tıklama olayını engelle
    
    try {
      // Track'i SpotifyTrack formatına dönüştür
      const spotifyTrack = convertToSpotifyTrack(item);
      
      // Parçayı mevcut Spotify oturumunda çal
      await play(spotifyTrack);
    } catch (error) {
      console.error('Track playback error:', error);
    }
  };
  
  // Parça mevcut çalan parça mı kontrol et
  const isCurrentlyPlaying = 
    playerState.isPlaying && 
    playerState.currentTrack?.id === item.id;
  
  return (
    <TouchableOpacity 
      style={[
        styles.trackItem,
        { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }
      ]}
      activeOpacity={0.7}
      onPress={() => navigateToTrack(item.id)}
    >
      <Image 
        source={{ uri: item.album.images[0]?.url || 'https://via.placeholder.com/60' }} 
        style={styles.trackCover} 
      />
      <View style={styles.trackInfo}>
        <Text style={[styles.trackTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.trackArtist, { color: theme.colors.text.secondary }]} numberOfLines={1}>
          {item.artists.map(artist => artist.name).join(', ')}
        </Text>
      </View>
      <Text style={[styles.trackDuration, { color: theme.colors.text.secondary }]}>
        {formatDuration(item.duration_ms)}
      </Text>
      
      {/* Çalma Düğmesi */}
      <TouchableOpacity
        style={styles.playButton}
        onPress={handlePlayTrack}
      >
        <Ionicons
          name={isCurrentlyPlaying ? "pause" : "play"}
          size={24}
          color={theme.colors.primary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// Export a proper renderItem function that doesn't use hooks directly
export const renderTrackItem: ListRenderItem<Track> = ({ item }) => {
  return <TrackItem item={item} />;
};

const styles = StyleSheet.create({
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: borderRadius.md,
  },
  trackCover: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.sm,
    backgroundColor: '#eee',
  },
  trackInfo: {
    flex: 1,
    marginLeft: spacing.base,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  trackArtist: {
    fontSize: 14,
    marginTop: 2,
  },
  trackDuration: {
    fontSize: 13,
    marginRight: spacing.sm,
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
  },
  playButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
}); 