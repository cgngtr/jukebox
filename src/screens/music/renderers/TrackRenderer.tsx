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
import { spacing, borderRadius } from '../../../styles';
import { Ionicons } from '@expo/vector-icons';

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
}

// Format milliseconds to minutes:seconds
const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// Actual React component that uses hooks
const TrackItem: React.FC<{ item: Track }> = ({ item }) => {
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();
  
  const navigateToTrack = (trackId: string) => {
    // @ts-ignore
    navigation.navigate('TrackDetail', { id: trackId });
  };
  
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
    marginLeft: spacing.sm,
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
  },
}); 