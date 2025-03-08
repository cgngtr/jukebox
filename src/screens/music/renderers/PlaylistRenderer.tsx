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

interface Playlist {
  id: string;
  name: string;
  description?: string;
  images: Array<{url: string; height: number | null; width: number | null}>;
  owner: {
    id: string;
    display_name: string;
  };
  tracks?: {
    total: number;
  };
  followers?: {
    total: number;
  };
}

// Format followers count
const formatFollowers = (followers: { total: number } | number | undefined): string => {
  if (!followers) return '0';
  
  let count = typeof followers === 'object' ? followers.total : followers;
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

// Card component for playlists
const PlaylistCard: React.FC<{ item: Playlist }> = ({ item }) => {
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();
  
  const navigateToPlaylist = (playlistId: string) => {
    // @ts-ignore
    navigation.navigate('PlaylistDetail', { id: playlistId });
  };
  
  return (
    <TouchableOpacity 
      style={styles.playlistCard} 
      activeOpacity={0.7}
      onPress={() => navigateToPlaylist(item.id)}
    >
      <Image
        source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/200' }}
        style={styles.playlistImage}
      />
      <View style={styles.playlistContent}>
        <Text 
          style={[styles.playlistTitle, { color: theme.colors.text.primary }]} 
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text 
          style={[styles.playlistSubtitle, { color: theme.colors.text.secondary }]} 
          numberOfLines={1}
        >
          {item.description || `By ${item.owner.display_name}`}
        </Text>
        <View style={styles.playlistStats}>
          <Text style={[styles.playlistStatText, { color: theme.colors.text.secondary }]}>
            {item.tracks?.total || 0} tracks
          </Text>
          <Text style={[styles.playlistStatText, { color: theme.colors.text.secondary }]}>
            {formatFollowers(item.followers)} followers
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// List item component for playlists
const PlaylistListItem: React.FC<{ item: Playlist }> = ({ item }) => {
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();
  
  const navigateToPlaylist = (playlistId: string) => {
    // @ts-ignore
    navigation.navigate('PlaylistDetail', { id: playlistId });
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.playlistItem,
        { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }
      ]}
      activeOpacity={0.7}
      onPress={() => navigateToPlaylist(item.id)}
    >
      <Image 
        source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/60' }} 
        style={styles.playlistItemCover} 
      />
      <View style={styles.playlistItemInfo}>
        <Text style={[styles.playlistItemTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.playlistItemDetails}>
          <Text style={[styles.playlistItemSubtitle, { color: theme.colors.text.secondary }]} numberOfLines={1}>
            {item.tracks?.total || 0} tracks • {formatFollowers(item.followers)} followers
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Export proper renderItem functions that don't use hooks directly
export const renderPlaylistCard: ListRenderItem<Playlist> = ({ item }) => {
  return <PlaylistCard item={item} />;
};

export const renderPlaylistItem: ListRenderItem<Playlist> = ({ item }) => {
  return <PlaylistListItem item={item} />;
};

const styles = StyleSheet.create({
  // Card style
  playlistCard: {
    flex: 1,
    margin: spacing.xs,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  playlistImage: {
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  playlistContent: {
    padding: spacing.sm,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  playlistSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  playlistStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  playlistStatText: {
    fontSize: 12,
  },
  
  // List item style
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: borderRadius.md,
  },
  playlistItemCover: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.sm,
    backgroundColor: '#eee',
  },
  playlistItemInfo: {
    flex: 1,
    marginLeft: spacing.base,
  },
  playlistItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  playlistItemDetails: {
    flexDirection: 'row',
    marginTop: 2,
  },
  playlistItemSubtitle: {
    fontSize: 14,
  },
}); 