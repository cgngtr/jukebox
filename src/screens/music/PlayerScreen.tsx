import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  SafeAreaView,
  Animated
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { usePlayer } from '../../context/PlayerContext';
import { formatDuration } from '../../utils/formatters';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const PlayerScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();
  const { playerState, pause, resume, next, previous, seek, toggleShuffle, setRepeatMode } = usePlayer();
  const [sliderValue, setSliderValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const { currentTrack, isPlaying, progress, duration, isShuffled, repeatMode } = playerState;

  // Update the slider value when the progress changes
  useEffect(() => {
    if (!isSeeking && duration > 0) {
      setSliderValue(progress / duration);
    }
  }, [progress, duration, isSeeking]);

  // Go back to the previous screen
  const handleBackPress = () => {
    navigation.goBack();
  };

  // Handle seeking
  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekComplete = (value: number) => {
    setIsSeeking(false);
    const newPosition = value * duration;
    seek(newPosition);
  };

  // Format the current time and total duration
  const formattedCurrentTime = formatDuration(progress);
  const formattedTotalTime = formatDuration(duration);

  // Artists names joined with commas
  const artistNames = currentTrack?.artists?.map(artist => artist.name).join(', ');

  // Background gradient colors based on the album art
  const gradientColors = isDarkMode 
    ? ['#121212', '#000000'] as const
    : ['#f0f0f0', '#e0e0e0'] as const;

  if (!currentTrack) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text.primary }}>No track is currently playing</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="chevron-down" size={28} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Now Playing
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Album Artwork */}
      <View style={styles.artworkContainer}>
        <Image
          source={{ uri: currentTrack?.album?.images?.[0]?.url || 'https://via.placeholder.com/300' }}
          style={styles.artwork}
        />
      </View>

      {/* Track Info */}
      <View style={styles.trackInfoContainer}>
        <Text style={[styles.trackTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
          {currentTrack.name}
        </Text>
        <Text style={[styles.artistName, { color: theme.colors.text.secondary }]} numberOfLines={1}>
          {artistNames}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          value={sliderValue}
          onSlidingStart={handleSeekStart}
          onSlidingComplete={handleSeekComplete}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={`${theme.colors.text.secondary}50`}
          thumbTintColor={theme.colors.primary}
        />
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: theme.colors.text.secondary }]}>
            {formattedCurrentTime}
          </Text>
          <Text style={[styles.timeText, { color: theme.colors.text.secondary }]}>
            {formattedTotalTime}
          </Text>
        </View>
      </View>

      {/* Playback Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={() => toggleShuffle()}>
          <Ionicons 
            name="shuffle" 
            size={22} 
            color={isShuffled ? theme.colors.primary : theme.colors.text.secondary} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={() => previous()}>
          <Ionicons name="play-skip-back" size={28} color={theme.colors.text.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.playPauseButton, { backgroundColor: theme.colors.primary }]} 
          onPress={() => isPlaying ? pause() : resume()}
        >
          <Ionicons 
            name={isPlaying ? 'pause' : 'play'} 
            size={28} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={() => next()}>
          <Ionicons name="play-skip-forward" size={28} color={theme.colors.text.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => {
            const modes = ['off', 'track', 'context'] as const;
            const currentIndex = modes.indexOf(repeatMode);
            const nextMode = modes[(currentIndex + 1) % modes.length];
            setRepeatMode(nextMode);
          }}
        >
          {repeatMode === 'track' ? (
            <MaterialIcons name="repeat-one" size={22} color={theme.colors.primary} />
          ) : (
            <Ionicons 
              name="repeat" 
              size={22} 
              color={repeatMode !== 'off' ? theme.colors.primary : theme.colors.text.secondary} 
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Additional Options */}
      <View style={styles.additionalOptionsContainer}>
        <TouchableOpacity style={styles.optionButton}>
          <Ionicons name="heart-outline" size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.optionButton}>
          <Ionicons name="share-outline" size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.optionButton}>
          <MaterialIcons name="playlist-add" size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  artworkContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  artwork: {
    width: width - 80,
    height: width - 80,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
  trackInfoContainer: {
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  artistName: {
    fontSize: 18,
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  timeText: {
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  controlButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  additionalOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  optionButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
});

export default PlayerScreen; 