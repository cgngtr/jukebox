import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { SpotifyTrack } from '../services/musicApi';
import { music } from '../api';

// Player durumu için tip tanımlaması
interface PlayerState {
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  queue: SpotifyTrack[];
  volume: number;
  progress: number;
  duration: number;
  isShuffled: boolean;
  repeatMode: 'off' | 'track' | 'context';
}

// Player context tip tanımlaması
interface PlayerContextType {
  playerState: PlayerState;
  play: (track?: SpotifyTrack, trackList?: SpotifyTrack[]) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seek: (position: number) => Promise<void>;
  toggleShuffle: () => Promise<void>;
  setRepeatMode: (mode: 'off' | 'track' | 'context') => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  addToQueue: (track: SpotifyTrack) => Promise<void>;
  clearQueue: () => void;
}

// Varsayılan player durumu
const defaultPlayerState: PlayerState = {
  isPlaying: false,
  currentTrack: null,
  queue: [],
  volume: 1.0,
  progress: 0,
  duration: 0,
  isShuffled: false,
  repeatMode: 'off',
};

// Varsayılan değerlerle context oluştur
const PlayerContext = createContext<PlayerContextType>({
  playerState: defaultPlayerState,
  play: async () => {},
  pause: async () => {},
  resume: async () => {},
  next: async () => {},
  previous: async () => {},
  seek: async () => {},
  toggleShuffle: async () => {},
  setRepeatMode: async () => {},
  setVolume: async () => {},
  addToQueue: async () => {},
  clearQueue: () => {},
});

// Player context'ini kullanmak için hook
export const usePlayer = () => useContext(PlayerContext);

// Player Provider props
interface PlayerProviderProps {
  children: ReactNode;
}

// Player Provider bileşeni
export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [playerState, setPlayerState] = useState<PlayerState>(defaultPlayerState);
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);

  // İlerleme saat aralığını ayarla/temizle
  useEffect(() => {
    if (playerState.isPlaying) {
      const interval = setInterval(() => {
        setPlayerState((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 1000, prev.duration),
        }));
      }, 1000);

      setProgressInterval(interval);
    } else if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [playerState.isPlaying, progressInterval]);

  // Parça bittiğinde sonraki parçaya geç
  useEffect(() => {
    if (
      playerState.progress >= playerState.duration &&
      playerState.duration > 0
    ) {
      if (playerState.repeatMode === 'track') {
        // Parça tekrarla
        setPlayerState((prev) => ({
          ...prev,
          progress: 0,
        }));
      } else {
        // Sonraki parçaya geç
        next();
      }
    }
  }, [playerState.progress, playerState.duration, playerState.repeatMode]);

  // Parçayı çal
  const play = async (track?: SpotifyTrack, trackList?: SpotifyTrack[]) => {
    if (!isAuthenticated) {
      console.error('User not authenticated');
      return;
    }

    try {
      // Yeni parça gelmişse onu çal, yoksa queue'daki ilk parçayı
      const trackToPlay = track || playerState.queue[0] || null;

      if (!trackToPlay) {
        console.error('No track to play');
        return;
      }

      // Parçayı çal (gerçek impl. için Spotify API veya React Native Sound kullanılabilir)
      console.log('Playing track:', trackToPlay.name);

      // Player durumunu güncelle
      setPlayerState((prev) => ({
        ...prev,
        isPlaying: true,
        currentTrack: trackToPlay,
        queue: trackList ? [...trackList] : track ? [track, ...prev.queue] : prev.queue,
        progress: 0,
        duration: trackToPlay.duration_ms,
      }));
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  // Çalmayı duraklat
  const pause = async () => {
    if (!isAuthenticated || !playerState.isPlaying) {
      return;
    }

    try {
      // Çalmayı duraklat (gerçek impl. için Spotify API veya React Native Sound kullanılabilir)
      console.log('Pausing playback');

      // Player durumunu güncelle
      setPlayerState((prev) => ({
        ...prev,
        isPlaying: false,
      }));
    } catch (error) {
      console.error('Error pausing playback:', error);
    }
  };

  // Çalmayı devam ettir
  const resume = async () => {
    if (!isAuthenticated || playerState.isPlaying || !playerState.currentTrack) {
      return;
    }

    try {
      // Çalmayı devam ettir (gerçek impl. için Spotify API veya React Native Sound kullanılabilir)
      console.log('Resuming playback');

      // Player durumunu güncelle
      setPlayerState((prev) => ({
        ...prev,
        isPlaying: true,
      }));
    } catch (error) {
      console.error('Error resuming playback:', error);
    }
  };

  // Sonraki parçaya geç
  const next = async () => {
    if (!isAuthenticated || playerState.queue.length === 0) {
      return;
    }

    try {
      // Queue'dan sonraki parçayı al
      const nextTrack = playerState.queue[0];

      // Player durumunu güncelle
      setPlayerState((prev) => ({
        ...prev,
        isPlaying: true,
        currentTrack: nextTrack,
        queue: prev.queue.slice(1), // İlk parçayı çıkar
        progress: 0,
        duration: nextTrack.duration_ms,
      }));
    } catch (error) {
      console.error('Error playing next track:', error);
    }
  };

  // Önceki parçaya dön
  const previous = async () => {
    if (!isAuthenticated || !playerState.currentTrack) {
      return;
    }

    try {
      // Eğer parça 3 saniyeden daha uzun süre çalındıysa, parçayı baştan başlat
      if (playerState.progress > 3000) {
        setPlayerState((prev) => ({
          ...prev,
          progress: 0,
        }));
        return;
      }

      // Önceki parça varsa (gerçek uyg.da history tutulur)
      console.log('Playing previous track');

      // Demo amaçlı basit bir önceki parça mantığı
      if (playerState.currentTrack) {
        setPlayerState((prev) => ({
          ...prev,
          progress: 0,
        }));
      }
    } catch (error) {
      console.error('Error playing previous track:', error);
    }
  };

  // Belirli bir konuma git
  const seek = async (position: number) => {
    if (!isAuthenticated || !playerState.currentTrack) {
      return;
    }

    try {
      // Belirli bir konuma git (gerçek impl. için Spotify API veya React Native Sound kullanılabilir)
      console.log('Seeking to position:', position);

      // Player durumunu güncelle
      setPlayerState((prev) => ({
        ...prev,
        progress: Math.min(Math.max(position, 0), prev.duration),
      }));
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  // Karıştırmayı aç/kapat
  const toggleShuffle = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      // Rastgele çalmayı aç/kapat (gerçek impl. için Spotify API kullanılabilir)
      const newShuffleState = !playerState.isShuffled;
      console.log('Setting shuffle to:', newShuffleState);

      // Player durumunu güncelle
      setPlayerState((prev) => ({
        ...prev,
        isShuffled: newShuffleState,
        // Karıştırma açıldıysa çalma listesini karıştır
        queue: newShuffleState
          ? [...prev.queue].sort(() => Math.random() - 0.5)
          : [...prev.queue], // Basit karıştırma
      }));
    } catch (error) {
      console.error('Error toggling shuffle:', error);
    }
  };

  // Tekrarlama modunu ayarla
  const setRepeatMode = async (mode: 'off' | 'track' | 'context') => {
    if (!isAuthenticated) {
      return;
    }

    try {
      // Tekrarlama modunu ayarla (gerçek impl. için Spotify API kullanılabilir)
      console.log('Setting repeat mode to:', mode);

      // Player durumunu güncelle
      setPlayerState((prev) => ({
        ...prev,
        repeatMode: mode,
      }));
    } catch (error) {
      console.error('Error setting repeat mode:', error);
    }
  };

  // Ses seviyesini ayarla
  const setVolume = async (volume: number) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      // Ses seviyesini ayarla (gerçek impl. için Spotify API veya React Native Sound kullanılabilir)
      const normalizedVolume = Math.min(Math.max(volume, 0), 1);
      console.log('Setting volume to:', normalizedVolume);

      // Player durumunu güncelle
      setPlayerState((prev) => ({
        ...prev,
        volume: normalizedVolume,
      }));
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  // Kuyruğa parça ekle
  const addToQueue = async (track: SpotifyTrack) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      // Kuyruğa parça ekle
      console.log('Adding track to queue:', track.name);

      // Player durumunu güncelle
      setPlayerState((prev) => ({
        ...prev,
        queue: [...prev.queue, track],
      }));
    } catch (error) {
      console.error('Error adding track to queue:', error);
    }
  };

  // Kuyruğu temizle
  const clearQueue = () => {
    setPlayerState((prev) => ({
      ...prev,
      queue: [],
    }));
  };

  // Context değerini memoize et
  const contextValue = React.useMemo(
    () => ({
      playerState,
      play,
      pause,
      resume,
      next,
      previous,
      seek,
      toggleShuffle,
      setRepeatMode,
      setVolume,
      addToQueue,
      clearQueue,
    }),
    [playerState]
  );

  return <PlayerContext.Provider value={contextValue}>{children}</PlayerContext.Provider>;
};

export default PlayerContext;
