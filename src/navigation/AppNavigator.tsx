import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import BottomTabNavigator from './BottomTabNavigator';
import { useTheme } from '../context/ThemeContext';
import SpotifyTestScreen from '../screens/SpotifyTestScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import { 
  ArtistDetailScreen, 
  AlbumDetailScreen, 
  TrackDetailScreen, 
  PlaylistDetailScreen 
} from '../screens/music/DetailScreens';

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
};

const Stack = createNativeStackNavigator<AppStackParamList>();

// App navigation structure
const AppNavigator: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  
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

  // For MVP, we're setting isAuthenticated to true to bypass auth screens
  // In a real app, this would come from an auth context/service
  // TODO: Implement proper authentication later
  const isAuthenticated = true; // Changed from false to true to bypass auth screens

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'fade',
        }}
        initialRouteName={isAuthenticated ? 'Main' : 'Auth'}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
