import React from 'react';
import { useRoute } from '@react-navigation/native';
import AllItemsScreen from '../common/AllItemsScreen';
import { renderAlbumCard } from './renderers/AlbumRenderer';

interface Album {
  id: string;
  name: string;
  artists: Array<{id: string; name: string}>;
  images: Array<{url: string; height: number | null; width: number | null}>;
  release_date?: string;
}

const AllNewReleasesScreen: React.FC = () => {
  const route = useRoute();
  const { albums = [], title = 'New Releases' } = route.params as { albums: Album[]; title: string };
  
  return (
    <AllItemsScreen<Album>
      data={albums}
      title={title}
      renderItem={renderAlbumCard}
      keyExtractor={(item, index) => item?.id || `album-${index}`}
      noDataMessage="No albums available"
      numColumns={2}
    />
  );
};

export default AllNewReleasesScreen; 