import * as musicAPI from '../services/musicApi';
import { DEFAULT_MARKET } from '../services/musicApi';

// Spotify ile ilgili API fonksiyonları
export const music = {
  // Kullanıcı bilgilerini getir
  getCurrentUser: async (token: string) => {
    try {
      return await musicAPI.getCurrentUser(token);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Öne çıkan çalma listelerini getir
  getFeaturedPlaylists: async (
    token: string, 
    limit: number = 20, 
    market: string = DEFAULT_MARKET,
    locale: string = 'en_US',
    timestamp?: string,
    offset: number = 0
  ) => {
    try {
      return await musicAPI.getFeaturedPlaylists(token, limit, market, locale, timestamp, offset);
    } catch (error) {
      console.error('Error fetching featured playlists:', error);
      throw error;
    }
  },

  // Yeni çıkan albümleri getir
  getNewReleases: async (token: string, limit: number = 20, market: string = DEFAULT_MARKET) => {
    try {
      return await musicAPI.getNewReleases(token, limit, market);
    } catch (error) {
      console.error('Error fetching new releases:', error);
      throw error;
    }
  },

  // Şarkı, sanatçı, albüm, çalma listesi arama
  search: async (
    token: string,
    query: string,
    types: string[] = ['track', 'artist', 'album', 'playlist'],
    limit: number = 20,
    market: string = DEFAULT_MARKET
  ) => {
    try {
      return await musicAPI.searchItems(token, query, types, limit, market);
    } catch (error) {
      console.error('Error searching items:', error);
      throw error;
    }
  },

  // Kullanıcının en çok dinlediği şarkıları getir
  getUserTopTracks: async (
    token: string,
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    limit: number = 20
  ) => {
    try {
      return await musicAPI.getUserTopTracks(token, timeRange, limit);
    } catch (error) {
      console.error('Error fetching user top tracks:', error);
      throw error;
    }
  },

  // Kullanıcının en çok dinlediği sanatçıları getir
  getUserTopArtists: async (
    token: string,
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    limit: number = 20
  ) => {
    try {
      return await musicAPI.getUserTopArtists(token, timeRange, limit);
    } catch (error) {
      console.error('Error fetching user top artists:', error);
      throw error;
    }
  },

  // Sanatçı detaylarını getir
  getArtist: async (token: string, artistId: string) => {
    try {
      return await musicAPI.getArtist(token, artistId);
    } catch (error) {
      console.error('Error fetching artist details:', error);
      throw error;
    }
  },

  // Sanatçının en popüler şarkılarını getir
  getArtistTopTracks: async (token: string, artistId: string, market: string = 'US') => {
    try {
      return await musicAPI.getArtistTopTracks(token, artistId, market);
    } catch (error) {
      console.error('Error fetching artist top tracks:', error);
      throw error;
    }
  },

  // Albüm detaylarını getir
  getAlbum: async (token: string, albumId: string) => {
    try {
      return await musicAPI.getAlbum(token, albumId);
    } catch (error) {
      console.error('Error fetching album details:', error);
      throw error;
    }
  },

  // Şarkı detaylarını getir
  getTrack: async (token: string, trackId: string) => {
    try {
      return await musicAPI.getTrack(token, trackId);
    } catch (error) {
      console.error('Error fetching track details:', error);
      throw error;
    }
  },

  // Çalma listesi detaylarını getir
  getPlaylist: async (token: string, playlistId: string) => {
    try {
      return await musicAPI.getPlaylist(token, playlistId);
    } catch (error) {
      console.error('Error fetching playlist details:', error);
      throw error;
    }
  },

  // Belirli bir playlist'in detaylı bilgisini (takipçi sayısı dahil) getir
  getPlaylistDetails: async (token: string, playlistId: string) => {
    try {
      return await musicAPI.getPlaylist(token, playlistId);
    } catch (error) {
      console.error('Error fetching detailed playlist info:', error);
      throw error;
    }
  },

  // Müzik kategorilerini getir
  getCategories: async (token: string, limit: number = 20, market: string = DEFAULT_MARKET) => {
    try {
      return await musicAPI.getCategories(token, limit, market);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Kategori çalma listelerini getir
  getCategoryPlaylists: async (
    token: string, 
    categoryId: string, 
    limit: number = 20,
    market: string = DEFAULT_MARKET
  ) => {
    try {
      return await musicAPI.getCategoryPlaylists(token, categoryId, limit, market);
    } catch (error) {
      console.error('Error fetching category playlists:', error);
      throw error;
    }
  },

  // Kullanıcının kaydettiği şarkıları getir
  getUserSavedTracks: async (token: string, limit: number = 20, offset: number = 0) => {
    try {
      return await musicAPI.getUserSavedTracks(token, limit, offset);
    } catch (error) {
      console.error('Error fetching user saved tracks:', error);
      throw error;
    }
  },

  // Kullanıcının çalma listelerini getir
  getUserPlaylists: async (token: string, limit: number = 20, offset: number = 0) => {
    try {
      return await musicAPI.getUserPlaylists(token, limit, offset);
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      throw error;
    }
  },

  // Kullanıcının son çalınan şarkılarını getir
  getRecentlyPlayed: async (token: string, limit: number = 20) => {
    try {
      return await musicAPI.getRecentlyPlayed(token, limit);
    } catch (error) {
      console.error('Error fetching recently played tracks:', error);
      throw error;
    }
  },

  // Kullanıcının takip ettiği sanatçıları getir
  getUserFollowedArtists: async (token: string, limit: number = 50) => {
    try {
      return await musicAPI.getUserFollowedArtists(token, limit);
    } catch (error) {
      console.error('Error fetching user followed artists:', error);
      throw error;
    }
  },

  // Playback ile ilgili yeni fonksiyonlar
  getCurrentlyPlaying: musicAPI.getCurrentlyPlaying,
  getPlayerState: musicAPI.getPlayerState,
  playTrack: musicAPI.playTrack,
  playContext: musicAPI.playContext,
  pausePlayback: musicAPI.pausePlayback,
  resumePlayback: musicAPI.resumePlayback,
  skipToNext: musicAPI.skipToNext,
  skipToPrevious: musicAPI.skipToPrevious,
  seekToPosition: musicAPI.seekToPosition,
  setShuffleMode: musicAPI.setShuffleMode,
  setRepeatMode: musicAPI.setRepeatMode,
  setVolume: musicAPI.setVolume,
  getAvailableDevices: musicAPI.getAvailableDevices,
  transferPlayback: musicAPI.transferPlayback
};
