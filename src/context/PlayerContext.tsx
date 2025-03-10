import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { SpotifyTrack, SpotifyCurrentlyPlaying, SpotifyDevice } from '../services/musicApi';
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
  deviceId: string | null;
  mode: 'browse' | 'play';  // Yeni mod özelliği
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
  deviceId: null,
  mode: 'browse'  // Varsayılan olarak browse modunda başla
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
  const { isAuthenticated, getToken } = useAuth();
  const [playerState, setPlayerState] = useState<PlayerState>(defaultPlayerState);
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Mode değişikliğini takip et
  useEffect(() => {
    if (isAuthenticated) {
      checkDeviceAvailability();
    } else {
      setPlayerState(prev => ({ ...prev, mode: 'browse' }));
    }
  }, [isAuthenticated]);

  // Cihaz durumunu kontrol et
  const checkDeviceAvailability = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setPlayerState(prev => ({ ...prev, mode: 'browse' }));
        return;
      }

      const devices = await music.getAvailableDevices(token);
      const hasDevices = devices.devices.length > 0;
      
      setPlayerState(prev => ({
        ...prev,
        mode: hasDevices ? 'play' : 'browse'
      }));
    } catch (error) {
      console.error('Error checking device availability:', error);
      setPlayerState(prev => ({ ...prev, mode: 'browse' }));
    }
  };

  // Mevcut çalan şarkı bilgisini almak için polling
  const pollPlaybackState = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const token = await getToken();
      if (!token) return;
      
      try {
        // Mevcut çalan şarkıyı al
        const currentlyPlaying = await music.getCurrentlyPlaying(token);
        
        if (currentlyPlaying && currentlyPlaying.item) {
          setPlayerState(prev => ({
            ...prev,
            isPlaying: currentlyPlaying.is_playing,
            currentTrack: currentlyPlaying.item,
            progress: currentlyPlaying.progress_ms || 0,
            duration: currentlyPlaying.item?.duration_ms || 0,
          }));
        }
      } catch (currentlyPlayingError) {
        console.error('Error fetching currently playing:', currentlyPlayingError);
        // Hata durumunda sessizce devam et
      }
      
      try {
        // Oynatıcı durumunu al
        const playerData = await music.getPlayerState(token);
        
        if (playerData) {
          setPlayerState(prev => ({
            ...prev,
            isShuffled: playerData.shuffle_state,
            repeatMode: playerData.repeat_state,
            deviceId: playerData.device?.id || null,
            volume: playerData.device?.volume_percent ? playerData.device.volume_percent / 100 : prev.volume,
          }));
        }
      } catch (playerStateError) {
        console.error('Error fetching player state:', playerStateError);
        // Hata durumunda sessizce devam et
      }
    } catch (error) {
      console.error('Error polling playback state:', error);
    }
  }, [isAuthenticated, getToken]);
  
  // Cihaz kontrolü için yeni fonksiyonlar
  const ensureActiveDevice = async (token: string): Promise<string | null> => {
    try {
      // Mevcut cihazları kontrol et
      const devices = await music.getAvailableDevices(token);
      console.log('Available devices:', devices.devices);
      
      // Hiç cihaz yoksa kullanıcıya yönlendirici mesaj göster
      if (devices.devices.length === 0) {
        alert(
          'Spotify cihazı bulunamadı!\n\n' +
          'Lütfen şu adımları takip edin:\n' +
          '1. Spotify uygulamasını açın\n' +
          '2. Herhangi bir şarkıyı çalmaya başlatın\n' +
          '3. Şarkıyı durdurun (opsiyonel)\n' +
          '4. Tekrar uygulamamızdan şarkı çalmayı deneyin'
        );
        return null;
      }
      
      // Aktif cihaz var mı kontrol et
      const activeDevice = devices.devices.find(device => device.is_active);
      
      if (activeDevice) {
        console.log('Found active device:', activeDevice.name);
        return activeDevice.id;
      }
      
      // Aktif cihaz yoksa ilk cihazı aktifleştir
      const deviceToActivate = devices.devices[0];
      console.log('Activating device:', deviceToActivate.name);
      
      try {
        await music.transferPlayback(token, deviceToActivate.id, true);
        console.log('Device activated successfully');
        
        // Cihazın aktifleşmesi için kısa bir süre bekle
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return deviceToActivate.id;
      } catch (err) {
        console.error('Error activating device:', err);
        alert(
          'Cihaz aktifleştirilemedi!\n\n' +
          'Lütfen şu adımları takip edin:\n' +
          '1. Spotify uygulamasında bir şarkı çalın\n' +
          '2. Şarkıyı durdurun\n' +
          '3. Tekrar uygulamamızdan şarkı çalmayı deneyin'
        );
        return null;
      }
    } catch (error) {
      console.error('Error ensuring active device:', error);
      if (error instanceof Error) {
        if (error.message.includes('PREMIUM_REQUIRED')) {
          alert('Bu özellik için Spotify Premium aboneliği gereklidir.');
        } else {
          alert(
            'Spotify bağlantısında bir sorun oluştu.\n\n' +
            'Lütfen şu adımları takip edin:\n' +
            '1. Spotify uygulamasını açın\n' +
            '2. Bir şarkı çalın\n' +
            '3. Tekrar deneyin'
          );
        }
      }
      return null;
    }
  };
  
  // Play fonksiyonunu güncelle
  const play = useCallback(async (track?: SpotifyTrack, trackList?: SpotifyTrack[]) => {
    if (playerState.mode === 'browse') {
      alert(
        'Müzik çalma özelliğini kullanmak için:\n\n' +
        '1. Spotify uygulamasını açın\n' +
        '2. Bir şarkı çalın (ve duraklatın)\n' +
        '3. Tekrar deneyin\n\n' +
        'Not: Bu özellik için Spotify Premium gereklidir.'
      );
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        console.error('No token available');
        return;
      }
      
      // Aktif cihaz olduğundan emin ol
      const deviceId = await ensureActiveDevice(token);
      
      if (!deviceId) {
        console.error('No active device available');
        alert('Lütfen Spotify uygulamasını açın ve bir cihazı aktif hale getirin.');
        return;
      }
      
      // Yeni parça gelmişse onu çal, yoksa queue'daki ilk parçayı
      const trackToPlay = track || playerState.queue[0] || null;
      
      if (!trackToPlay) {
        console.error('No track to play');
        return;
      }
      
      // Spotify API ile çal
      await music.playTrack(token, trackToPlay.uri, deviceId);
      
      console.log('Playing track:', trackToPlay.name);
      
      // Player durumunu güncelle
      setPlayerState(prev => ({
        ...prev,
        isPlaying: true,
        currentTrack: trackToPlay,
        deviceId,
        queue: trackList ? [...trackList] : prev.queue
      }));
      
    } catch (error) {
      console.error('Error playing track:', error);
      if (error instanceof Error) {
        const errorMessage = error.message;
        if (errorMessage.includes('NO_ACTIVE_DEVICE')) {
          alert('Lütfen Spotify uygulamasını açın ve bir cihazı aktif hale getirin.');
        } else if (errorMessage.includes('PREMIUM_REQUIRED')) {
          setPlayerState(prev => ({ ...prev, mode: 'browse' }));
          alert('Bu özellik için Spotify Premium aboneliği gereklidir.');
        } else {
          alert('Şarkı çalınırken bir hata oluştu. Lütfen tekrar deneyin.');
        }
      }
    }
  }, [playerState.mode, getToken, playerState.queue]);

  // Çalmayı duraklat
  const pause = async () => {
    if (!playerState.isPlaying) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;
      
      // Spotify API ile duraklat
      await music.pausePlayback(token, playerState.deviceId || undefined);

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
    if (playerState.isPlaying || !playerState.currentTrack) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;
      
      // Aktif cihaz kontrolü yap
      const hasActiveDevice = await ensureActiveDevice(token);
      if (!hasActiveDevice) {
        console.error('No active device available');
        alert('Lütfen Spotify uygulamasını açın ve bir cihazınızda aktif hale getirin.');
        return;
      }
      
      // Spotify API ile devam ettir
      await music.resumePlayback(token, playerState.deviceId || undefined);

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
    try {
      const token = await getToken();
      if (!token) return;
      
      // Spotify API ile sonraki parçaya geç
      await music.skipToNext(token, playerState.deviceId || undefined);
      
      // Durumu güncelle
      pollPlaybackState();
    } catch (error) {
      console.error('Error playing next track:', error);
    }
  };

  // Önceki parçaya dön
  const previous = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      
      // Eğer parça 3 saniyeden daha uzun süre çalındıysa, parçayı baştan başlat
      if (playerState.progress > 3000) {
        await music.seekToPosition(token, 0, playerState.deviceId || undefined);
        
        setPlayerState((prev) => ({
          ...prev,
          progress: 0,
        }));
        return;
      }
      
      // Spotify API ile önceki parçaya geç
      await music.skipToPrevious(token, playerState.deviceId || undefined);
      
      // Durumu güncelle
      pollPlaybackState();
    } catch (error) {
      console.error('Error playing previous track:', error);
    }
  };

  // Belirli bir konuma git
  const seek = async (position: number) => {
    if (!playerState.currentTrack) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;
      
      // Spotify API ile pozisyona git
      await music.seekToPosition(token, position, playerState.deviceId || undefined);
      
      // Player durumunu güncelle
      setPlayerState((prev) => ({
        ...prev,
        progress: position,
      }));
    } catch (error) {
      console.error('Error seeking to position:', error);
    }
  };

  // Şarkı sırasını karıştır/normal sıraya getir
  const toggleShuffle = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const newShuffleState = !playerState.isShuffled;
      
      // Spotify API ile karıştırma durumunu değiştir
      await music.setShuffleMode(token, newShuffleState, playerState.deviceId || undefined);
      
      // Player durumunu güncelle
      setPlayerState((prev) => ({
        ...prev,
        isShuffled: newShuffleState,
      }));
    } catch (error) {
      console.error('Error toggling shuffle mode:', error);
    }
  };

  // Tekrarlama modunu değiştir
  const setRepeatMode = async (mode: 'off' | 'track' | 'context') => {
    try {
      const token = await getToken();
      if (!token) return;
      
      // Spotify API ile tekrarlama modunu değiştir
      await music.setRepeatMode(token, mode, playerState.deviceId || undefined);
      
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
    try {
      const token = await getToken();
      if (!token) return;
      
      // Spotify API ile ses seviyesini ayarla (0-100 arası)
      const volumePercent = Math.round(volume * 100);
      await music.setVolume(token, volumePercent, playerState.deviceId || undefined);
      
      // Player durumunu güncelle
      setPlayerState((prev) => ({
        ...prev,
        volume,
      }));
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  // Sıraya şarkı ekle
  const addToQueue = async (track: SpotifyTrack) => {
    try {
      // Player durumunu güncelle
      setPlayerState((prev) => ({
        ...prev,
        queue: [...prev.queue, track],
      }));
    } catch (error) {
      console.error('Error adding track to queue:', error);
    }
  };

  // Sırayı temizle
  const clearQueue = () => {
    setPlayerState((prev) => ({
      ...prev,
      queue: [],
    }));
  };

  // Değerleri context ile sağla
  const contextValue: PlayerContextType = {
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
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerContext;
