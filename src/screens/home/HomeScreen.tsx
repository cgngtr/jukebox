import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing, layout } from '../../styles';
import { Card } from '../../components';

// Main HomeScreen component
const HomeScreen: React.FC = () => {
  const { theme } = useTheme();

  // Mock data for recent albums
  const recentAlbums = [
    { id: '1', title: 'Midnight Memories', artist: 'The Night Owls', cover: 'https://via.placeholder.com/150' },
    { id: '2', title: 'Sunset Boulevard', artist: 'Coastal Wave', cover: 'https://via.placeholder.com/150' },
    { id: '3', title: 'Electric Dreams', artist: 'Synthwave Heroes', cover: 'https://via.placeholder.com/150' },
    { id: '4', title: 'Mountain Echoes', artist: 'Nature Sounds', cover: 'https://via.placeholder.com/150' },
  ];

  // Mock data for popular tracks
  const popularTracks = [
    { id: '1', title: 'Summer Nights', artist: 'Coastal Wave', duration: '3:45', cover: 'https://via.placeholder.com/60' },
    { id: '2', title: 'Neon Lights', artist: 'Synthwave Heroes', duration: '4:12', cover: 'https://via.placeholder.com/60' },
    { id: '3', title: 'Midnight Drive', artist: 'The Night Owls', duration: '3:28', cover: 'https://via.placeholder.com/60' },
    { id: '4', title: 'Ocean Breeze', artist: 'Coastal Wave', duration: '3:56', cover: 'https://via.placeholder.com/60' },
    { id: '5', title: 'City Lights', artist: 'Urban Beats', duration: '4:02', cover: 'https://via.placeholder.com/60' },
  ];

  // Render an album card
  const renderAlbumCard = ({ item }: { item: typeof recentAlbums[0] }) => (
    <TouchableOpacity style={styles.albumCard}>
      <Image source={{ uri: item.cover }} style={styles.albumCover} />
      <Text style={[styles.albumTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={[styles.albumArtist, { color: theme.colors.text.secondary }]} numberOfLines={1}>
        {item.artist}
      </Text>
    </TouchableOpacity>
  );

  // Render a track item
  const renderTrackItem = ({ item }: { item: typeof popularTracks[0] }) => (
    <TouchableOpacity style={styles.trackItem}>
      <Image source={{ uri: item.cover }} style={styles.trackCover} />
      <View style={styles.trackInfo}>
        <Text style={[styles.trackTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.trackArtist, { color: theme.colors.text.secondary }]} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
      <Text style={[styles.trackDuration, { color: theme.colors.text.secondary }]}>
        {item.duration}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: theme.colors.text.primary }]}>
            Good Morning
          </Text>
          <Text style={[styles.nameText, { color: theme.colors.primary }]}>
            Music Lover
          </Text>
        </View>

        {/* Recent Albums */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Recent Albums
          </Text>
          <FlatList
            data={recentAlbums}
            renderItem={renderAlbumCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.albumList}
          />
        </View>

        {/* Popular Tracks */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Popular Tracks
          </Text>
          <Card style={styles.tracksCard}>
            {popularTracks.map((track) => (
              <View key={track.id}>
                {renderTrackItem({ item: track })}
                {track.id !== popularTracks[popularTracks.length - 1].id && (
                  <View 
                    style={[styles.divider, { backgroundColor: theme.colors.divider }]} 
                  />
                )}
              </View>
            ))}
          </Card>
        </View>

        {/* Suggested Playlists */}
        <View style={[styles.section, styles.lastSection]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            For You
          </Text>
          <TouchableOpacity 
            style={[styles.playlistCard, { backgroundColor: theme.colors.secondary }]}
          >
            <Text style={styles.playlistTitle}>Discover Weekly</Text>
            <Text style={styles.playlistDescription}>
              New music recommendations just for you, updated every Monday
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
  scrollContent: {
    paddingBottom: layout.tabBarHeight + spacing.xl, // Extra bottom padding for tabBar
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.md,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: spacing.xs,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.base,
  },
  lastSection: {
    marginBottom: spacing.xxxl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  albumList: {
    paddingRight: spacing.base,
  },
  albumCard: {
    width: 150,
    marginRight: spacing.md,
  },
  albumCover: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  albumArtist: {
    fontSize: 12,
    marginTop: spacing.xxs,
  },
  tracksCard: {
    padding: 0,
    overflow: 'hidden',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
  },
  trackCover: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#eee',
  },
  trackInfo: {
    flex: 1,
    marginLeft: spacing.base,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  trackArtist: {
    fontSize: 12,
    marginTop: 2,
  },
  trackDuration: {
    fontSize: 12,
    marginLeft: spacing.sm,
  },
  divider: {
    height: 1,
    marginLeft: spacing.base + 48 + spacing.base, // Match the left edge of track info
  },
  playlistCard: {
    borderRadius: 12,
    padding: spacing.base,
  },
  playlistTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  playlistDescription: {
    color: 'white',
    fontSize: 14,
    marginTop: spacing.sm,
    opacity: 0.9,
  },
});

export default HomeScreen;
