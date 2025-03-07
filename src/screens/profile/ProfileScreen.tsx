import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing, layout, borderRadius } from '../../styles';
import { Card } from '../../components';
import { 
  Ionicons, 
  MaterialIcons, 
  MaterialCommunityIcons 
} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import SpotifyTestScreen from '../SpotifyTestScreen';

// Mock data for profile
const userProfile = {
  username: 'MusicLover',
  fullName: 'Alex Johnson',
  bio: 'Music enthusiast | Concert goer | Playlist curator',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  followers: 425,
  following: 290,
  playlists: 17,
  stats: {
    minutesListened: 12460,
    topGenres: ['Pop', 'Rock', 'Hip Hop', 'Electronic'],
    songsLiked: 457
  }
};

// Mock data for recent playlists
const recentPlaylists = [
  { id: '1', name: 'My Favorites', tracks: 45, image: 'https://via.placeholder.com/80' },
  { id: '2', name: 'Workout Mix', tracks: 32, image: 'https://via.placeholder.com/80' },
  { id: '3', name: 'Chill Vibes', tracks: 28, image: 'https://via.placeholder.com/80' },
];

// Mock data for top artists
const topArtists = [
  { id: '1', name: 'Taylor Swift', image: 'https://via.placeholder.com/64' },
  { id: '2', name: 'The Weeknd', image: 'https://via.placeholder.com/64' },
  { id: '3', name: 'Dua Lipa', image: 'https://via.placeholder.com/64' },
  { id: '4', name: 'Post Malone', image: 'https://via.placeholder.com/64' },
];

const ProfileScreen: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();

  // Render a playlist item
  const renderPlaylistItem = ({ item }: { item: typeof recentPlaylists[0] }) => (
    <TouchableOpacity style={styles.playlistItem}>
      <Image source={{ uri: item.image }} style={styles.playlistImage} />
      <View style={styles.playlistInfo}>
        <Text style={[styles.playlistName, { color: theme.colors.text.primary }]}>
          {item.name}
        </Text>
        <Text style={[styles.playlistTracks, { color: theme.colors.text.secondary }]}>
          {item.tracks} tracks
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
    </TouchableOpacity>
  );

  // Render an artist item
  const renderArtistItem = ({ item }: { item: typeof topArtists[0] }) => (
    <TouchableOpacity style={styles.artistItem}>
      <Image source={{ uri: item.image }} style={styles.artistImage} />
      <Text 
        style={[styles.artistName, { color: theme.colors.text.primary }]}
        numberOfLines={1}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Render a stat item
  const renderStatItem = (
    icon: React.ReactNode, 
    title: string, 
    value: string | number
  ) => (
    <View style={styles.statItem}>
      <View style={[styles.statIconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
        {icon}
      </View>
      <View>
        <Text style={[styles.statTitle, { color: theme.colors.text.secondary }]}>
          {title}
        </Text>
        <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
          {value}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.headerActions}>
            <View style={{ width: 40 }} /> {/* Placeholder for balance */}
            <TouchableOpacity 
              style={[styles.settingsButton, { backgroundColor: theme.colors.card }]}
              onPress={() => {
                // @ts-ignore - StackNavigator tipi tanımlı olmadığı için
                navigation.navigate('Settings');
              }}
            >
              <Ionicons name="settings" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
            <View style={styles.profileTextContainer}>
              <Text style={[styles.username, { color: theme.colors.text.primary }]}>
                {userProfile.username}
              </Text>
              <Text style={[styles.fullName, { color: theme.colors.text.secondary }]}>
                {userProfile.fullName}
              </Text>
              <Text style={[styles.bio, { color: theme.colors.text.secondary }]}>
                {userProfile.bio}
              </Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statColumn}>
              <Text style={[styles.statCount, { color: theme.colors.text.primary }]}>
                {userProfile.followers}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                Followers
              </Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={[styles.statCount, { color: theme.colors.text.primary }]}>
                {userProfile.following}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                Following
              </Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={[styles.statCount, { color: theme.colors.text.primary }]}>
                {userProfile.playlists}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                Playlists
              </Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.actionButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
              ]}
            >
              <Text style={[
                styles.actionButtonText, 
                { color: theme.colors.text.primary }
              ]}>
                Share Profile
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Music Stats */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Your Music Stats
          </Text>
          <View style={styles.statsGrid}>
            {renderStatItem(
              <MaterialIcons name="headset" size={20} color={theme.colors.primary} />,
              'Minutes Listened',
              `${Math.floor(userProfile.stats.minutesListened / 60)}h ${userProfile.stats.minutesListened % 60}m`
            )}
            {renderStatItem(
              <MaterialIcons name="favorite" size={20} color={theme.colors.primary} />,
              'Songs Liked',
              userProfile.stats.songsLiked
            )}
            {renderStatItem(
              <MaterialCommunityIcons name="playlist-music" size={20} color={theme.colors.primary} />,
              'Your Playlists',
              userProfile.playlists
            )}
          </View>

          <Text style={[styles.subsectionTitle, { color: theme.colors.text.primary }]}>
            Top Genres
          </Text>
          <View style={styles.genresContainer}>
            {userProfile.stats.topGenres.map((genre, index) => (
              <View 
                key={index} 
                style={[
                  styles.genreTag, 
                  { 
                    backgroundColor: `${theme.colors.primary}${15 + index * 10}`,
                    borderColor: theme.colors.primary,
                  }
                ]}
              >
                <Text 
                  style={[
                    styles.genreText, 
                    { color: index > 1 ? 'white' : theme.colors.primary }
                  ]}
                >
                  {genre}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Top Artists */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Top Artists
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={topArtists}
            renderItem={renderArtistItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.artistsList}
          />
        </Card>

        {/* Your Playlists */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Your Playlists
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          {recentPlaylists.map((playlist) => (
            <React.Fragment key={playlist.id}>
              {renderPlaylistItem({ item: playlist })}
              {playlist.id !== recentPlaylists[recentPlaylists.length - 1].id && (
                <View 
                  style={[styles.divider, { backgroundColor: theme.colors.divider }]} 
                />
              )}
            </React.Fragment>
          ))}
          <TouchableOpacity 
            style={[styles.createPlaylistButton, { backgroundColor: theme.colors.card }]}
          >
            <Ionicons name="add" size={24} color={theme.colors.primary} />
            <Text style={[styles.createPlaylistText, { color: theme.colors.primary }]}>
              Create New Playlist
            </Text>
          </TouchableOpacity>
        </Card>
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
    paddingBottom: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.lg,
    padding: spacing.base,
  },
  profileInfo: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eee',
  },
  profileTextContainer: {
    flex: 1,
    marginLeft: spacing.base,
    justifyContent: 'center',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  fullName: {
    fontSize: 14,
    marginTop: 2,
  },
  bio: {
    fontSize: 14,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  statColumn: {
    alignItems: 'center',
  },
  statCount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  sectionCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.lg,
    padding: spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: spacing.base,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  statTitle: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  genreTag: {
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  genreText: {
    fontSize: 13,
    fontWeight: '500',
  },
  artistsList: {
    paddingTop: spacing.xs,
  },
  artistItem: {
    alignItems: 'center',
    marginRight: spacing.lg,
    width: 80,
  },
  artistImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eee',
    marginBottom: spacing.xs,
  },
  artistName: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    width: 80,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
  },
  playlistImage: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#eee',
  },
  playlistInfo: {
    flex: 1,
    marginLeft: spacing.base,
  },
  playlistName: {
    fontSize: 15,
    fontWeight: '500',
  },
  playlistTracks: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
  },
  createPlaylistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.base,
    borderRadius: borderRadius.md,
    marginTop: spacing.base,
  },
  createPlaylistText: {
    marginLeft: spacing.xs,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ProfileScreen;
