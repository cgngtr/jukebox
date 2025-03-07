import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, CommonActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import BottomTabNavigator from './BottomTabNavigator';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import SpotifyTestScreen from '../screens/SpotifyTestScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import { 
  ArtistDetailScreen, 
  AlbumDetailScreen, 
  TrackDetailScreen, 
  PlaylistDetailScreen 
} from '../screens/music/DetailScreens';
import ListeningRoomScreen from '../screens/community/ListeningRoomScreen';

// Stack navigator types
export type AppStackParamList = {
  Auth: undefined;
  Main: undefined;
  SpotifyTest: undefined;
  Settings: undefined;
  ArtistDetail: { id: string };
  AlbumDetail: { id: string };
  TrackDetail: { id: string };
  PlaylistDetail: { id: string };
  ListeningRoomScreen: { id: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

// App navigation structure
const AppNavigator: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const [initialRoute, setInitialRoute] = useState<keyof AppStackParamList>('Auth');
  
  // Auth durumu değiştiğinde initial route'u belirle
  useEffect(() => {
    if (!isLoading) {
      setInitialRoute(isAuthenticated ? 'Main' : 'Auth');
    }
  }, [isAuthenticated, isLoading]);
  
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
          name="PlaylistDetail" 
          component={PlaylistDetailScreen}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
