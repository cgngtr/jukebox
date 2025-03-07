import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../styles';
import { Card } from '../../components';

// Activity types for display
const ACTIVITY_TYPES = {
  LIKE_SONG: 'LIKE_SONG',
  JOIN_ROOM: 'JOIN_ROOM',
  COMPLETE_CHALLENGE: 'COMPLETE_CHALLENGE', 
  NEW_FOLLOWER: 'NEW_FOLLOWER',
  FRIEND_ACTIVITY: 'FRIEND_ACTIVITY',
};

// Main ActivityScreen component
const ActivityScreen: React.FC = () => {
  const { theme } = useTheme();

  // Mock data for activities
  const activities = [
    { 
      id: '1', 
      type: ACTIVITY_TYPES.LIKE_SONG, 
      title: 'You liked "Summer Nights"',
      subtitle: 'by Coastal Wave',
      timestamp: '2h ago',
      image: 'https://via.placeholder.com/60',
    },
    { 
      id: '2', 
      type: ACTIVITY_TYPES.NEW_FOLLOWER, 
      title: 'John Smith started following you',
      subtitle: 'You have 43 followers now',
      timestamp: '3h ago',
      image: 'https://via.placeholder.com/60',
    },
    { 
      id: '3', 
      type: ACTIVITY_TYPES.JOIN_ROOM, 
      title: 'You joined "Chill Vibes Only"',
      subtitle: 'Listening room hosted by DJ Smooth',
      timestamp: '1d ago',
      image: 'https://via.placeholder.com/60',
    },
    { 
      id: '4', 
      type: ACTIVITY_TYPES.FRIEND_ACTIVITY, 
      title: 'Jane Doe is listening to "Electric Dreams"',
      subtitle: 'by Synthwave Heroes',
      timestamp: '2d ago',
      image: 'https://via.placeholder.com/60',
    },
    { 
      id: '5', 
      type: ACTIVITY_TYPES.COMPLETE_CHALLENGE, 
      title: 'You completed "This Week\'s Top 10"',
      subtitle: 'You earned 50 points',
      timestamp: '3d ago',
      image: 'https://via.placeholder.com/60',
    },
  ];

  // Get the correct icon for each activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case ACTIVITY_TYPES.LIKE_SONG:
        return '❤️';
      case ACTIVITY_TYPES.JOIN_ROOM:
        return '🎧';
      case ACTIVITY_TYPES.COMPLETE_CHALLENGE:
        return '🏆';
      case ACTIVITY_TYPES.NEW_FOLLOWER:
        return '👤';
      case ACTIVITY_TYPES.FRIEND_ACTIVITY:
        return '👥';
      default:
        return '📱';
    }
  };

  // Render an activity item
  const renderActivity = ({ item }: { item: typeof activities[0] }) => (
    <TouchableOpacity>
      <Card style={styles.activityCard}>
        <View style={styles.activityContent}>
          <View style={styles.activityIconContainer}>
            <Text style={styles.activityIcon}>{getActivityIcon(item.type)}</Text>
          </View>
          
          <View style={styles.activityInfo}>
            <Text style={[styles.activityTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.activitySubtitle, { color: theme.colors.text.secondary }]} numberOfLines={1}>
              {item.subtitle}
            </Text>
            <Text style={[styles.activityTimestamp, { color: theme.colors.text.inactive }]}>
              {item.timestamp}
            </Text>
          </View>
          
          <Image source={{ uri: item.image }} style={styles.activityImage} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Activity
        </Text>
      </View>
      
      <ScrollView>
        {/* Activity Filters */}
        <View style={styles.filters}>
          <TouchableOpacity 
            style={[styles.filterButton, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={styles.filterButtonText}>All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, { 
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.divider,
              borderWidth: 1
            }]}
          >
            <Text style={[styles.filterButtonText, { color: theme.colors.text.primary }]}>
              You
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, { 
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.divider,
              borderWidth: 1
            }]}
          >
            <Text style={[styles.filterButtonText, { color: theme.colors.text.primary }]}>
              Friends
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, { 
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.divider,
              borderWidth: 1
            }]}
          >
            <Text style={[styles.filterButtonText, { color: theme.colors.text.primary }]}>
              Mentions
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Activities List */}
        <View style={styles.activitiesContainer}>
          {activities.map((item) => (
            <View key={item.id} style={styles.activityItemContainer}>
              {renderActivity({ item })}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  filterButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  activitiesContainer: {
    padding: spacing.base,
  },
  activityItemContainer: {
    marginBottom: spacing.sm,
  },
  activityCard: {
    padding: spacing.base,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  activityIcon: {
    fontSize: 18,
  },
  activityInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  activitySubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  activityTimestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  activityImage: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#eee',
  },
});

export default ActivityScreen; 