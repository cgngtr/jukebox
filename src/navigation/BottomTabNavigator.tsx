import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, layout, borderRadius, shadows } from '../styles';
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/search/SearchScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import ActivityScreen from '../screens/activity/ActivityScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import MiniPlayer from '../components/music/MiniPlayer';
import { usePlayer } from '../context/PlayerContext';
import { 
  MaterialIcons, 
  Ionicons, 
  FontAwesome5,
  MaterialCommunityIcons
} from '@expo/vector-icons';

// Tab navigator types - updated with new tabs
export type BottomTabParamList = {
  Home: undefined;
  Search: undefined;
  Community: undefined;
  Activity: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

// Icon size configuration - increased for better visibility
const ICON_SIZE = 24;
const FOCUS_SCALE = 1.1; // Subtle scale effect for focused icons

// Bottom tab navigation
const BottomTabNavigator: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { playerState } = usePlayer();
  
  // Platform-specific styling
  const isIOS = Platform.OS === 'ios';
  
  // Determine if the mini player should be shown
  const showMiniPlayer = playerState.currentTrack !== null;
  
  // Adjust tabBar height when mini player is visible
  const tabBarHeight = showMiniPlayer ? layout.tabBarHeight : layout.tabBarHeight + 10;
  
  return (
    <View style={{ flex: 1 }}>
      {/* Mini Player */}
      {showMiniPlayer && (
        <View style={{
          position: 'absolute',
          bottom: layout.tabBarHeight,
          left: 0,
          right: 0,
          zIndex: 1000
        }}>
          <MiniPlayer />
        </View>
      )}
      
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.background,
            borderTopColor: isDarkMode ? 'transparent' : theme.colors.divider,
            borderTopWidth: isDarkMode ? 0 : StyleSheet.hairlineWidth,
            height: tabBarHeight,
            paddingBottom: isIOS ? spacing.xs : spacing.xxs,
            paddingTop: spacing.xxs,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            ...Platform.select({
              ios: {
                shadowColor: isDarkMode ? 'transparent' : theme.colors.divider,
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.12,
                shadowRadius: 5,
              },
              android: {
                elevation: isDarkMode ? 0 : 8,
              },
            }),
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.text.secondary,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: isIOS ? 2 : 0,
            fontFamily: 'System',
          },
          tabBarItemStyle: {
            paddingVertical: spacing.xxs,
          },
          tabBarShowLabel: true,
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.iconContainer,
                focused && { 
                  backgroundColor: `${theme.colors.primary}20`,
                  transform: [{ scale: FOCUS_SCALE }]
                }
              ]}>
                <Ionicons 
                  name={focused ? "home" : "home-outline"} 
                  size={ICON_SIZE} 
                  color={color} 
                />
              </View>
            ),
          }}
        />
        
        <Tab.Screen 
          name="Search" 
          component={SearchScreen} 
          options={{
            tabBarLabel: 'Search',
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.iconContainer,
                focused && { 
                  backgroundColor: `${theme.colors.primary}20`,
                  transform: [{ scale: FOCUS_SCALE }]
                }
              ]}>
                <Ionicons 
                  name={focused ? "search" : "search-outline"} 
                  size={ICON_SIZE} 
                  color={color} 
                />
              </View>
            ),
          }}
        />
        
        <Tab.Screen 
          name="Community" 
          component={CommunityScreen} 
          options={{
            tabBarLabel: 'Community',
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.iconContainer,
                focused && { 
                  backgroundColor: `${theme.colors.primary}20`,
                  transform: [{ scale: FOCUS_SCALE }]
                }
              ]}>
                <MaterialCommunityIcons 
                  name={focused ? "account-group" : "account-group-outline"} 
                  size={ICON_SIZE} 
                  color={color} 
                />
              </View>
            ),
          }}
        />
        
        <Tab.Screen 
          name="Activity" 
          component={ActivityScreen} 
          options={{
            tabBarLabel: 'Activity',
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.iconContainer,
                focused && { 
                  backgroundColor: `${theme.colors.primary}20`,
                  transform: [{ scale: FOCUS_SCALE }]
                }
              ]}>
                <Ionicons 
                  name={focused ? "pulse" : "pulse-outline"} 
                  size={ICON_SIZE} 
                  color={color} 
                />
                {/* Add a notification indicator when there are new activities */}
                {focused ? null : (
                  <View style={styles.notificationDot} />
                )}
              </View>
            ),
          }}
        />
        
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.iconContainer,
                focused && { 
                  backgroundColor: `${theme.colors.primary}20`,
                  transform: [{ scale: FOCUS_SCALE }]
                }
              ]}>
                <MaterialCommunityIcons 
                  name={focused ? "account-music" : "account-music-outline"} 
                  size={ICON_SIZE} 
                  color={color} 
                />
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30', // Red notification dot
    borderWidth: 1,
    borderColor: 'white',
  }
});

export default BottomTabNavigator;
