import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import BottomTabNavigator from './BottomTabNavigator';
import { useTheme } from '../context/ThemeContext';

// Stack navigator types
export type AppStackParamList = {
  Auth: undefined;
  Main: undefined;
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
