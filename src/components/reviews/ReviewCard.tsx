import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { format, formatDistanceToNow } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ReviewWithDetails } from '../../api/reviews';
import RatingStars from './RatingStars';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius } from '../../styles';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface ReviewCardProps {
  review: ReviewWithDetails;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onPress?: () => void;
  compact?: boolean; // For compact display in lists
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onLike,
  onComment,
  onShare,
  onPress,
  compact = false,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  
  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // If it's less than a week old, show "X days ago"
    const isRecent = Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000;
    return isRecent
      ? formatDistanceToNow(date, { addSuffix: true })
      : format(date, 'MMM d, yyyy');
  };

  // Navigate to user profile
  const handleUserPress = () => {
    navigation.navigate('Profile', { userId: review.user.id });
  };
  
  // Determine if the user has reacted to this review
  const hasLiked = review.user_reaction === 'like';
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        compact && styles.compactContainer,
        { 
          backgroundColor: theme.colors.card,
          shadowColor: theme.colors.text.primary,
          borderColor: theme.colors.divider
        }
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Header with user info and date */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.userInfo} onPress={handleUserPress}>
          <Image 
            source={
              review.user.avatar_url 
                ? { uri: review.user.avatar_url } 
                : require('../../assets/images/default-avatar.png')
            } 
            style={styles.avatar}
          />
          <View>
            <Text style={[styles.username, { color: theme.colors.text.primary }]}>
              {review.user.username}
            </Text>
            <Text style={[styles.date, { color: theme.colors.text.secondary }]}>
              {formatDate(review.created_at)}
            </Text>
          </View>
        </TouchableOpacity>
        
        <RatingStars rating={review.rating} size={compact ? 16 : 20} />
      </View>
      
      {/* Review content */}
      {!compact && (
        <Text 
          style={[styles.content, { color: theme.colors.text.primary }]}
          numberOfLines={compact ? 2 : undefined}
        >
          {review.content}
        </Text>
      )}
      
      {/* Tags */}
      {!compact && review.tags && review.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {review.tags.map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: `${theme.colors.primary}20` }]}>
              <Text style={[styles.tagText, { color: theme.colors.primary }]}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}
      
      {/* Footer with interaction buttons */}
      <View style={[styles.footer, { borderTopColor: theme.colors.divider }]}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onLike}
        >
          <Ionicons 
            name={hasLiked ? 'heart' : 'heart-outline'} 
            size={compact ? 18 : 22} 
            color={hasLiked ? theme.colors.secondary : theme.colors.text.secondary} 
          />
          {review.likes_count > 0 && (
            <Text style={[styles.actionCount, { color: theme.colors.text.secondary }]}>
              {review.likes_count}
            </Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onComment}
        >
          <Ionicons 
            name="chatbubble-outline" 
            size={compact ? 18 : 22} 
            color={theme.colors.text.secondary} 
          />
          {review.comments_count > 0 && (
            <Text style={[styles.actionCount, { color: theme.colors.text.secondary }]}>
              {review.comments_count}
            </Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onShare}
        >
          <Ionicons 
            name="share-outline" 
            size={compact ? 18 : 22} 
            color={theme.colors.text.secondary} 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  compactContainer: {
    padding: 12,
    marginBottom: 8,
  },
  header: {
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
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontWeight: '600',
    fontSize: 16,
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionCount: {
    marginLeft: 6,
    fontSize: 14,
  },
});

export default ReviewCard; 