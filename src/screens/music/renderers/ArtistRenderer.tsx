import React from 'react';
import { 
  TouchableOpacity, 
  Image, 
  Text, 
  StyleSheet,
  ListRenderItem 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../context/ThemeContext';
import { spacing, borderRadius } from '../../../styles';

interface Artist {
  id: string;
  name: string;
  images: Array<{url: string; height: number | null; width: number | null}>;
  genres?: string[];
  popularity?: number;
  followers?: {
    total: number;
  };
}

// Artist horizontal list item component
const ArtistListItem: React.FC<{ item: Artist }> = ({ item }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  const navigateToArtist = (artistId: string) => {
    // @ts-ignore
    navigation.navigate('ArtistDetail', { id: artistId });
  };
  
  return (
    <TouchableOpacity 
      style={styles.artistItem}
      activeOpacity={0.7}
      onPress={() => navigateToArtist(item.id)}
    >
      <Image 
        source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/120' }} 
        style={styles.artistImage} 
      />
      <Text 
        style={[styles.artistName, { color: theme.colors.text.primary }]}
        numberOfLines={2}
      >
        {item.name}
      </Text>
      {item.genres && item.genres.length > 0 && (
        <Text 
          style={[styles.artistGenre, { color: theme.colors.text.secondary }]}
          numberOfLines={1}
        >
          {item.genres[0]}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// Artist grid item component
const ArtistGridItem: React.FC<{ item: Artist }> = ({ item }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  const navigateToArtist = (artistId: string) => {
    // @ts-ignore
    navigation.navigate('ArtistDetail', { id: artistId });
  };
  
  return (
    <TouchableOpacity 
      style={styles.artistGridItem}
      activeOpacity={0.7}
      onPress={() => navigateToArtist(item.id)}
    >
      <Image 
        source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/150' }} 
        style={styles.artistGridImage} 
      />
      <Text 
        style={[styles.artistGridName, { color: theme.colors.text.primary }]}
        numberOfLines={2}
      >
        {item.name}
      </Text>
      {item.genres && item.genres.length > 0 && (
        <Text 
          style={[styles.artistGridGenre, { color: theme.colors.text.secondary }]}
          numberOfLines={1}
        >
          {item.genres[0]}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// Export proper renderItem functions that don't use hooks directly
export const renderArtistItem: ListRenderItem<Artist> = ({ item }) => {
  return <ArtistListItem item={item} />;
};

export const renderArtistGridItem: ListRenderItem<Artist> = ({ item }) => {
  return <ArtistGridItem item={item} />;
};

const styles = StyleSheet.create({
  // Horizontal list item
  artistItem: {
    width: 110,
    marginRight: spacing.md,
    alignItems: 'center',
  },
  artistImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: spacing.sm,
    backgroundColor: '#eee',
  },
  artistName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  artistGenre: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  
  // Grid item
  artistGridItem: {
    flex: 1,
    margin: spacing.xs,
    alignItems: 'center',
  },
  artistGridImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: spacing.sm,
    backgroundColor: '#eee',
  },
  artistGridName: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  artistGridGenre: {
    fontSize: 13,
    marginTop: 2,
    textAlign: 'center',
  },
}); 