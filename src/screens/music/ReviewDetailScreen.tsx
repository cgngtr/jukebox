import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Image,
  Alert,
  Animated,
  Keyboard
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { format, formatDistanceToNow } from 'date-fns';
import { supabase } from '../../api/supabase';

import { 
  ReviewWithDetails, 
  getReviewById,
  getReviewComments,
  addReviewComment,
  addReviewReaction,
  UserBase
} from '../../api/reviews';
import { RatingStars } from '../../components/reviews';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../context/AuthContext';
import { User } from '@supabase/supabase-js';
import { useTheme } from '../../context/ThemeContext';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

type ReviewDetailRouteProp = RouteProp<AppStackParamList, 'ReviewDetail'>;

export const ReviewDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ReviewDetailRouteProp>();
  const { reviewId, showComments = false } = route.params;
  const commentInputRef = useRef<TextInput>(null);
  
  const [review, setReview] = useState<ReviewWithDetails | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [showCommentsSection, setShowCommentsSection] = useState(showComments);
  
  // Yeni state: Yorum görünümü için (true) veya genel inceleme için (false)
  const [isCommentsView, setIsCommentsView] = useState(false);

  const { user: authUser } = useAuth();

  // Fetch the review details
  useEffect(() => {
    fetchReviewDetails();
  }, [reviewId, showComments]);

  // Fetch review details function
  const fetchReviewDetails = async () => {
    setIsLoading(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Get review details
      const reviewDetails = await getReviewById(reviewId, user?.id);
      setReview(reviewDetails);
      
      // If showComments is true, fetch comments
      if (showComments) {
        fetchComments(1);
        setIsCommentsView(true);
      }
    } catch (error) {
      console.error('Error fetching review details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch comments
  const fetchComments = async (pageNum: number) => {
    if (pageNum === 1) {
      setIsLoadingComments(true);
    }
    
    try {
      const { comments: fetchedComments, count } = await getReviewComments(reviewId, pageNum);
      
      if (pageNum === 1) {
        setComments(fetchedComments);
      } else {
        setComments(prev => [...prev, ...fetchedComments]);
      }
      
      setHasMoreComments(fetchedComments.length === 20); // Assuming page size is 20
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Load more comments
  const handleLoadMoreComments = () => {
    if (!isLoadingComments && hasMoreComments) {
      fetchComments(page + 1);
    }
  };

  // Toggle comment section
  const toggleCommentSection = () => {
    const newState = !showCommentsSection;
    setShowCommentsSection(newState);
    
    // If showing comments and we don't have any yet, fetch them
    if (newState && comments.length === 0) {
      fetchComments(1);
    }
    
    // Yorum görünümü modunu ayarla
    setIsCommentsView(newState);
    
    // Focus the comment input if opening the section
    if (newState) {
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 300);
    }
  };

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    
    // Kullanıcı kontrolü
    let currentUser: UserBase | null = null;
    
    if (user) {
      currentUser = { id: user.id };
    } else if (authUser) {
      currentUser = { id: authUser.id };
    }
    
    if (!currentUser) {
      Alert.alert(
        'Authentication Required',
        'Please log in to comment on reviews.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsSubmittingComment(true);
    
    try {
      const newComment = await addReviewComment(
        currentUser,
        reviewId,
        commentText.trim()
      );
      
      if (newComment) {
        // Add the new comment to the list
        const formattedComment = {
          ...newComment,
          user: {
            id: currentUser.id,
            username: user?.user_metadata?.username || authUser?.display_name || 'User',
            avatar_url: user?.user_metadata?.avatar_url || authUser?.avatar_url,
          }
        };
        
        // Add to comments list and clear input
        setComments(prev => [formattedComment, ...prev]);
        setCommentText('');
        
        // Update review comment count
        if (review) {
          setReview({
            ...review,
            comments_count: review.comments_count + 1
          });
        }
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert(
        'Error',
        'There was a problem posting your comment. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle like button press
  const handleLikePress = async () => {
    if (!user) {
      Alert.alert(
        'Authentication Required',
        'Please log in to like reviews.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      // Current like state
      const isLiked = review?.user_reaction === 'like';
      
      // Optimistically update UI
      setReview(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          user_reaction: isLiked ? undefined : 'like',
          likes_count: isLiked ? Math.max(0, prev.likes_count - 1) : prev.likes_count + 1
        };
      });
      
      // Send reaction to server
      await addReviewReaction(user, reviewId, 'like');
    } catch (error) {
      console.error('Error liking review:', error);
      // Revert optimistic update on error
      fetchReviewDetails();
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  // Format relative time for comments
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Navigate to user profile
  const handleUserPress = (userId: string) => {
    navigation.navigate('Profile', { userId });
  };

  // Navigate to item (album/track) details
  const handleItemPress = () => {
    if (!review) return;
    
    if (review.item_type === 'album') {
      navigation.navigate('AlbumDetail', { 
        id: review.item_id,
        albumId: review.item_id 
      });
    } else if (review.item_type === 'track') {
      navigation.navigate('TrackDetail', { 
        id: review.item_id,
        trackId: review.item_id 
      });
    }
  };

  // Render yorum öğesi
  const renderCommentItem = ({ item }: { item: any }) => (
    <View style={styles.commentItem}>
      <TouchableOpacity 
        onPress={() => handleUserPress(item.user.id)}
      >
        <Image 
          source={
            item.user.avatar_url 
              ? { uri: item.user.avatar_url } 
              : require('../../assets/images/default-avatar.png')
          } 
          style={styles.commentAvatar}
        />
      </TouchableOpacity>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <TouchableOpacity onPress={() => handleUserPress(item.user.id)}>
            <Text style={styles.commentUsername}>
              {item.user.username}
            </Text>
          </TouchableOpacity>
          <Text style={styles.commentTime}>
            {formatRelativeTime(item.created_at)}
          </Text>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A80F0" />
      </SafeAreaView>
    );
  }

  if (!review) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#ccc" />
          <Text style={styles.errorText}>
            Review not found or has been deleted.
          </Text>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // İnceleme görünümü için içerik
  const renderReviewContent = () => (
    <ScrollView style={styles.scrollContent}>
      {/* Review card */}
      <View style={styles.reviewCard}>
        {/* User info and date */}
        <View style={styles.reviewHeader}>
          <TouchableOpacity 
            style={styles.userInfo}
            onPress={() => handleUserPress(review.user.id)}
          >
            <Image 
              source={
                review.user.avatar_url 
                  ? { uri: review.user.avatar_url } 
                  : require('../../assets/images/default-avatar.png')
              } 
              style={styles.avatar}
            />
            <View>
              <Text style={styles.username}>{review.user.username}</Text>
              <Text style={styles.date}>{formatDate(review.created_at)}</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Rating */}
        <View style={styles.ratingContainer}>
          <RatingStars rating={review.rating} size={28} />
        </View>
        
        {/* Review content */}
        <Text style={styles.content}>{review.content}</Text>
        
        {/* Tags */}
        {review.tags && review.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {review.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Item being reviewed */}
        <TouchableOpacity 
          style={styles.reviewedItem}
          onPress={handleItemPress}
        >
          <Ionicons 
            name={review.item_type === 'album' ? 'disc' : 'musical-note'} 
            size={16} 
            color="#666" 
          />
          <Text style={styles.reviewedItemText}>
            Review for {review.item_type}: {review.item_id}
          </Text>
        </TouchableOpacity>
        
        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleLikePress}
          >
            <Ionicons 
              name={review.user_reaction === 'like' ? 'heart' : 'heart-outline'} 
              size={24} 
              color={review.user_reaction === 'like' ? '#FF6B6B' : '#666'} 
            />
            {review.likes_count > 0 && (
              <Text style={styles.actionCount}>{review.likes_count}</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={toggleCommentSection}
          >
            <Ionicons 
              name="chatbubble-outline" 
              size={24} 
              color="#666" 
            />
            {review.comments_count > 0 && (
              <Text style={styles.actionCount}>{review.comments_count}</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // Yorumlar görünümü için içerik
  const renderCommentsContent = () => (
    <FlatList
      style={styles.scrollContent}
      data={comments}
      renderItem={renderCommentItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View>
          <View style={styles.commentsSectionHeader}>
            <TouchableOpacity 
              style={styles.backToReviewButton}
              onPress={() => setIsCommentsView(false)}
            >
              <Ionicons name="arrow-back" size={20} color="#666" />
              <Text style={styles.backToReviewText}>Back to Review</Text>
            </TouchableOpacity>
            <Text style={styles.commentsSectionTitle}>
              Comments ({review.comments_count})
            </Text>
          </View>
        </View>
      }
      ListEmptyComponent={
        isLoadingComments ? (
          <ActivityIndicator style={styles.commentsLoader} size="small" color="#4A80F0" />
        ) : (
          <Text style={styles.noCommentsText}>
            No comments yet. Be the first to comment!
          </Text>
        )
      }
      onEndReached={handleLoadMoreComments}
      onEndReachedThreshold={0.3}
      ListFooterComponent={
        isLoadingComments && comments.length > 0 ? (
          <ActivityIndicator 
            style={styles.loadMoreLoader} 
            size="small" 
            color="#4A80F0" 
          />
        ) : null
      }
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isCommentsView ? 'Comments' : 'Review'}
          </Text>
          <TouchableOpacity style={styles.headerRight}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        {/* Ana içerik - Koşullu olarak ya inceleme ya da yorumlar gösterilir */}
        {isCommentsView ? renderCommentsContent() : renderReviewContent()}
        
        {/* Comment input - Yorumlar gösterildiğinde */}
        {isCommentsView && (
          <View style={styles.commentInputContainer}>
            <Image 
              source={
                user?.user_metadata?.avatar_url 
                  ? { uri: user.user_metadata.avatar_url } 
                  : require('../../assets/images/default-avatar.png')
              } 
              style={styles.inputAvatar}
            />
            <TextInput
              ref={commentInputRef}
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                (!commentText.trim() || isSubmittingComment) && styles.disabledSendButton
              ]}
              onPress={handleSubmitComment}
              disabled={!commentText.trim() || isSubmittingComment}
            >
              {isSubmittingComment ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  goBackButton: {
    backgroundColor: '#4A80F0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  goBackButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  scrollContent: {
    flex: 1,
  },
  reviewCard: {
    padding: 16,
    backgroundColor: '#fff',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  ratingContainer: {
    marginBottom: 16,
  },
  content: {
    fontSize: 18,
    color: '#333',
    lineHeight: 28,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  reviewedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  reviewedItemText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionCount: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  commentsSection: {
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  commentsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  commentsLoader: {
    marginVertical: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUsername: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  loadMoreLoader: {
    marginVertical: 12,
  },
  noCommentsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A80F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  disabledSendButton: {
    backgroundColor: '#BDC3C7',
  },
  commentsSectionHeader: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backToReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backToReviewText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});

export default ReviewDetailScreen; 