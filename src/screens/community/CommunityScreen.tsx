import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  FlatList,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing, layout, borderRadius } from '../../styles';
import { Card, Button } from '../../components';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Main CommunityScreen component
const CommunityScreen: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = React.useState(false);

  // Mock data for listening rooms
  const listeningRooms = [
    { 
      id: '1', 
      name: 'Chill Vibes Only', 
      host: 'DJ Smooth', 
      listeners: 42, 
      isLive: true,
      genre: 'Lo-Fi',
      color: theme.colors.primary // Use theme color instead of hardcoded
    },
    { 
      id: '2', 
      name: '90s Throwback', 
      host: 'Retro Fan', 
      listeners: 28, 
      isLive: true,
      genre: 'Hip-Hop',
      color: theme.colors.primary // Use theme color instead of hardcoded
    },
    { 
      id: '3', 
      name: 'Indie Discoveries', 
      host: 'New Wave', 
      listeners: 15, 
      isLive: true,
      genre: 'Alternative',
      color: theme.colors.primary // Use theme color instead of hardcoded
    },
  ];

  // Mock data for music challenges
  const musicChallenges = [
    { 
      id: '1', 
      title: 'This Week\'s Top 10', 
      description: 'Vote for your favorite tracks of the week', 
      participants: 146,
      daysLeft: 3,
      color: theme.colors.primary // Use theme color instead of hardcoded
    },
    { 
      id: '2', 
      title: 'Guess The Artist', 
      description: 'How well do you know your music?', 
      participants: 78,
      daysLeft: 5,
      color: theme.colors.primary // Use theme color instead of hardcoded
    },
  ];

  // Mock community stats
  const communityStats = {
    activeMembersToday: 327,
    totalListeningRooms: 18,
    activeChallenges: 5
  };

  // Simulate refreshing
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Navigate to listening room detail
  const navigateToRoom = (roomId: string) => {
    // @ts-ignore
    navigation.navigate('ListeningRoomScreen', { id: roomId });
  };
  
  // Navigate to see all listening rooms
  const navigateToAllListeningRooms = () => {
    // @ts-ignore
    navigation.navigate('AllListeningRooms', { 
      title: 'Live Listening Rooms',
      rooms: listeningRooms
    });
  };
  
  // Navigate to see all music challenges
  const navigateToAllChallenges = () => {
    // @ts-ignore
    navigation.navigate('AllChallenges', { 
      title: 'Music Challenges',
      challenges: musicChallenges
    });
  };

  // Render a listening room card
  const renderListeningRoom = ({ item }: { item: typeof listeningRooms[0] }) => (
    <TouchableOpacity 
      key={item.id}
      onPress={() => navigateToRoom(item.id)}
      activeOpacity={0.7}
      style={styles.roomCardContainer}
    >
      <Card style={styles.roomCard}>
        <View style={[styles.roomCoverContainer, { 
          backgroundColor: isDarkMode ? theme.colors.card : theme.colors.background,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.divider,
        }]}>
          <MaterialCommunityIcons 
            name="music-note-eighth" 
            size={40} 
            color={theme.colors.primary} 
          />
        </View>
        <View style={[styles.roomContent, { 
          backgroundColor: isDarkMode ? theme.colors.card : theme.colors.background 
        }]}>
          <View style={styles.roomHeader}>
            <Text style={[styles.roomName, { color: theme.colors.text.primary }]}>
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
              <FontAwesome5 name="user-alt" size={12} color={theme.colors.text.secondary} style={{marginRight: 5}} />
              <Text style={[styles.hostName, { color: theme.colors.text.secondary }]}>
                {item.host}
              </Text>
            </View>
            <View style={styles.listenerInfo}>
              <Ionicons name="headset" size={14} color={theme.colors.text.secondary} style={{marginRight: 5}} />
              <Text style={[styles.listenerCount, { color: theme.colors.text.secondary }]}>
                {item.listeners}
              </Text>
            </View>
            <View style={styles.genreInfo}>
              <MaterialCommunityIcons name="music-note" size={14} color={theme.colors.text.secondary} style={{marginRight: 5}} />
              <Text style={[styles.genre, { color: theme.colors.text.secondary }]}>
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
      </Card>
    </TouchableOpacity>
  );

  // Render a challenge card
  const renderChallenge = ({ item }: { item: typeof musicChallenges[0] }) => (
    <TouchableOpacity key={item.id} activeOpacity={0.7}>
      <Card style={styles.challengeCard}>
        <View style={[styles.challengeCoverContainer, { 
          backgroundColor: isDarkMode ? theme.colors.card : theme.colors.background,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.divider,
        }]}>
          <Ionicons name="trophy" size={36} color={theme.colors.primary} />
        </View>
        <View style={[styles.challengeContent, {
          backgroundColor: isDarkMode ? theme.colors.card : theme.colors.background
        }]}>
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
              style={[styles.participateButton, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.participateButtonText}>
                Participate
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Community
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Community Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { 
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderWidth: 1,
            borderColor: theme.colors.divider,
          }]}>
            <Ionicons name="people" size={18} color={theme.colors.text.secondary} />
            <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
              {communityStats.activeMembersToday}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
              Active Today
            </Text>
          </View>
          
          <View style={[styles.statCard, { 
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderWidth: 1,
            borderColor: theme.colors.divider,
          }]}>
            <Ionicons name="headset" size={18} color={theme.colors.text.secondary} />
            <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
              {communityStats.totalListeningRooms}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
              Rooms
            </Text>
          </View>
          
          <View style={[styles.statCard, { 
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderWidth: 1,
            borderColor: theme.colors.divider,
          }]}>
            <Ionicons name="trophy" size={18} color={theme.colors.text.secondary} />
            <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
              {communityStats.activeChallenges}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
              Challenges
            </Text>
          </View>
        </View>

        {/* Create a Room Button */}
        <Button 
          title="Create a Listening Room" 
          style={styles.createRoomButton}
          variant="primary"
          onPress={() => {}}
          fullWidth
          leftIcon={<Ionicons name="add-circle-outline" size={18} color="white" />}
        />

        {/* Listening Rooms */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Live Listening Rooms
            </Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={navigateToAllListeningRooms}
            >
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                See All
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={listeningRooms}
            renderItem={renderListeningRoom}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.roomsListContainer}
          />
        </View>

        {/* Music Challenges */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Music Challenges
            </Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={navigateToAllChallenges}
            >
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                See All
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          {musicChallenges.map(challenge => renderChallenge({ item: challenge }))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.base,
    paddingHorizontal: spacing.base,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xxs,
    borderRadius: borderRadius.lg,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  createRoomButton: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    width: 'auto',
  },
  section: {
    marginTop: spacing.base,
    paddingHorizontal: spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  lastSection: {
    marginBottom: spacing.xxxl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  roomsListContainer: {
    paddingRight: spacing.base,
  },
  roomCardContainer: {
    width: 280,
    marginRight: spacing.base,
  },
  roomCard: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: borderRadius.lg,
    backgroundColor: 'transparent',
  },
  roomCoverContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 16,
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontSize: 13,
  },
  listenerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listenerCount: {
    fontSize: 13,
  },
  genreInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genre: {
    fontSize: 13,
  },
  joinButton: {
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  challengeCard: {
    marginBottom: spacing.base,
    padding: 0,
    overflow: 'hidden',
    borderRadius: borderRadius.lg,
    backgroundColor: 'transparent',
  },
  challengeCoverContainer: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeContent: {
    padding: spacing.base,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  challengeDescription: {
    fontSize: 13,
    marginBottom: spacing.base,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeStats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  statText: {
    fontSize: 14,
  },
  participateButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  participateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CommunityScreen;
