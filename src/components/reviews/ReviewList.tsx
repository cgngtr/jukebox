import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  ActivityIndicator, 
  Text, 
  StyleSheet,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ReviewWithDetails, getReviewsByItem, getUserReviews } from '../../api/reviews';
import ReviewCard from './ReviewCard';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, spacing } from '../../styles';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface ReviewListProps {
  itemId?: string;
  itemType?: 'album' | 'track' | 'artist';
  userId?: string;
  limit?: number;
  showHeader?: boolean;
  onReviewPress?: (review: ReviewWithDetails) => void;
  onLikePress?: (review: ReviewWithDetails) => void;
  onCommentPress?: (review: ReviewWithDetails) => void;
  emptyStateMessage?: string;
  nestedScrollEnabled?: boolean;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  itemId,
  itemType,
  userId,
  limit = 10,
  showHeader = true,
  onReviewPress,
  onLikePress,
  onCommentPress,
  emptyStateMessage = 'No reviews yet. Be the first to share your thoughts!',
  nestedScrollEnabled = true
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch reviews based on props
  const fetchReviews = useCallback(async (pageNum: number, refresh: boolean = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      let data;
      
      // Determine which API to call based on props
      if (userId) {
        // Fetch reviews by a specific user
        data = await getUserReviews(userId, pageNum, limit);
      } else if (itemId && itemType) {
        // Fetch reviews for a specific item
        data = await getReviewsByItem(itemId, itemType, pageNum, limit);
      } else {
        // No valid criteria provided
        console.error('ReviewList requires either userId or (itemId and itemType)');
        setReviews([]);
        setTotalCount(0);
        setHasMore(false);
        return;
      }

      const { reviews: fetchedReviews, count } = data;
      
      // Update state based on results
      if (pageNum === 1 || refresh) {
        setReviews(fetchedReviews);
      } else {
        setReviews(prev => [...prev, ...fetchedReviews]);
      }
      
      setTotalCount(count);
      setHasMore(fetchedReviews.length === limit);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [itemId, itemType, userId, limit]);

  // Initial fetch
  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  // Handle refresh (pull to refresh)
  const handleRefresh = useCallback(() => {
    setPage(1);
    fetchReviews(1, true);
  }, [fetchReviews]);

  // Handle loading more reviews when reaching the end
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReviews(nextPage);
    }
  }, [fetchReviews, hasMore, isLoadingMore, page]);

  // Navigate to review creation screen
  const handleCreateReview = () => {
    if (itemId && itemType) {
      navigation.navigate('CreateReview', { itemId, itemType });
    }
  };

  // Render an empty state when there are no reviews
  const renderEmptyState = () => {
    if (isLoading) return null;
    
    return (
      <View style={styles.emptyState}>
        <Ionicons 
          name="chatbubble-ellipses-outline" 
          size={60} 
          color={theme.colors.text.inactive} 
        />
        <Text style={[styles.emptyStateText, { color: theme.colors.text.secondary }]}>
          {emptyStateMessage}
        </Text>
        {itemId && itemType && (
          <TouchableOpacity 
            style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleCreateReview}
          >
            <Text style={styles.createButtonText}>Write a Review</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render a single review item
  const renderReviewItem = ({ item }: { item: ReviewWithDetails }) => (
    <ReviewCard
      review={item}
      onPress={() => onReviewPress?.(item)}
      onLike={() => onLikePress?.(item)}
      onComment={() => onCommentPress?.(item)}
      onShare={() => navigation.navigate('ReviewDetail', { reviewId: item.id })}
    />
  );

  // Render a footer with loading indicator when loading more
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  // Render the header with review count and create button
  const renderHeader = () => {
    if (!showHeader) return null;
    
    return (
      <View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        contentContainerStyle={[
          reviews.length === 0 ? styles.emptyListContent : styles.listContent,
          { paddingHorizontal: spacing.md }
        ]}
        nestedScrollEnabled={nestedScrollEnabled}
        removeClippedSubviews={true}
      />
    </View>
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
  listContent: {
    paddingVertical: spacing.md,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  reviewCount: {
    fontSize: 18,
    fontWeight: '600',
  },
  createButton: {
    flexDirection: 'row',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  footerLoader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
});

export default ReviewList; 