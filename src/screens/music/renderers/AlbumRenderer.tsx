import React from 'react';
import { 
  TouchableOpacity, 
  Image, 
  Text, 
  StyleSheet, 
  View,
  ListRenderItem 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../context/ThemeContext';
import { spacing, borderRadius } from '../../../styles';

interface Album {
  id: string;
  name: string;
  artists: Array<{id: string; name: string}>;
  images: Array<{url: string; height: number | null; width: number | null}>;
  release_date?: string;
}

// Actual React component that uses hooks
const AlbumCard: React.FC<{ item: Album }> = ({ item }) => {
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();
  
  const navigateToAlbum = (albumId: string) => {
    // @ts-ignore
    navigation.navigate('AlbumDetail', { id: albumId });
  };
  
  return (
    <TouchableOpacity 
      style={styles.albumCard}
      activeOpacity={0.7}
      onPress={() => navigateToAlbum(item.id)}
    >
      <Image 
        source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/150' }} 
        style={styles.albumCover} 
      />
      <LinearGradient
        colors={[
          'rgba(0,0,0,0)',
          isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)'
        ]}
        style={styles.albumGradient}
      >
        <Text style={styles.albumTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.albumArtist} numberOfLines={1}>
          {item.artists.map(artist => artist.name).join(', ')}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Export a proper renderItem function that doesn't use hooks directly
export const renderAlbumCard: ListRenderItem<Album> = ({ item }) => {
  return <AlbumCard item={item} />;
};

const styles = StyleSheet.create({
  albumCard: {
    flex: 1,
    margin: spacing.xs,
    height: 200,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  albumCover: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.lg,
  },
  albumGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  albumArtist: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
}); 