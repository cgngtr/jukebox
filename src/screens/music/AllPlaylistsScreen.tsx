import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  FlatList
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius } from '../../styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { renderPlaylistCard, renderPlaylistItem } from './renderers/PlaylistRenderer';

interface Playlist {
  id: string;
  name: string;
  description?: string;
  images: Array<{url: string; height: number | null; width: number | null}>;
  owner: {
    id: string;
    display_name: string;
  };
  tracks?: {
    total: number;
  };
  followers?: {
    total: number;
  };
}

const AllPlaylistsScreen: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  
  const { 
    playlists = [], 
    title = 'Playlists',
    selectedTab = 'owned',
    userId = ''
  } = route.params as { 
    playlists: Playlist[]; 
    title: string;
    selectedTab?: 'owned' | 'followed';
    userId?: string;
  };
  
  const [activeTab, setActiveTab] = useState<'owned' | 'followed'>(selectedTab);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter playlists based on tab
  const filteredPlaylists = playlists.filter(playlist => {
    if (activeTab === 'owned') {
      return playlist && (playlist.owner?.id === userId || !playlist.owner?.id);
    } else {
      return playlist && playlist.owner?.id !== undefined && playlist.owner?.id !== userId;
    }
  });
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
        <TouchableOpacity 
          style={styles.viewModeButton}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          <Ionicons 
            name={viewMode === 'grid' ? 'list' : 'grid'} 
            size={22} 
            color={theme.colors.primary} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Tab Selection */}
      {userId && (
        <View style={[
          styles.tabContainer, 
          { borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]}>
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'owned' && { 
                borderBottomWidth: 2, 
                borderBottomColor: theme.colors.primary 
              }
            ]}
            onPress={() => setActiveTab('owned')}
          >
            <Text style={[
              styles.tabText, 
              { 
                color: activeTab === 'owned' 
                  ? theme.colors.primary 
                  : theme.colors.text.secondary 
              }
            ]}>
              Owned
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'followed' && { 
                borderBottomWidth: 2, 
                borderBottomColor: theme.colors.primary 
              }
            ]}
            onPress={() => setActiveTab('followed')}
          >
            <Text style={[
              styles.tabText, 
              { 
                color: activeTab === 'followed' 
                  ? theme.colors.primary 
                  : theme.colors.text.secondary 
              }
            ]}>
              Followed
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Playlists */}
      <FlatList
        data={filteredPlaylists}
        renderItem={viewMode === 'grid' ? renderPlaylistCard : renderPlaylistItem}
        keyExtractor={(item, index) => item?.id || `playlist-${index}`}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode === 'grid' ? 'grid' : 'list'} // Force re-render when changing view mode
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
              No playlists found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  viewModeButton: {
    padding: spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.base,
    paddingBottom: 100, // Extra space at bottom
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AllPlaylistsScreen; 