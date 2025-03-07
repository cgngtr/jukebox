import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, layout, borderRadius, shadows } from '../styles';
import HomeScreen from '../screens/home/HomeScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import ActivityScreen from '../screens/activity/ActivityScreen';
import { 
  MaterialIcons, 
  Ionicons, 
  FontAwesome5,
  MaterialCommunityIcons
} from '@expo/vector-icons';

// Placeholder for screens - will be replaced with actual screens later
const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>{title} Screen</Text>
  </View>
);

// Tab navigator types - updated with new tabs
export type BottomTabParamList = {
  Home: undefined;
  Search: undefined;
  Community: undefined;
  Activity: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

// For MVP, we still use placeholder screens for some tabs
// HomeScreen, CommunityScreen and ActivityScreen are already implemented
const SearchScreen = () => <PlaceholderScreen title="Search" />;
const ProfileScreen = () => <PlaceholderScreen title="Profile" />;

// Icon size configuration
const ICON_SIZE = 24;

// Bottom tab navigation
const BottomTabNavigator: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  
  // Platform-specific styling
  const isIOS = Platform.OS === 'ios';
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: isDarkMode ? 'transparent' : theme.colors.divider,
          borderTopWidth: isDarkMode ? 0 : StyleSheet.hairlineWidth,
          height: layout.tabBarHeight,
          paddingBottom: isIOS ? spacing.sm : spacing.xs,
          paddingTop: spacing.xs,
          ...Platform.select({
            ios: {
              shadowColor: isDarkMode ? 'transparent' : 'rgba(0, 0, 0, 0.1)',
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            },
            android: {
              elevation: isDarkMode ? 0 : 5,
            },
          }),
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.inactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: isIOS ? -2 : -4,
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
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && { backgroundColor: `${theme.colors.primary}15` }
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
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && { backgroundColor: `${theme.colors.primary}15` }
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
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && { backgroundColor: `${theme.colors.primary}15` }
            ]}>
              <MaterialIcons 
                name={focused ? "people" : "people-outline"} 
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
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && { backgroundColor: `${theme.colors.primary}15` }
            ]}>
              <MaterialIcons 
                name={focused ? "notifications" : "notifications-none"} 
                size={ICON_SIZE} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && { backgroundColor: `${theme.colors.primary}15` }
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
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // Default background for placeholder
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
});

export default BottomTabNavigator;
