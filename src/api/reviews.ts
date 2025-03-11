import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

// Define types for our review-related data
export interface Review {
  id: string;
  user_id: string;
  item_id: string;
  item_type: 'album' | 'track' | 'artist';
  rating: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewComment {
  id: string;
  review_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface ReviewReaction {
  id: string;
  review_id: string;
  user_id: string;
  reaction_type: 'like' | 'love' | 'dislike';
  created_at: string;
}

export interface ReviewTag {
  id: string;
  review_id: string;
  tag_name: string;
}

export interface ReviewWithDetails extends Review {
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  comments_count: number;
  likes_count: number;
  user_reaction?: string;
  tags: string[];
}

// Type definitions for database responses
interface UserRow {
  id: string;
  username: string;
  avatar_url?: string;
}

interface CommentCountRow {
  count: number;
}

interface LikeCountRow {
  count: number;
}

interface TagRow {
  tag_name: string;
}

interface ReviewRow extends Review {
  user: UserRow;
  comments_count: CommentCountRow[];
  likes_count: LikeCountRow[];
  tags: TagRow[];
}

interface ReactionRow {
  review_id: string;
  reaction_type: 'like' | 'love' | 'dislike';
}

// Create a new review
export async function createReview(
  user: User,
  itemId: string,
  itemType: 'album' | 'track' | 'artist',
  rating: number,
  content: string,
  tags: string[] = []
): Promise<Review | null> {
  try {
    // Insert the review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        item_id: itemId,
        item_type: itemType,
        rating,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    
    // Insert tags if provided
    if (tags.length > 0) {
      const tagObjects = tags.map(tag => ({
        review_id: review.id,
        tag_name: tag,
      }));
      
      const { error: tagError } = await supabase
        .from('review_tags')
        .insert(tagObjects);
        
      if (tagError) throw tagError;
    }
    
    return review;
  } catch (error) {
    console.error('Error creating review:', error);
    return null;
  }
}

// Get reviews for a specific item (album, track, artist)
export async function getReviewsByItem(
  itemId: string,
  itemType: 'album' | 'track' | 'artist',
  page = 1,
  limit = 10,
  userId?: string
): Promise<{ reviews: ReviewWithDetails[]; count: number }> {
  const offset = (page - 1) * limit;
  
  try {
    // Get reviews with user details and counts
    let query = supabase
      .from('reviews')
      .select(`
        *,
        user:profiles (id, username, avatar_url),
        comments_count:review_comments (count),
        likes_count:review_reactions (count),
        tags:review_tags (tag_name)
      `, { count: 'exact' })
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data: reviews, count, error } = await query;
    
    if (error) {
      console.error('Error fetching reviews:', error);
      return { reviews: [], count: 0 };
    }
    
    // Format the data for frontend use
    const formattedReviews: ReviewWithDetails[] = (reviews as ReviewRow[]).map((review: ReviewRow) => {
      return {
        ...review,
        user: review.user || { id: '', username: 'Unknown User', avatar_url: undefined },
        comments_count: review.comments_count?.[0]?.count || 0,
        likes_count: review.likes_count?.[0]?.count || 0,
        tags: review.tags?.map((tag: TagRow) => tag.tag_name) || [],
      };
    });
    
    // If userId is provided, get the user's reactions to these reviews
    if (userId && formattedReviews.length > 0) {
      const reviewIds = formattedReviews.map(review => review.id);
      const { data: userReactions, error: reactionsError } = await supabase
        .from('review_reactions')
        .select('review_id, reaction_type')
        .eq('user_id', userId)
        .in('review_id', reviewIds);
        
      if (!reactionsError && userReactions) {
        const reactionsMap = new Map<string, string>(
          (userReactions as ReactionRow[]).map((reaction: ReactionRow) => [reaction.review_id, reaction.reaction_type])
        );
        
        formattedReviews.forEach(review => {
          review.user_reaction = reactionsMap.get(review.id);
        });
      }
    }
    
    return { reviews: formattedReviews, count: count || 0 };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return { reviews: [], count: 0 };
  }
}

// Get a single review by ID
export async function getReviewById(
  reviewId: string,
  userId?: string
): Promise<ReviewWithDetails | null> {
  try {
    const { data: review, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles (id, username, avatar_url),
        comments_count:review_comments (count),
        likes_count:review_reactions (count),
        tags:review_tags (tag_name)
      `)
      .eq('id', reviewId)
      .single();
    
    if (error) {
      console.error('Error fetching review:', error);
      return null;
    }
    
    const reviewRow = review as ReviewRow;
    
    const formattedReview: ReviewWithDetails = {
      ...reviewRow,
      user: reviewRow.user || { id: '', username: 'Unknown User', avatar_url: undefined },
      comments_count: reviewRow.comments_count?.[0]?.count || 0,
      likes_count: reviewRow.likes_count?.[0]?.count || 0,
      tags: reviewRow.tags?.map((tag: TagRow) => tag.tag_name) || [],
    };
    
    // If userId is provided, get the user's reaction to this review
    if (userId) {
      const { data: userReaction, error: reactionError } = await supabase
        .from('review_reactions')
        .select('reaction_type')
        .eq('user_id', userId)
        .eq('review_id', reviewId)
        .single();
        
      if (!reactionError && userReaction) {
        formattedReview.user_reaction = userReaction.reaction_type as string;
      }
    }
    
    return formattedReview;
  } catch (error) {
    console.error('Error fetching review:', error);
    return null;
  }
}

// Update an existing review
export async function updateReview(
  reviewId: string,
  userId: string,
  updates: {
    rating?: number;
    content?: string;
    tags?: string[];
  }
): Promise<boolean> {
  try {
    // Only update the review fields if they're provided
    const reviewUpdates: any = {};
    if (updates.rating !== undefined) reviewUpdates.rating = updates.rating;
    if (updates.content !== undefined) reviewUpdates.content = updates.content;
    reviewUpdates.updated_at = new Date().toISOString();
    
    // Update the review
    if (Object.keys(reviewUpdates).length > 0) {
      const { error } = await supabase
        .from('reviews')
        .update(reviewUpdates)
        .eq('id', reviewId)
        .eq('user_id', userId); // Ensure the user can only update their own reviews
        
      if (error) throw error;
    }
    
    // Update tags if provided
    if (updates.tags !== undefined) {
      // First delete existing tags
      const { error: deleteError } = await supabase
        .from('review_tags')
        .delete()
        .eq('review_id', reviewId);
        
      if (deleteError) throw deleteError;
      
      // Then insert new tags
      if (updates.tags.length > 0) {
        const tagObjects = updates.tags.map(tag => ({
          review_id: reviewId,
          tag_name: tag,
        }));
        
        const { error: insertError } = await supabase
          .from('review_tags')
          .insert(tagObjects);
          
        if (insertError) throw insertError;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating review:', error);
    return false;
  }
}

// Delete a review
export async function deleteReview(
  reviewId: string,
  userId: string
): Promise<boolean> {
  try {
    // Delete the review (cascade will handle related records)
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', userId); // Ensure the user can only delete their own reviews
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    return false;
  }
}

// Add reaction to a review (like, love, dislike)
export async function addReviewReaction(
  user: User,
  reviewId: string,
  reactionType: 'like' | 'love' | 'dislike'
): Promise<boolean> {
  try {
    // Check if the user already has a reaction to this review
    const { data: existingReaction } = await supabase
      .from('review_reactions')
      .select('id, reaction_type')
      .eq('user_id', user.id)
      .eq('review_id', reviewId)
      .single();
    
    if (existingReaction) {
      // If the reaction is the same, remove it (toggle off)
      if (existingReaction.reaction_type === reactionType) {
        const { error } = await supabase
          .from('review_reactions')
          .delete()
          .eq('id', existingReaction.id);
          
        if (error) throw error;
      } else {
        // If the reaction is different, update it
        const { error } = await supabase
          .from('review_reactions')
          .update({ reaction_type: reactionType })
          .eq('id', existingReaction.id);
          
        if (error) throw error;
      }
    } else {
      // If no existing reaction, create a new one
      const { error } = await supabase
        .from('review_reactions')
        .insert({
          user_id: user.id,
          review_id: reviewId,
          reaction_type: reactionType,
        });
        
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error adding review reaction:', error);
    return false;
  }
}

// Add a comment to a review
export async function addReviewComment(
  user: User,
  reviewId: string,
  content: string
): Promise<ReviewComment | null> {
  try {
    const { data: comment, error } = await supabase
      .from('review_comments')
      .insert({
        user_id: user.id,
        review_id: reviewId,
        content,
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return comment as ReviewComment;
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
}

// Get comments for a review
export async function getReviewComments(
  reviewId: string,
  page = 1,
  limit = 20
): Promise<{ comments: any[]; count: number }> {
  const offset = (page - 1) * limit;
  
  try {
    const { data: comments, count, error } = await supabase
      .from('review_comments')
      .select(`
        *,
        user:user_id (id, username, avatar_url)
      `, { count: 'exact' })
      .eq('review_id', reviewId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);
      
    if (error) throw error;
    
    return { comments: comments || [], count: count || 0 };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { comments: [], count: 0 };
  }
}

// Get reviews created by a user
export async function getUserReviews(
  userId: string,
  page = 1,
  limit = 10
): Promise<{ reviews: ReviewWithDetails[]; count: number }> {
  const offset = (page - 1) * limit;
  
  try {
    const { data: reviews, count, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles (id, username, avatar_url),
        comments_count:review_comments (count),
        likes_count:review_reactions (count),
        tags:review_tags (tag_name)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) {
      console.error('Error fetching user reviews:', error);
      return { reviews: [], count: 0 };
    }
    
    // Format the data for frontend use
    const formattedReviews: ReviewWithDetails[] = (reviews as ReviewRow[]).map((review: ReviewRow) => {
      return {
        ...review,
        user: review.user || { id: userId, username: 'Unknown User', avatar_url: undefined },
        comments_count: review.comments_count?.[0]?.count || 0,
        likes_count: review.likes_count?.[0]?.count || 0,
        tags: review.tags?.map((tag: TagRow) => tag.tag_name) || [],
      };
    });
    
    return { reviews: formattedReviews, count: count || 0 };
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return { reviews: [], count: 0 };
  }
} 