import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { usePlayer } from '../../context/PlayerContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, layout, borderRadius } from '../../styles';
import { Ionicons } from '@expo/vector-icons';

// Mini player komponenti
export const MiniPlayer: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { playerState, play, pause, resume, next, previous } = usePlayer();
  const { isPlaying, currentTrack, progress, duration } = playerState;

  // Oynatıcı görünür değilse gösterme
  if (!currentTrack) {
    return null;
  }

  // Parça bilgilerini formatlama
  const formatArtists = () => {
    return currentTrack.artists.map(artist => artist.name).join(', ');
  };

  // İlerleme yüzdesi hesapla
  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <View 
      style={[
        styles.container,
        { 
          backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderTopColor: theme.colors.divider
        }
      ]}
    >
      {/* İlerleme çubuğu */}
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${progressPercentage}%`,
              backgroundColor: theme.colors.primary
            }
          ]} 
        />
      </View>

      <View style={styles.content}>
        {/* Parça bilgileri */}
        <View style={styles.trackInfoContainer}>
          {currentTrack.album?.images?.[0]?.url ? (
            <Image 
              source={{ uri: currentTrack.album.images[0].url }} 
              style={styles.albumArt} 
            />
          ) : (
            <View style={[styles.albumArt, { backgroundColor: theme.colors.card }]} />
          )}
          
          <View style={styles.textContainer}>
            <Text 
              style={[styles.trackTitle, { color: theme.colors.text.primary }]}
              numberOfLines={1}
            >
              {currentTrack.name}
            </Text>
            <Text 
              style={[styles.artistName, { color: theme.colors.text.secondary }]}
              numberOfLines={1}
            >
              {formatArtists()}
            </Text>
          </View>
        </View>

        {/* Oynatma kontrolleri */}
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={previous}
          >
            <Ionicons name="play-skip-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.playButton, { backgroundColor: theme.colors.primary }]} 
            onPress={() => isPlaying ? pause() : resume()}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={24} 
              color="white" 
              style={isPlaying ? {} : { marginLeft: 2 }} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={next}
          >
            <Ionicons name="play-skip-forward" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: layout.tabBarHeight,
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  progressBarContainer: {
    height: 2,
    width: '100%',
    backgroundColor: 'transparent',
  },
  progressBar: {
    height: 2,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  trackInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  albumArt: {
    width: 48,
    height: 48,
    borderRadius: 4,
  },
  textContainer: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  artistName: {
    fontSize: 12,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: spacing.xs,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
});

// Default export
export default MiniPlayer; 