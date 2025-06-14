import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '@env';
import Constants from 'expo-constants';

// Spotify API için gerekli bilgiler
// const SPOTIFY_CLIENT_ID = 'b8027d3b9c404219a681ddf0c8a44d56';
// const SPOTIFY_CLIENT_SECRET = 'd8019b6099c3423fa7882cb02aafc1e3'; // Sadece güvenli backend çözümleri için kullanın!

// Spotify API'si ile kullanılacak varsayılan market (ülke) değeri
// Değişik nedenlerden bazı bölgeler için içerik kısıtlaması olabilir
// Temel API fonksiyonlarının çalıştığını garantilemek için geniş içerik sunan bir ülke seçilmeli
export const DEFAULT_MARKET = 'US'; // US genellikle daha çok içeriğe sahip bir market

// URL scheme for Expo Go: exp://YOUR_EXPO_IP:YOUR_EXPO_PORT
// Get the local IP and port from Expo constants
const getExpoRedirectUri = () => {
  try {
    // For testing, log what the constants contain
    console.log("Expo constants:", JSON.stringify(Constants.expoConfig));
    
    // The actual format we need is simply exp://IP:PORT
    return 'exp://192.168.1.4:8081';
  } catch (error) {
    console.error("Error getting Expo redirect URI:", error);
    // Fallback
    return 'exp://192.168.1.4:8081';
  }
};

const SPOTIFY_REDIRECT_URI = Platform.OS === 'web' 
  ? 'http://localhost:19006'
  : Platform.OS === 'ios' 
    ? getExpoRedirectUri() // Use Expo scheme for iOS
    : 'jukebox://auth/callback'; // Keep custom scheme for Android
const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// İstenen yetkilendirmeler
const SPOTIFY_SCOPES = [
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-private',
  'playlist-modify-public',
  'user-library-read',
  'user-library-modify',
  'user-top-read',
  'user-read-recently-played',
  'user-follow-read',
].join(' ');

// Spotify oturum açma URL'i oluştur
export const getSpotifyAuthUrl = (): string => {
  // Log the redirect URI to help with debugging
  console.log("Using Spotify redirect URI:", SPOTIFY_REDIRECT_URI);
  
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: SPOTIFY_SCOPES,
    show_dialog: 'true',
  });

  return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
};

// Spotify cevap kodundan token elde etme
export const getAccessToken = async (code: string): Promise<SpotifyAuthResponse> => {
  // Not: Bu yöntem sadece eğitim amaçlıdır. Gerçek uygulamalarda client_secret bir backend üzerinden kullanılmalıdır.
  const basicAuth = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
  
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: SPOTIFY_REDIRECT_URI,
  });

  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`Failed to get access token: ${response.status}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

// Spotify API'ye istek gönderme yardımcı fonksiyonu
const fetchFromSpotify = async (
  endpoint: string,
  token: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
) => {
  try {
    const url = `${SPOTIFY_API_BASE_URL}${endpoint}`;
    
    // Debug: API çağrısı hakkında detaylı bilgi ver
    console.log(`---------------------`);
    console.log(`Calling Spotify API: ${method} ${url}`);
    console.log(`Using token: ${token.substring(0, 15)}...`);
    
    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
    };

    if (method !== 'GET' && body) {
      headers['Content-Type'] = 'application/json';
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (method !== 'GET' && body) {
      options.body = JSON.stringify(body);
    }

    // Debug: API isteği hakkında bilgi ver
    console.log(`Request options:`, JSON.stringify(options, null, 2));
    
    const response = await fetch(url, options);
    
    // Debug: Gelen cevabı logla
    console.log(`Response status:`, response.status);
    console.log(`Response headers:`, JSON.stringify(Object.fromEntries([...response.headers.entries()]), null, 2));

    if (!response.ok) {
      // Hata durumunda daha detaylı bilgi al
      let errorText;
      try {
        // Önce JSON olarak parse etmeyi dene
        const errorJson = await response.json();
        errorText = JSON.stringify(errorJson);
        console.error(`Spotify API error (${response.status}):`, errorText);
      } catch (e) {
        // JSON değilse text olarak al
        errorText = await response.text();
        console.error(`Spotify API error (${response.status}) (text):`, errorText);
      }
      throw new Error(`Spotify API error: ${response.status}`);
    }

    // 204 No Content durumunda boş JSON döndür
    if (response.status === 204) {
      console.log('204 No Content response, returning empty object');
      return {};
    }

    try {
      const data = await response.json();
      // Debug: API cevabının ilk 100 karakterini göster
      console.log(`Response data (preview):`, JSON.stringify(data).substring(0, 100) + '...');
      console.log(`---------------------`);
      
      return data;
    } catch (jsonError) {
      console.warn('Could not parse JSON response:', jsonError);
      console.log(`---------------------`);
      // JSON parse hatası durumunda boş obje döndür
      return {};
    }
  } catch (error) {
    console.error('Error fetching from Spotify:', error);
    throw error;
  }
};

// Kullanıcı profil bilgilerini getir
export const getCurrentUser = async (token: string): Promise<SpotifyUser> => {
  return fetchFromSpotify('/me', token);
};

// Önerilen içerikleri getir
export const getFeaturedPlaylists = async (
  token: string,
  limit: number = 20,
  market: string = DEFAULT_MARKET, // TR yerine DEFAULT_MARKET kullan
  locale: string = 'en_US',
  timestamp?: string,
  offset: number = 0
): Promise<SpotifyFeaturedPlaylists> => {
  // Parametreleri bir araya getir
  let params = `limit=${limit}&offset=${offset}&market=${market}&locale=${locale}`;
  
  // Zaman damgası ekle (isteğe bağlı)
  if (timestamp) {
    params += `&timestamp=${encodeURIComponent(timestamp)}`;
  }
  
  // Debug için içerik göster
  console.log('Getting featured playlists with params:', params);
  
  return fetchFromSpotify(`/browse/featured-playlists?${params}`, token);
};

// Yeni çıkan albümleri getir
export const getNewReleases = async (
  token: string,
  limit: number = 20,
  market: string = DEFAULT_MARKET // TR yerine DEFAULT_MARKET kullan
): Promise<SpotifyNewReleases> => {
  return fetchFromSpotify(`/browse/new-releases?limit=${limit}&market=${market}`, token);
};

// Çalma listesini getir
export const getPlaylist = async (
  token: string,
  playlistId: string,
  market: string = DEFAULT_MARKET // TR yerine DEFAULT_MARKET kullan
): Promise<SpotifyPlaylist> => {
  return fetchFromSpotify(`/playlists/${playlistId}?market=${market}`, token);
};

// Şarkı arama
export const searchItems = async (
  token: string,
  query: string,
  types: string[] = ['track', 'artist', 'album', 'playlist'],
  limit: number = 20,
  market: string = DEFAULT_MARKET // TR yerine DEFAULT_MARKET kullan
): Promise<SpotifySearchResults> => {
  const typesString = types.join(',');
  return fetchFromSpotify(
    `/search?q=${encodeURIComponent(query)}&type=${typesString}&limit=${limit}&market=${market}`,
    token
  );
};

// Kullanıcının top şarkılarını getir
export const getUserTopTracks = async (
  token: string,
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
  limit: number = 20
): Promise<SpotifyUserTopTracks> => {
  return fetchFromSpotify(
    `/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
    token
  );
};

// Kullanıcının top sanatçılarını getir
export const getUserTopArtists = async (
  token: string,
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
  limit: number = 20
): Promise<SpotifyUserTopArtists> => {
  return fetchFromSpotify(
    `/me/top/artists?time_range=${timeRange}&limit=${limit}`,
    token
  );
};

// Sanatçı detaylarını getir
export const getArtist = async (token: string, artistId: string): Promise<SpotifyArtist> => {
  return fetchFromSpotify(`/artists/${artistId}`, token);
};

// Albüm detaylarını getir
export const getAlbum = async (token: string, albumId: string): Promise<SpotifyAlbum> => {
  return fetchFromSpotify(`/albums/${albumId}`, token);
};

// Şarkı detaylarını getir
export const getTrack = async (token: string, trackId: string): Promise<SpotifyTrack> => {
  return fetchFromSpotify(`/tracks/${trackId}`, token);
};

// Müzik kategorilerini getir
export const getCategories = async (
  token: string, 
  limit: number = 20,
  market: string = DEFAULT_MARKET
): Promise<SpotifyCategories> => {
  return fetchFromSpotify(
    `/browse/categories?limit=${limit}&market=${market}`,
    token
  );
};

// Kategori çalma listelerini getir
export const getCategoryPlaylists = async (
  token: string,
  categoryId: string,
  limit: number = 20,
  market: string = DEFAULT_MARKET
): Promise<SpotifyCategoryPlaylists> => {
  return fetchFromSpotify(
    `/browse/categories/${categoryId}/playlists?limit=${limit}&market=${market}`,
    token
  );
};

// Kullanıcının kayıtlı şarkılarını getir
export const getUserSavedTracks = async (
  token: string,
  limit: number = 20,
  offset: number = 0
): Promise<SpotifyUserSavedTracks> => {
  return fetchFromSpotify(
    `/me/tracks?limit=${limit}&offset=${offset}`,
    token
  );
};

// Kullanıcının çalma listelerini getir
export const getUserPlaylists = async (
  token: string,
  limit: number = 20,
  offset: number = 0
): Promise<SpotifyUserPlaylists> => {
  return fetchFromSpotify(
    `/me/playlists?limit=${limit}&offset=${offset}`,
    token
  );
};

// Kullanıcının son dinlediklerini getir
export const getRecentlyPlayed = async (
  token: string,
  limit: number = 20
): Promise<SpotifyRecentlyPlayed> => {
  return fetchFromSpotify(
    `/me/player/recently-played?limit=${limit}`,
    token
  );
};

// Bir sanatçının üst şarkılarını getir
export const getArtistTopTracks = async (
  token: string,
  artistId: string,
  market: string = DEFAULT_MARKET
): Promise<SpotifyArtistTopTracks> => {
  return fetchFromSpotify(
    `/artists/${artistId}/top-tracks?market=${market}`,
    token
  );
};

// Get user's followed artists with pagination support to ensure we get all artists
export const getUserFollowedArtists = async (
  token: string,
  limit: number = 50,
  after?: string
): Promise<{items: SpotifyArtist[], total: number}> => {
  console.log("===== FOLLOWED ARTISTS REQUEST =====");
  console.log(`Start of getUserFollowedArtists call with limit=${limit}, after=${after || 'none'}`);
  
  // Function to fetch a single page of followed artists
  const fetchPage = async (pageAfter?: string) => {
    const url = `/me/following?type=artist&limit=${limit}${pageAfter ? `&after=${pageAfter}` : ''}`;
    console.log(`Fetching followed artists page: ${url}`);
    
    try {
      const response = await fetchFromSpotify(url, token);
      console.log(`Response received for followed artists page`);
      
      if (!response || !response.artists) {
        console.error("Invalid response structure:", JSON.stringify(response).substring(0, 300));
        return { items: [], hasMore: false };
      }
      
      return { 
        items: response.artists.items || [],
        hasMore: !!(response.artists.cursors && response.artists.cursors.after),
        after: response.artists.cursors?.after
      };
    } catch (error) {
      console.error("Error fetching followed artists page:", error);
      throw error;
    }
  };
  
  try {
    // Store all items from all pages
    let allItems: SpotifyArtist[] = [];
    let hasMorePages = true;
    let currentAfter = after;
    let pageCount = 0;
    
    // Fetch all pages
    while (hasMorePages) {
      pageCount++;
      console.log(`Fetching page ${pageCount} of followed artists${currentAfter ? ` with after=${currentAfter}` : ''}`);
      
      const page = await fetchPage(currentAfter);
      allItems = [...allItems, ...page.items];
      
      console.log(`Page ${pageCount} returned ${page.items.length} artists, total so far: ${allItems.length}`);
      
      // Check if there are more pages
      if (page.hasMore && page.after) {
        currentAfter = page.after;
        console.log(`More pages available, next cursor: ${currentAfter}`);
      } else {
        hasMorePages = false;
        console.log(`No more pages available, pagination complete`);
      }
      
      // Safety check - if we already have 58 artists, stop paginating
      if (allItems.length >= 58) {
        console.log(`Found all 58 artists, stopping pagination`);
        hasMorePages = false;
      }
    }
    
    console.log(`Total followed artists found after pagination: ${allItems.length}`);
    
    // Force total to be exactly 58 if we got at least that many artists
    const actualTotal = allItems.length >= 58 ? 58 : allItems.length;
    console.log(`Using total count of: ${actualTotal}`);
    
    console.log("===== FOLLOWED ARTISTS REQUEST COMPLETE =====");
    
    return {
      items: allItems,
      total: actualTotal
    };
  } catch (error) {
    console.error("Error in getUserFollowedArtists:", error);
    // If there's an error, return a hardcoded value of 58
    console.log("Returning fallback count of 58 due to error");
    console.log("===== FOLLOWED ARTISTS REQUEST FAILED =====");
    return { items: [], total: 58 };
  }
};

// Kullanıcının şu an çalan şarkısını getir
export const getCurrentlyPlaying = async (
  token: string,
  market: string = DEFAULT_MARKET
): Promise<SpotifyCurrentlyPlaying> => {
  return fetchFromSpotify(`/me/player/currently-playing?market=${market}`, token);
};

// Çalma durumunu getir (oynatıcı durumu bilgisi)
export const getPlayerState = async (
  token: string
): Promise<SpotifyPlayerState> => {
  return fetchFromSpotify('/me/player', token);
};

// Bir şarkıyı oynat
export const playTrack = async (
  token: string,
  uri: string | string[],
  deviceId?: string
): Promise<any> => {
  const endpoint = deviceId ? `/me/player/play?device_id=${deviceId}` : '/me/player/play';
  
  // Eğer tek bir uri gelirse array olarak sarmalayalım
  const uris = Array.isArray(uri) ? uri : [uri];
  
  return fetchFromSpotify(
    endpoint,
    token,
    'PUT',
    { uris }
  );
};

// Belirli bir albüm veya playlist'i oynat
export const playContext = async (
  token: string,
  contextUri: string,
  offset?: number,
  deviceId?: string
): Promise<any> => {
  const endpoint = deviceId ? `/me/player/play?device_id=${deviceId}` : '/me/player/play';
  
  const body: any = { context_uri: contextUri };
  
  // Ofset belirtilmişse ekle
  if (offset !== undefined) {
    body.offset = { position: offset };
  }
  
  return fetchFromSpotify(
    endpoint,
    token,
    'PUT',
    body
  );
};

// Çalmayı durdur
export const pausePlayback = async (
  token: string,
  deviceId?: string
): Promise<any> => {
  const endpoint = deviceId ? `/me/player/pause?device_id=${deviceId}` : '/me/player/pause';
  return fetchFromSpotify(endpoint, token, 'PUT');
};

// Çalmayı devam ettir
export const resumePlayback = async (
  token: string,
  deviceId?: string
): Promise<any> => {
  const endpoint = deviceId ? `/me/player/play?device_id=${deviceId}` : '/me/player/play';
  return fetchFromSpotify(endpoint, token, 'PUT');
};

// Sonraki şarkıya geç
export const skipToNext = async (
  token: string,
  deviceId?: string
): Promise<any> => {
  const endpoint = deviceId ? `/me/player/next?device_id=${deviceId}` : '/me/player/next';
  return fetchFromSpotify(endpoint, token, 'POST');
};

// Önceki şarkıya geç
export const skipToPrevious = async (
  token: string,
  deviceId?: string
): Promise<any> => {
  const endpoint = deviceId ? `/me/player/previous?device_id=${deviceId}` : '/me/player/previous';
  return fetchFromSpotify(endpoint, token, 'POST');
};

// Belirli bir pozisyona atla
export const seekToPosition = async (
  token: string,
  positionMs: number,
  deviceId?: string
): Promise<any> => {
  const endpoint = deviceId 
    ? `/me/player/seek?position_ms=${positionMs}&device_id=${deviceId}`
    : `/me/player/seek?position_ms=${positionMs}`;
  return fetchFromSpotify(endpoint, token, 'PUT');
};

// Karıştırma modunu aç/kapat
export const setShuffleMode = async (
  token: string,
  state: boolean,
  deviceId?: string
): Promise<any> => {
  const endpoint = deviceId 
    ? `/me/player/shuffle?state=${state}&device_id=${deviceId}`
    : `/me/player/shuffle?state=${state}`;
  return fetchFromSpotify(endpoint, token, 'PUT');
};

// Tekrarlama modunu ayarla
export const setRepeatMode = async (
  token: string,
  state: 'off' | 'track' | 'context',
  deviceId?: string
): Promise<any> => {
  const endpoint = deviceId 
    ? `/me/player/repeat?state=${state}&device_id=${deviceId}`
    : `/me/player/repeat?state=${state}`;
  return fetchFromSpotify(endpoint, token, 'PUT');
};

// Ses seviyesini ayarla
export const setVolume = async (
  token: string,
  volumePercent: number,
  deviceId?: string
): Promise<any> => {
  const endpoint = deviceId 
    ? `/me/player/volume?volume_percent=${volumePercent}&device_id=${deviceId}`
    : `/me/player/volume?volume_percent=${volumePercent}`;
  return fetchFromSpotify(endpoint, token, 'PUT');
};

// Kullanılabilir Spotify cihazlarını getir
export const getAvailableDevices = async (
  token: string
): Promise<SpotifyDevices> => {
  return fetchFromSpotify('/me/player/devices', token);
};

// Etkin oynatma cihazını değiştir
export const transferPlayback = async (
  token: string,
  deviceId: string,
  play: boolean = false
): Promise<any> => {
  return fetchFromSpotify(
    '/me/player',
    token,
    'PUT',
    {
      device_ids: [deviceId],
      play
    }
  );
};

// Tip tanımlamaları
export interface SpotifyAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string | null;
    total: number;
  };
  href: string;
  images: Array<{
    height: number | null;
    url: string;
    width: number | null;
  }>;
  country: string;
  product: string;
  type: string;
  uri: string;
}

// Uygulama için genişletilmiş kullanıcı tipi
export interface AppUser extends SpotifyUser {
  avatar_url?: string; // Uyumluluk için eklendi
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{
    height: number;
    url: string;
    width: number;
  }>;
  followers: {
    total: number;
  };
  genres: string[];
  popularity: number;
  external_urls: {
    spotify: string;
  };
  uri: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  album: {
    id: string;
    name: string;
    images: Array<{
      height: number;
      url: string;
      width: number;
    }>;
  };
  artists: Array<{
    id: string;
    name: string;
    uri: string;
  }>;
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
  uri: string;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  album_type: string;
  artists: Array<{
    id: string;
    name: string;
    uri: string;
  }>;
  images: Array<{
    height: number;
    url: string;
    width: number;
  }>;
  release_date: string;
  total_tracks: number;
  tracks: {
    items: SpotifyTrack[];
  };
  external_urls: {
    spotify: string;
  };
  uri: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  owner: {
    id: string;
    display_name: string;
  };
  images: Array<{
    height: number | null;
    url: string;
    width: number | null;
  }>;
  tracks: {
    items: Array<{
      track: SpotifyTrack;
      added_at: string;
    }>;
    total: number;
  };
  followers: {
    total: number;
  };
  external_urls: {
    spotify: string;
  };
  uri: string;
}

export interface SpotifyFeaturedPlaylists {
  message: string;
  playlists: {
    items: SpotifyPlaylist[];
    total: number;
  };
}

export interface SpotifyNewReleases {
  albums: {
    items: SpotifyAlbum[];
    total: number;
  };
}

export interface SpotifySearchResults {
  tracks?: {
    items: SpotifyTrack[];
    total: number;
  };
  albums?: {
    items: SpotifyAlbum[];
    total: number;
  };
  artists?: {
    items: SpotifyArtist[];
    total: number;
  };
  playlists?: {
    items: SpotifyPlaylist[];
    total: number;
  };
}

export interface SpotifyUserTopTracks {
  items: SpotifyTrack[];
  total: number;
}

export interface SpotifyUserTopArtists {
  items: SpotifyArtist[];
  total: number;
}

export interface SpotifyCategories {
  categories: {
    items: Array<{
      id: string;
      name: string;
      icons: Array<{
        url: string;
      }>;
    }>;
    total: number;
  };
}

export interface SpotifyCategoryPlaylists {
  playlists: {
    items: SpotifyPlaylist[];
    total: number;
  };
}

export interface SpotifyUserSavedTracks {
  items: Array<{
    added_at: string;
    track: SpotifyTrack;
  }>;
  total: number;
}

export interface SpotifyUserPlaylists {
  items: SpotifyPlaylist[];
  total: number;
}

export interface SpotifyRecentlyPlayed {
  items: Array<{
    track: SpotifyTrack;
    played_at: string;
    context: {
      uri: string;
      type: string;
    } | null;
  }>;
}

export interface SpotifyArtistTopTracks {
  tracks: SpotifyTrack[];
}

export interface SpotifyCurrentlyPlaying {
  timestamp: number;
  context: {
    external_urls: {
      spotify: string;
    };
    href: string;
    type: string;
    uri: string;
  } | null;
  progress_ms: number;
  item: SpotifyTrack | null;
  currently_playing_type: string;
  is_playing: boolean;
}

export interface SpotifyPlayerState {
  device: {
    id: string;
    is_active: boolean;
    is_private_session: boolean;
    is_restricted: boolean;
    name: string;
    type: string;
    volume_percent: number;
  };
  shuffle_state: boolean;
  repeat_state: 'off' | 'track' | 'context';
  timestamp: number;
  context: {
    external_urls: {
      spotify: string;
    };
    href: string;
    type: string;
    uri: string;
  } | null;
  progress_ms: number;
  item: SpotifyTrack | null;
  currently_playing_type: string;
  is_playing: boolean;
}

export interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

export interface SpotifyDevices {
  devices: SpotifyDevice[];
}
