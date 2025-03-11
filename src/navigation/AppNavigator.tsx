import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, CommonActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import BottomTabNavigator from './BottomTabNavigator';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import SpotifyTestScreen from '../screens/SpotifyTestScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import ArtistDetailScreen from '../screens/music/ArtistDetailScreen';
import AlbumDetailScreen from '../screens/music/AlbumDetailScreen';
import TrackDetailScreen from '../screens/music/TrackDetailScreen';
import PlayerScreen from '../screens/music/PlayerScreen';
import { PlaylistDetailScreen } from '../screens/music/DetailScreens';
import ArtistAlbumsScreen from '../screens/music/ArtistAlbumsScreen';
import ListeningRoomScreen from '../screens/community/ListeningRoomScreen';
import SearchResultsScreen from '../screens/search/SearchResultsScreen';
import { CreateReviewScreen, ReviewDetailScreen } from '../screens/music';
import ProfileScreen from '../screens/profile/ProfileScreen';

// "See All" screens
import AllNewReleasesScreen from '../screens/music/AllNewReleasesScreen';
import AllTracksScreen from '../screens/music/AllTracksScreen';
import AllPlaylistsScreen from '../screens/music/AllPlaylistsScreen';
import AllTopArtistsScreen from '../screens/music/AllTopArtistsScreen';
import AllListeningRoomsScreen from '../screens/community/AllListeningRoomsScreen';
import AllChallengesScreen from '../screens/community/AllChallengesScreen';

// Stack navigator types
export type AppStackParamList = {
  Auth: undefined;
  Main: undefined;
  SpotifyTest: undefined;
  Settings: undefined;
  ArtistDetail: { id: string };
  AlbumDetail: { 
    id: string;
    albumId?: string; // For backward compatibility
    albumName?: string;
    artistName?: string;
    coverUrl?: string;
  };
  TrackDetail: { 
    id: string; 
    trackId?: string; // For backward compatibility
    trackName?: string;
    artistName?: string;
    coverUrl?: string;
    albumId?: string;
    albumName?: string;
  };
  Player: undefined;
  PlaylistDetail: { id: string };
  ArtistAlbums: { artistId: string; artistName: string };
  ListeningRoomScreen: { id: string };
  SearchResults: { query: string; category: string };
  // "See All" screen types
  AllNewReleases: { albums: any[]; title: string };
  AllTracks: { tracks: any[]; title: string };
  AllPlaylists: { playlists: any[]; title: string; selectedTab?: string; userId?: string };
  AllTopArtists: { artists: any[]; title: string };
  AllListeningRooms: { rooms: any[]; title: string };
  AllChallenges: { challenges: any[]; title: string };
  CreateReview: { 
    itemId: string;
    itemType: 'album' | 'track' | 'artist';
    itemName?: string;
    itemImage?: string;
  };
  ReviewDetail: { 
    reviewId: string;
    showComments?: boolean;
  };
  Profile: { userId: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

// App navigation structure
const AppNavigator: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { isAuthenticated: authState, isLoading, getToken } = useAuth();
  
  // İlk durumda Auth ekranını göster, token kontrolünden sonra değişecek
  const [initialRoute, setInitialRoute] = useState<keyof AppStackParamList>('Auth');
  const [hasToken, setHasToken] = useState<boolean>(false);
  
  // Token varlığını kontrol et
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await getToken();
        const tokenExists = !!token;
        setHasToken(tokenExists);
        
        // Token yoksa Auth ekranına, varsa Main ekranına yönlendir
        setInitialRoute(tokenExists ? 'Main' : 'Auth');
        console.log(`Token ${tokenExists ? 'bulundu' : 'bulunamadı'}, yönlendiriliyor: ${tokenExists ? 'Main' : 'Auth'}`);
      } catch (error) {
        console.error('Token kontrolü sırasında hata:', error);
        setHasToken(false);
        setInitialRoute('Auth');
      }
    };
    
    if (!isLoading) {
      checkToken();
    }
  }, [isLoading, getToken]);
  
  // Using DefaultTheme as base and overriding colors
  const navigationTheme = {
    ...DefaultTheme,
    dark: isDarkMode,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text.primary,
      border: theme.colors.divider,
      notification: theme.colors.secondary,
    },
  };

  // Yükleme sırasında ekranı göster
  if (isLoading) {
    return null; // veya bir loading ekranı gösterilebilir
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'fade',
        }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen 
          name="SpotifyTest" 
          component={SpotifyTestScreen} 
          options={{
            headerShown: true,
            title: 'Spotify API Test',
            headerTintColor: theme.colors.primary,
          }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="ArtistDetail" 
          component={ArtistDetailScreen} 
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="AlbumDetail" 
          component={AlbumDetailScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="TrackDetail" 
          component={TrackDetailScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="Player" 
          component={PlayerScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
        <Stack.Screen 
          name="PlaylistDetail" 
          component={PlaylistDetailScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="ArtistAlbums" 
          component={ArtistAlbumsScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="ListeningRoomScreen" 
          component={ListeningRoomScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="SearchResults" 
          component={SearchResultsScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        
        {/* "See All" Screens */}
        <Stack.Screen 
          name="AllNewReleases" 
          component={AllNewReleasesScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="AllTracks" 
          component={AllTracksScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="AllPlaylists" 
          component={AllPlaylistsScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="AllTopArtists" 
          component={AllTopArtistsScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="AllListeningRooms" 
          component={AllListeningRoomsScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="AllChallenges" 
          component={AllChallengesScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="CreateReview" 
          component={CreateReviewScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="ReviewDetail" 
          component={ReviewDetailScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
