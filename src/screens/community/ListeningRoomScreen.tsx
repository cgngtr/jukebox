import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  SectionList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius } from '../../styles';
import { Card, Button } from '../../components';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Mock user type
interface User {
  id: string;
  name: string;
  avatar: string;
}

// Mock message type
interface Message {
  id: string;
  user: User;
  text: string;
  timestamp: Date;
}

// Mock track type
interface Track {
  id: string;
  title: string;
  artist: string;
  color: string;
  duration: number;
}

// ListeningRoomScreen component
const ListeningRoomScreen: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const roomId = (route.params as any)?.id;
  
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [room, setRoom] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');

  // Load room data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Find room data based on route param id
      const mockRoom = {
        id: roomId || '1',
        name: 'Chill Vibes Only',
        host: 'DJ Smooth',
        genre: 'Lo-Fi',
        description: 'Relaxing beats to study and chill to. Join us for a calm listening session.',
        listeners: 42,
        isLive: true,
        color: '#4A90E2' // Blue
      };
      
      // Mock users in room
      const mockUsers = [
        { id: '1', name: 'DJ Smooth', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
        { id: '2', name: 'ChillWave', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
        { id: '3', name: 'BeatMaster', avatar: 'https://randomuser.me/api/portraits/men/68.jpg' },
        { id: '4', name: 'MusicLover', avatar: 'https://randomuser.me/api/portraits/women/65.jpg' },
        { id: '5', name: 'RelaxedMind', avatar: 'https://randomuser.me/api/portraits/men/75.jpg' },
      ];
      
      // Mock chat messages
      const mockMessages = [
        { id: '1', user: mockUsers[1], text: 'This track is amazing!', timestamp: new Date(Date.now() - 60000 * 5) },
        { id: '2', user: mockUsers[2], text: 'Agreed, perfect for studying.', timestamp: new Date(Date.now() - 60000 * 4) },
        { id: '3', user: mockUsers[0], text: 'Next up is a personal favorite.', timestamp: new Date(Date.now() - 60000 * 2) },
        { id: '4', user: mockUsers[3], text: 'Can\'t wait!', timestamp: new Date(Date.now() - 60000) },
      ];
      
      // Mock music queue
      const mockQueue = [
        { id: '1', title: 'Morning Coffee', artist: 'Chillhop Music', color: '#58b19f', duration: 237000 },
        { id: '2', title: 'Skyline', artist: 'Aiguille', color: '#9b59b6', duration: 198000 },
        { id: '3', title: 'Reflection', artist: 'Sworn', color: '#f9ca24', duration: 214000 },
      ];
      
      // Mock current track
      const mockCurrentTrack = {
        id: '0', 
        title: 'Canary Forest', 
        artist: 'Aso, Middle School, Aviino', 
        color: '#45aaf2',
        duration: 242000
      };
      
      setRoom(mockRoom);
      setUsers(mockUsers);
      setMessages(mockMessages);
      setQueue(mockQueue);
      setCurrentTrack(mockCurrentTrack);
      setIsLoading(false);
    }, 1500);
  }, [roomId]);

  // Format timestamp for chat
  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format track duration
  const formatDuration = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle sending message
  const handleSendMessage = () => {
    if (message.trim() === '') return;
    
    // Add new message to chat
    const newMessage = {
      id: Date.now().toString(),
      user: { id: 'me', name: 'You', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
      text: message,
      timestamp: new Date()
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
  };

  // Render user avatar
  const renderUserAvatar = ({ item }: { item: User }) => (
    <View style={styles.avatarContainer}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <Text style={[styles.avatarName, { color: theme.colors.text.secondary }]} numberOfLines={1}>
        {item.name.split(' ')[0]}
      </Text>
    </View>
  );

  // Render chat message
  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageContainer}>
      <Image source={{ uri: item.user.avatar }} style={styles.messageAvatar} />
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={[styles.messageSender, { color: theme.colors.text.primary }]}>
            {item.user.name}
          </Text>
          <Text style={[styles.messageTime, { color: theme.colors.text.secondary }]}>
            {formatMessageTime(item.timestamp)}
          </Text>
        </View>
        <Text style={[styles.messageText, { color: theme.colors.text.primary }]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  // Render queue item
  const renderQueueItem = ({ item, index }: { item: Track, index: number }) => (
    <View style={[styles.queueItem, index === 0 && styles.nextInQueue]}>
      <View style={[styles.queueItemCoverContainer, {backgroundColor: item.color}]}>
        <Ionicons name="musical-note" size={20} color="rgba(255,255,255,0.8)" />
      </View>
      <View style={styles.queueItemInfo}>
        <Text style={[styles.queueItemTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.queueItemArtist, { color: theme.colors.text.secondary }]} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
      <Text style={[styles.queueItemDuration, { color: theme.colors.text.secondary }]}>
        {formatDuration(item.duration)}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
          Joining room...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Room Header */}
      <View style={styles.roomHeader}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.roomTitleContainer}>
          <Text style={[styles.roomTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
            {room.name}
          </Text>
          <Text style={[styles.roomHost, { color: theme.colors.text.secondary }]}>
            Hosted by {room.host}
          </Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Now Playing Section */}
      <View style={[styles.nowPlayingContainer, { backgroundColor: isDarkMode ? theme.colors.card + '80' : theme.colors.card }]}>
        <View style={styles.nowPlayingHeader}>
          <View style={styles.liveIndicator}>
            <View style={[styles.liveDot, { backgroundColor: theme.colors.primary }]} />
            <Text style={[styles.liveText, { color: theme.colors.primary }]}>LIVE</Text>
          </View>
          <Text style={[styles.listenersCount, { color: theme.colors.text.secondary }]}>
            <Ionicons name="headset" size={14} /> {room.listeners} listening
          </Text>
        </View>

        {currentTrack && (
          <View style={styles.playerContainer}>
            <View style={[styles.albumCoverContainer, {backgroundColor: currentTrack.color}]}>
              <Ionicons name="musical-notes" size={36} color="rgba(255,255,255,0.8)" />
            </View>
            <View style={styles.trackInfoContainer}>
              <Text style={[styles.trackTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              <Text style={[styles.artistName, { color: theme.colors.text.secondary }]} numberOfLines={1}>
                {currentTrack.artist}
              </Text>
              <View style={styles.playerControls}>
                <TouchableOpacity style={styles.controlButton}>
                  <Ionicons name="play-skip-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.playPauseButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => setIsPlaying(!isPlaying)}
                >
                  <Ionicons 
                    name={isPlaying ? "pause" : "play"} 
                    size={28} 
                    color="white" 
                    style={isPlaying ? {} : { marginLeft: 2 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton}>
                  <Ionicons name="play-skip-forward" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Tabs Header */}
      <View style={styles.tabHeader}>
        <TouchableOpacity 
          style={styles.tabButton}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[
            styles.tabButtonText, 
            activeTab === 'chat' && styles.activeTab, 
            { color: activeTab === 'chat' ? theme.colors.primary : theme.colors.text.secondary }
          ]}>
            Chat
          </Text>
          {activeTab === 'chat' && (
            <View style={[styles.tabIndicator, { backgroundColor: theme.colors.primary }]} />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabButton}
          onPress={() => setActiveTab('queue')}
        >
          <Text style={[
            styles.tabButtonText, 
            activeTab === 'queue' && styles.activeTab, 
            { color: activeTab === 'queue' ? theme.colors.primary : theme.colors.text.secondary }
          ]}>
            Queue
          </Text>
          {activeTab === 'queue' && (
            <View style={[styles.tabIndicator, { backgroundColor: theme.colors.primary }]} />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabButton}
          onPress={() => setActiveTab('listeners')}
        >
          <Text style={[
            styles.tabButtonText, 
            activeTab === 'listeners' && styles.activeTab, 
            { color: activeTab === 'listeners' ? theme.colors.primary : theme.colors.text.secondary }
          ]}>
            Listeners
          </Text>
          {activeTab === 'listeners' && (
            <View style={[styles.tabIndicator, { backgroundColor: theme.colors.primary }]} />
          )}
        </TouchableOpacity>
      </View>

      {/* Dynamic Content based on active tab */}
      {activeTab === 'chat' && (
        <View style={styles.contentContainer}>
          {/* In this room section */}
          <Text style={[styles.listenersTitle, { color: theme.colors.text.secondary, marginBottom: spacing.xs, paddingHorizontal: spacing.base }]}>
            In this room
          </Text>
          <FlatList
            data={users}
            renderItem={renderUserAvatar}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listenersAvatars}
            style={{marginBottom: spacing.base, paddingLeft: spacing.base}}
          />
          
          {/* Messages */}
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesList}
            style={styles.messagesContainer}
          />
          
          {/* Chat Input */}
          <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? theme.colors.card + '80' : theme.colors.card }]}>
            <TextInput
              style={[styles.input, { color: theme.colors.text.primary, backgroundColor: isDarkMode ? theme.colors.background + '80' : theme.colors.background }]}
              placeholder="Type a message..."
              placeholderTextColor={theme.colors.text.secondary}
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity 
              style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSendMessage}
            >
              <Ionicons name="send" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {activeTab === 'queue' && (
        <FlatList
          data={queue}
          renderItem={renderQueueItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.queueList}
          ListHeaderComponent={() => (
            <Text style={[styles.queueTitle, { color: theme.colors.text.primary, margin: spacing.base }]}>
              Up Next
            </Text>
          )}
          style={{paddingHorizontal: spacing.base}}
        />
      )}
      
      {activeTab === 'listeners' && (
        <FlatList
          data={users}
          renderItem={({ item }) => (
            <View style={styles.listenerItem}>
              <Image source={{ uri: item.avatar }} style={styles.listenerAvatar} />
              <View style={styles.listenerInfo}>
                <Text style={[styles.listenerName, { color: theme.colors.text.primary }]}>
                  {item.name}
                </Text>
                {item.id === '1' && (
                  <View style={styles.hostBadgeContainer}>
                    <Text style={styles.hostBadge}>Host</Text>
                  </View>
                )}
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listenersList}
          ListHeaderComponent={() => (
            <Text style={[styles.listenersFullTitle, { color: theme.colors.text.primary, margin: spacing.base }]}>
              Listeners ({users.length})
            </Text>
          )}
          style={{paddingHorizontal: spacing.base}}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.base,
    fontSize: 16,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: spacing.xs,
  },
  roomTitleContainer: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  roomHost: {
    fontSize: 14,
  },
  menuButton: {
    padding: spacing.xs,
  },
  contentContainer: {
    flex: 1,
  },
  nowPlayingContainer: {
    margin: spacing.base,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  nowPlayingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.base,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  liveText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  listenersCount: {
    fontSize: 14,
  },
  playerContainer: {
    flexDirection: 'row',
    padding: spacing.base,
  },
  albumCover: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
  },
  albumCoverContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfoContainer: {
    flex: 1,
    marginLeft: spacing.base,
    justifyContent: 'center',
  },
  trackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  artistName: {
    fontSize: 16,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  controlButton: {
    padding: spacing.xs,
  },
  playPauseButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.base,
  },
  tabsContainer: {
    flex: 1,
  },
  tabHeader: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTab: {
    fontWeight: 'bold',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 30,
    height: 3,
    borderRadius: 1.5,
  },
  listenersTitle: {
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  listenersAvatars: {
    paddingRight: spacing.base,
  },
  avatarContainer: {
    alignItems: 'center',
    marginRight: spacing.base,
    width: 50,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarName: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  messagesList: {
    paddingBottom: spacing.base,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.base,
    paddingLeft: spacing.xs,
  },
  messageAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  messageContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  messageSender: {
    fontWeight: 'bold',
    marginRight: spacing.xs,
  },
  messageTime: {
    fontSize: 12,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  queueContainer: {
    padding: spacing.base,
  },
  queueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  queueList: {
    paddingBottom: spacing.xxxl,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
    paddingLeft: spacing.xs,
  },
  nextInQueue: {
    opacity: 0.7,
  },
  queueItemCover: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.sm,
  },
  queueItemCoverContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  queueItemInfo: {
    flex: 1,
    marginLeft: spacing.base,
  },
  queueItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  queueItemArtist: {
    fontSize: 14,
  },
  queueItemDuration: {
    fontSize: 14,
    marginLeft: spacing.sm,
  },
  listenersContainer: {
    padding: spacing.base,
  },
  listenersFullTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.base,
  },
  listenerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.xs,
  },
  listenerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  listenerInfo: {
    flex: 1,
    marginLeft: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listenerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  hostBadgeContainer: {
    backgroundColor: '#FFD700',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    marginLeft: spacing.sm,
  },
  hostBadge: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  listenersList: {
    paddingBottom: spacing.xxxl,
  },
});

export default ListeningRoomScreen;
