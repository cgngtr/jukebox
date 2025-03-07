import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../styles';
import { Card } from '../../components';

// Main CommunityScreen component
const CommunityScreen: React.FC = () => {
  const { theme } = useTheme();

  // Mock data for listening rooms
  const listeningRooms = [
    { id: '1', name: 'Chill Vibes Only', host: 'DJ Smooth', listeners: 42, isLive: true },
    { id: '2', name: '90s Throwback', host: 'Retro Fan', listeners: 28, isLive: true },
    { id: '3', name: 'Indie Discoveries', host: 'New Wave', listeners: 15, isLive: true },
  ];

  // Mock data for music challenges
  const musicChallenges = [
    { id: '1', title: 'This Week\'s Top 10', description: 'Vote for your favorite tracks of the week', participants: 146 },
    { id: '2', title: 'Guess The Artist', description: 'How well do you know your music?', participants: 78 },
  ];

  // Render a listening room card
  const renderListeningRoom = (room: typeof listeningRooms[0]) => (
    <TouchableOpacity key={room.id}>
      <Card style={styles.roomCard}>
        <View style={styles.roomHeader}>
          <Text style={[styles.roomName, { color: theme.colors.text.primary }]}>
            {room.name}
          </Text>
          {room.isLive && (
            <View style={[styles.liveBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>
        
        <View style={styles.roomInfo}>
          <Text style={[styles.hostName, { color: theme.colors.text.secondary }]}>
            Host: {room.host}
          </Text>
          <Text style={[styles.listenerCount, { color: theme.colors.text.secondary }]}>
            {room.listeners} listening
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.joinButton, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.joinButtonText}>Join Room</Text>
        </TouchableOpacity>
      </Card>
    </TouchableOpacity>
  );

  // Render a challenge card
  const renderChallenge = (challenge: typeof musicChallenges[0]) => (
    <TouchableOpacity key={challenge.id}>
      <Card style={styles.challengeCard}>
        <Text style={[styles.challengeTitle, { color: theme.colors.text.primary }]}>
          {challenge.title}
        </Text>
        <Text style={[styles.challengeDescription, { color: theme.colors.text.secondary }]}>
          {challenge.description}
        </Text>
        <View style={styles.challengeFooter}>
          <Text style={[styles.participantsCount, { color: theme.colors.text.secondary }]}>
            {challenge.participants} participating
          </Text>
          <TouchableOpacity 
            style={[styles.participateButton, { 
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.primary
            }]}
          >
            <Text style={[styles.participateButtonText, { color: theme.colors.primary }]}>
              Participate
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Community
          </Text>
        </View>

        {/* Create a Room Button */}
        <TouchableOpacity 
          style={[styles.createRoomButton, { backgroundColor: theme.colors.secondary }]}
        >
          <Text style={styles.createRoomText}>Create a Listening Room</Text>
        </TouchableOpacity>

        {/* Listening Rooms */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Live Listening Rooms
          </Text>
          {listeningRooms.map(renderListeningRoom)}
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
              See All Rooms
            </Text>
          </TouchableOpacity>
        </View>

        {/* Music Challenges */}
        <View style={[styles.section, styles.lastSection]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Music Challenges
          </Text>
          {musicChallenges.map(renderChallenge)}
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
              See All Challenges
            </Text>
          </TouchableOpacity>
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
  createRoomButton: {
    margin: spacing.base,
    padding: spacing.base,
    borderRadius: 12,
    alignItems: 'center',
  },
  createRoomText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    marginTop: spacing.base,
    paddingHorizontal: spacing.base,
  },
  lastSection: {
    marginBottom: spacing.xxxl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  roomCard: {
    marginBottom: spacing.base,
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
    fontWeight: 'bold',
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
  hostName: {
    fontSize: 14,
  },
  listenerCount: {
    fontSize: 14,
  },
  joinButton: {
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  challengeCard: {
    marginBottom: spacing.base,
    padding: spacing.base,
  },
  challengeTitle: {
    fontSize: 16,
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
  participantsCount: {
    fontSize: 14,
  },
  participateButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
  },
  participateButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  seeAllButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  seeAllText: {
    fontWeight: '600',
  },
});

export default CommunityScreen;
