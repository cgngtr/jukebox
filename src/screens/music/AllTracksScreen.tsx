import React from 'react';
import { useRoute } from '@react-navigation/native';
import AllItemsScreen from '../common/AllItemsScreen';
import { renderTrackItem } from './renderers/TrackRenderer';

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

const AllTracksScreen: React.FC = () => {
  const route = useRoute();
  const { tracks = [], title = 'Tracks' } = route.params as { tracks: Track[]; title: string };
  
  return (
    <AllItemsScreen<Track>
      data={tracks}
      title={title}
      renderItem={renderTrackItem}
      keyExtractor={(item, index) => item?.id || `track-${index}`}
      noDataMessage="No tracks available"
    />
  );
};

export default AllTracksScreen; 