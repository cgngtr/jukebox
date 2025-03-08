import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View,
  ListRenderItem 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../context/ThemeContext';
import { spacing, borderRadius } from '../../../styles';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Listening Room interface
interface ListeningRoom {
  id: string;
  name: string;
  host: string;
  listeners: number;
  isLive: boolean;
  genre: string;
  color: string;
}

// Challenge interface
interface Challenge {
  id: string;
  title: string;
  description: string;
  participants: number;
  daysLeft: number;
  color: string;
}

// Listening Room component
const ListeningRoomCard: React.FC<{ item: ListeningRoom }> = ({ item }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  const navigateToRoom = (roomId: string) => {
    // @ts-ignore
    navigation.navigate('ListeningRoomScreen', { id: roomId });
  };
  
  return (
    <TouchableOpacity 
      key={item.id}
      onPress={() => navigateToRoom(item.id)}
      activeOpacity={0.7}
      style={styles.roomCardContainer}
    >
      <View style={styles.roomCard}>
        <View style={[styles.roomCoverContainer, { backgroundColor: item.color }]}>
          <MaterialCommunityIcons name="music-note-eighth" size={40} color="rgba(255,255,255,0.8)" />
        </View>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.roomGradient}
        >
          <View style={styles.roomContent}>
            <View style={styles.roomHeader}>
              <Text style={styles.roomName}>
                {item.name}
              </Text>
              {item.isLive && (
                <View style={[styles.liveBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
            </View>
            
            <View style={styles.roomInfo}>
              <View style={styles.hostInfo}>
                <FontAwesome5 name="user-alt" size={12} color="white" style={{marginRight: 5}} />
                <Text style={styles.hostName}>
                  {item.host}
                </Text>
              </View>
              <View style={styles.listenerInfo}>
                <Ionicons name="headset" size={14} color="white" style={{marginRight: 5}} />
                <Text style={styles.listenerCount}>
                  {item.listeners}
                </Text>
              </View>
              <View style={styles.genreInfo}>
                <MaterialCommunityIcons name="music-note" size={14} color="white" style={{marginRight: 5}} />
                <Text style={styles.genre}>
                  {item.genre}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.joinButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigateToRoom(item.id)}
            >
              <Text style={styles.joinButtonText}>Join Room</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

// Challenge component
const ChallengeCard: React.FC<{ item: Challenge }> = ({ item }) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity key={item.id} activeOpacity={0.7}>
      <View style={styles.challengeCard}>
        <View style={[styles.challengeCoverContainer, { backgroundColor: item.color }]}>
          <Ionicons name="trophy" size={36} color="rgba(255,255,255,0.8)" />
        </View>
        <View style={styles.challengeContent}>
          <Text style={[styles.challengeTitle, { color: theme.colors.text.primary }]}>
            {item.title}
          </Text>
          <Text style={[styles.challengeDescription, { color: theme.colors.text.secondary }]}>
            {item.description}
          </Text>
          <View style={styles.challengeFooter}>
            <View style={styles.challengeStats}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={14} color={theme.colors.text.secondary} style={{marginRight: 4}} />
                <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>
                  {item.participants}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={14} color={theme.colors.text.secondary} style={{marginRight: 4}} />
                <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>
                  {item.daysLeft} days left
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.participateButton, { 
                backgroundColor: theme.colors.primary 
              }]}
            >
              <Text style={styles.participateButtonText}>
                Participate
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Export proper renderItem functions that don't use hooks directly
export const renderListeningRoom: ListRenderItem<ListeningRoom> = ({ item }) => {
  return <ListeningRoomCard item={item} />;
};

export const renderChallenge: ListRenderItem<Challenge> = ({ item }) => {
  return <ChallengeCard item={item} />;
};

const styles = StyleSheet.create({
  // Listening Room Styles
  roomCardContainer: {
    width: 280,
    marginRight: spacing.base,
  },
  roomCard: {
    overflow: 'hidden',
    borderRadius: borderRadius.lg,
    backgroundColor: '#eee',
  },
  roomCoverContainer: {
    width: '100%',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    justifyContent: 'flex-end',
    borderRadius: borderRadius.lg,
  },
  roomContent: {
    padding: spacing.base,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  liveBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  liveText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  roomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostName: {
    fontSize: 14,
    color: 'white',
  },
  listenerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listenerCount: {
    fontSize: 14,
    color: 'white',
  },
  genreInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genre: {
    fontSize: 14,
    color: 'white',
  },
  joinButton: {
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  // Challenge Styles
  challengeCard: {
    marginBottom: spacing.base,
    overflow: 'hidden',
    borderRadius: borderRadius.lg,
    backgroundColor: '#eee',
  },
  challengeCoverContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeContent: {
    padding: spacing.base,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  challengeDescription: {
    fontSize: 14,
    marginBottom: spacing.base,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeStats: {
    flexDirection: 'column',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statText: {
    fontSize: 14,
  },
  participateButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  participateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
}); 