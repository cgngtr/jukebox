import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../../context/PlayerContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';

const MiniPlayer: React.FC = () => {
  const { playerState, pause, resume } = usePlayer();
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  // If there's no current track, don't render the mini player
  if (!playerState.currentTrack) {
    return null;
  }

  const { currentTrack, isPlaying } = playerState;
  
  // Navigate to full player screen when the mini player is pressed
  const handleMiniPlayerPress = () => {
    // Navigate to the full Player screen
    navigation.navigate('Player');
  };

  // Handle play/pause button press
  const handlePlayPausePress = (e: any) => {
    e.stopPropagation(); // Prevent the mini player press event from firing
    isPlaying ? pause() : resume();
  };

  return (
    <Pressable
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.background,
          borderTopWidth: isDarkMode ? 0 : StyleSheet.hairlineWidth,
          borderTopColor: isDarkMode ? 'transparent' : theme.colors.divider,
          ...(Platform.OS === 'ios' ? {
            shadowColor: isDarkMode ? 'transparent' : theme.colors.divider,
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
          } : {
            elevation: isDarkMode ? 0 : 5,
          }),
        }
      ]}
      onPress={handleMiniPlayerPress}
    >
      {/* Album artwork */}
      <Image 
        source={{ 
          uri: currentTrack?.album?.images?.[0]?.url || 'https://via.placeholder.com/40' 
        }} 
        style={styles.artwork} 
      />
      
      {/* Track info */}
      <View style={styles.infoContainer}>
        <Text 
          style={[styles.trackTitle, { color: theme.colors.text.primary }]}
          numberOfLines={1}
        >
          {currentTrack?.name}
        </Text>
        <Text 
          style={[styles.artistName, { color: theme.colors.text.secondary }]}
          numberOfLines={1}
        >
          {currentTrack?.artists?.[0]?.name}
        </Text>
      </View>
      
      {/* Play/Pause button */}
      <TouchableOpacity 
        onPress={handlePlayPausePress}
        style={styles.playPauseButton}
      >
        <Ionicons 
          name={isPlaying ? 'pause' : 'play'} 
          size={24} 
          color={theme.colors.primary} 
        />
      </TouchableOpacity>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  artistName: {
    fontSize: 12,
    marginTop: 2,
  },
  playPauseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default MiniPlayer; 