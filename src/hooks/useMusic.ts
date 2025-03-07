import { useState, useEffect, useCallback } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { music } from '../api';
import { 
  SpotifyTrack, 
  SpotifyPlaylist, 
  SpotifyArtist, 
  SpotifyAlbum 
} from '../services/musicApi';

interface UseMusic {
  // Veri fetching durumları
  isLoadingFeatured: boolean;
  isLoadingNewReleases: boolean;
  isLoadingSearch: boolean;
  isLoadingUserStats: boolean;
  
  // Veri
  featuredPlaylists: SpotifyPlaylist[];
  newReleases: SpotifyAlbum[];
  searchResults: {
    tracks: SpotifyTrack[];
    artists: SpotifyArtist[];
    albums: SpotifyAlbum[];
    playlists: SpotifyPlaylist[];
  };
  userTopTracks: SpotifyTrack[];
  userTopArtists: SpotifyArtist[];
  
  // Hatalar
  error: Error | null;
  
  // İşlevler
  fetchFeaturedPlaylists: () => Promise<void>;
  fetchNewReleases: () => Promise<void>;
  search: (query: string, types?: string[]) => Promise<void>;
  fetchUserTopItems: () => Promise<void>;
  playTrack: (track: SpotifyTrack, trackList?: SpotifyTrack[]) => Promise<void>;
  playAlbum: (albumId: string) => Promise<void>;
  playPlaylist: (playlistId: string) => Promise<void>;
}

// Basitleştirilmiş Spotify veri erişimi için hook
export const useMusic = (): UseMusic => {
  const { isAuthenticated } = useAuth();
  const { play } = usePlayer();
  
  // Veri yükleme durumları
  const [isLoadingFeatured, setIsLoadingFeatured] = useState<boolean>(false);
  const [isLoadingNewReleases, setIsLoadingNewReleases] = useState<boolean>(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState<boolean>(false);
  const [isLoadingUserStats, setIsLoadingUserStats] = useState<boolean>(false);
  
  // Veri durumları
  const [featuredPlaylists, setFeaturedPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [newReleases, setNewReleases] = useState<SpotifyAlbum[]>([]);
  const [searchResults, setSearchResults] = useState<{
    tracks: SpotifyTrack[];
    artists: SpotifyArtist[];
    albums: SpotifyAlbum[];
    playlists: SpotifyPlaylist[];
  }>({
    tracks: [],
    artists: [],
    albums: [],
    playlists: [],
  });
  const [userTopTracks, setUserTopTracks] = useState<SpotifyTrack[]>([]);
  const [userTopArtists, setUserTopArtists] = useState<SpotifyArtist[]>([]);
  
  // Hata durumu
  const [error, setError] = useState<Error | null>(null);
  
  // Demo için token (gerçek uygulamada AuthContext'ten alınacak)
  // Not: Bu örnek için bir mock token kullanıyoruz.
  const mockToken = 'mock_token';
  
  // Öne çıkan çalma listelerini getir
  const fetchFeaturedPlaylists = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated');
      return;
    }
    
    try {
      setIsLoadingFeatured(true);
      setError(null);
      
      // API çağrısı
      // Gerçek uyg.da auth.getStoredToken() ile token alınır
      const response = await music.getFeaturedPlaylists(mockToken);
      
      // Yanıttan çalma listelerini al
      const playlists = response.playlists.items;
      setFeaturedPlaylists(playlists);
    } catch (err) {
      console.error('Error fetching featured playlists:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoadingFeatured(false);
    }
  }, [isAuthenticated]);
  
  // Yeni çıkan albümleri getir
  const fetchNewReleases = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated');
      return;
    }
    
    try {
      setIsLoadingNewReleases(true);
      setError(null);
      
      // API çağrısı
      const response = await music.getNewReleases(mockToken);
      
      // Yanıttan albümleri al
      const albums = response.albums.items;
      setNewReleases(albums);
    } catch (err) {
      console.error('Error fetching new releases:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoadingNewReleases(false);
    }
  }, [isAuthenticated]);
  
  // Arama yap
  const search = useCallback(async (
    query: string,
    types: string[] = ['track', 'artist', 'album', 'playlist']
  ) => {
    if (!isAuthenticated || !query.trim()) {
      return;
    }
    
    try {
      setIsLoadingSearch(true);
      setError(null);
      
      // API çağrısı
      const results = await music.search(mockToken, query, types);
      
      // Sonuçları ayarla (her tür için kontrol et)
      setSearchResults({
        tracks: results.tracks?.items || [],
        artists: results.artists?.items || [],
        albums: results.albums?.items || [],
        playlists: results.playlists?.items || [],
      });
    } catch (err) {
      console.error('Error searching:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoadingSearch(false);
    }
  }, [isAuthenticated]);
  
  // Kullanıcının en çok dinlediği öğeleri getir
  const fetchUserTopItems = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated');
      return;
    }
    
    try {
      setIsLoadingUserStats(true);
      setError(null);
      
      // API çağrıları
      const [tracksResponse, artistsResponse] = await Promise.all([
        music.getUserTopTracks(mockToken),
        music.getUserTopArtists(mockToken),
      ]);
      
      // Sonuçları ayarla
      setUserTopTracks(tracksResponse.items);
      setUserTopArtists(artistsResponse.items);
    } catch (err) {
      console.error('Error fetching user top items:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoadingUserStats(false);
    }
  }, [isAuthenticated]);
  
  // Parça çal
  const playTrack = useCallback(async (
    track: SpotifyTrack,
    trackList?: SpotifyTrack[]
  ) => {
    if (!isAuthenticated) {
      console.log('User not authenticated');
      return;
    }
    
    try {
      await play(track, trackList);
    } catch (err) {
      console.error('Error playing track:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [isAuthenticated, play]);
  
  // Albüm çal
  const playAlbum = useCallback(async (albumId: string) => {
    if (!isAuthenticated) {
      console.log('User not authenticated');
      return;
    }
    
    try {
      // Albümü getir
      const album = await music.getAlbum(mockToken, albumId);
      
      // İlk parçayı çal, tüm parçaları listeye ekle
      if (album.tracks.items.length > 0) {
        await play(album.tracks.items[0], album.tracks.items);
      }
    } catch (err) {
      console.error('Error playing album:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [isAuthenticated, play]);
  
  // Çalma listesi çal
  const playPlaylist = useCallback(async (playlistId: string) => {
    if (!isAuthenticated) {
      console.log('User not authenticated');
      return;
    }
    
    try {
      // Çalma listesini getir
      const playlist = await music.getPlaylist(mockToken, playlistId);
      
      // Parçaları düz bir listede topla
      const tracks = playlist.tracks.items.map(item => item.track);
      
      // İlk parçayı çal, tüm parçaları listeye ekle
      if (tracks.length > 0) {
        await play(tracks[0], tracks);
      }
    } catch (err) {
      console.error('Error playing playlist:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [isAuthenticated, play]);
  
  // Sayfa yüklendiğinde önerilen içerikleri getir
  useEffect(() => {
    if (isAuthenticated) {
      fetchFeaturedPlaylists();
      fetchNewReleases();
    }
  }, [isAuthenticated, fetchFeaturedPlaylists, fetchNewReleases]);
  
  return {
    // Veri yükleme durumları
    isLoadingFeatured,
    isLoadingNewReleases,
    isLoadingSearch,
    isLoadingUserStats,
    
    // Veri
    featuredPlaylists,
    newReleases,
    searchResults,
    userTopTracks,
    userTopArtists,
    
    // Hatalar
    error,
    
    // İşlevler
    fetchFeaturedPlaylists,
    fetchNewReleases,
    search,
    fetchUserTopItems,
    playTrack,
    playAlbum,
    playPlaylist,
  };
};
