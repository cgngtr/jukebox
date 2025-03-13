import { supabase } from './supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * Generate a UUID v4 compatible string
 * @returns A UUID v4 string
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Define a simplified User interface that matches what we need for review creation
export interface UserBase {
  id: string;
}

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
  user: UserBase | SupabaseUser,
  itemId: string,
  itemType: 'album' | 'track' | 'artist',
  rating: number,
  content: string,
  tags: string[] = []
): Promise<Review | null> {
  try {
    console.log(`Creating review for ${itemType} (${itemId}) with rating ${rating}`);
    
    // Validate inputs
    if (!user || !user.id) {
      console.error('createReview: User not authenticated');
      throw new Error('User must be authenticated to create a review');
    }
    
    if (!itemId || !itemType) {
      console.error('createReview: Missing item information');
      throw new Error('Item ID and type are required');
    }
    
    if (rating < 1 || rating > 5) {
      console.error(`createReview: Invalid rating value: ${rating}`);
      throw new Error('Rating must be between 1 and 5');
    }
    
    if (!content.trim()) {
      console.error('createReview: Empty content');
      throw new Error('Review content cannot be empty');
    }

    // Önce oturum durumunu kontrol et
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // UUID formatını kontrol et ve gerekirse dönüştür
    let userId = user.id;
    
    // UUID formatı kontrolü (8-4-4-4-12 karakter formatı)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.log(`User ID ${userId} is not in UUID format, checking for Spotify user`);
      
      // Spotify ID'si ile kullanıcıyı ara
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('spotify_id', userId)
        .single();
      
      if (userData && userData.id) {
        console.log(`Found user with Spotify ID ${userId}, using database ID: ${userData.id}`);
        userId = userData.id;
      } else {
        // Kullanıcı bulunamadıysa ve bir Spotify ID formatındaysa, yeni bir kullanıcı oluştur
        console.log(`User with Spotify ID ${userId} not found in database, creating one`);
        
        // Benzersiz bir kullanıcı UUID'si oluştur
        const createUUID = () => generateUUID();
        
        const newUserId = createUUID();
        
        // Kullanıcıyı veritabanına ekle
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: newUserId,
            spotify_id: userId,
            display_name: `SpotifyUser_${userId.substring(0, 8)}`,
          })
          .select('id')
          .single();
          
        if (insertError || !newUser) {
          console.error('Failed to create new user:', insertError);
          throw new Error('Could not create user account. Please try again.');
        }
        
        console.log(`Created new user with ID: ${newUser.id}`);
        userId = newUser.id;
      }
    }
    
    let reviewResult;
    
    // Oturum aktif değilse veya geliştirme modundaysa, direkt olarak incelemeyi oluştur
    if (!session || process.env.NODE_ENV === 'development') {
      console.log('Creating review in development mode or without active session');
      
      // Benzersiz bir inceleme ID'si oluştur
      const reviewId = generateUUID();
      
      // İnceleme verilerini oluştur
      const reviewData = {
        id: reviewId,
        user_id: userId,
        item_id: itemId,
        item_type: itemType,
        rating: rating,
        content: content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Attempting to insert review:', reviewData);
      
      // İncelemeyi veritabanına ekle
      const { data: dbResult, error: dbError } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select()
        .single();
        
      if (dbError) {
        console.error('Error inserting review:', dbError);
        throw new Error('Failed to save review. Database error occurred.');
      } else {
        console.log('Review successfully created:', dbResult);
        reviewResult = { data: dbResult, error: null };
      }
    } else {
      // Normal kimlik doğrulamayla ekleme işlemi
      console.log('Creating review with authenticated session');
      reviewResult = await supabase
        .from('reviews')
        .insert({
          user_id: userId,
          item_id: itemId,
          item_type: itemType,
          rating,
          content,
        })
        .select()
        .single();
    }
    
    const { data: review, error } = reviewResult;
    
    if (error) {
      console.error('Error creating review:', error);
      throw error;
    }
    
    console.log(`Review created successfully with ID: ${review.id}`);
    
    // Insert tags if provided
    if (tags && tags.length > 0) {
      // Filter out any empty tags
      const validTags = tags.filter(tag => tag && tag.trim().length > 0);
      
      if (validTags.length > 0) {
        const tagObjects = validTags.map(tag => ({
          review_id: review.id,
          tag_name: tag.trim(),
        }));
        
        console.log(`Adding ${tagObjects.length} tags to review ${review.id}`);
        
        const { error: tagError } = await supabase
          .from('review_tags')
          .insert(tagObjects);
          
        if (tagError) {
          console.error('Error adding tags to review:', tagError);
          // Continue without tags if there's an error, the review is already created
          console.log('Continuing without tags due to error');
        } else {
          console.log('Tags added successfully');
        }
      }
    }
    
    return review;
  } catch (error) {
    console.error('Error in createReview:', error);
    throw error;
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
    console.log(`Fetching reviews for ${itemType} (${itemId}), page ${page}, limit ${limit}`);
    
    // Get reviews with basic information first
    const { data: reviews, count, error } = await supabase
      .from('reviews')
      .select(`
        *,
        comments_count:review_comments (count),
        likes_count:review_reactions (count),
        tags:review_tags (tag_name)
      `, { count: 'exact' })
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
    
    if (!reviews || reviews.length === 0) {
      console.log('No reviews found for this item');
      return { reviews: [], count: 0 };
    }
    
    console.log(`Found ${reviews.length} reviews, total count: ${count}`);
    
    // Get user information separately for each review
    const reviewsWithUserDetails = await Promise.all(
      reviews.map(async (review: any) => {
        // Fetch user info from auth.users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, display_name, avatar_url')
          .eq('id', review.user_id)
          .single();
          
        if (userError && userError.code !== 'PGRST116') {
          console.error(`Error fetching user info for review ${review.id}:`, userError);
        }
        
        // Format the data for frontend use
        return {
          ...review,
          user: userData 
            ? { 
                id: userData.id, 
                username: userData.display_name || 'Unknown User', 
                avatar_url: userData.avatar_url 
              }
            : { id: review.user_id, username: 'Unknown User', avatar_url: undefined },
          comments_count: review.comments_count?.[0]?.count || 0,
          likes_count: review.likes_count?.[0]?.count || 0,
          tags: review.tags?.map((tag: TagRow) => tag.tag_name) || [],
        };
      })
    );
    
    return { 
      reviews: reviewsWithUserDetails, 
      count: count || reviewsWithUserDetails.length 
    };
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
    console.log(`Fetching review details for ID: ${reviewId}`);
    
    // Fetch basic review information
    const { data: review, error } = await supabase
      .from('reviews')
      .select(`
        *,
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
    
    if (!review) {
      console.log(`Review with ID ${reviewId} not found`);
      return null;
    }
    
    // Fetch user information
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, display_name, avatar_url')
      .eq('id', review.user_id)
      .single();
      
    if (userError && userError.code !== 'PGRST116') {
      console.error(`Error fetching user info for review ${reviewId}:`, userError);
    }
    
    const reviewRow = review as ReviewRow;
    
    const formattedReview: ReviewWithDetails = {
      ...reviewRow,
      user: userData 
        ? { 
            id: userData.id, 
            username: userData.display_name || 'Unknown User', 
            avatar_url: userData.avatar_url 
          }
        : { id: review.user_id, username: 'Unknown User', avatar_url: undefined },
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
  user: UserBase | SupabaseUser,
  reviewId: string,
  reactionType: 'like' | 'love' | 'dislike'
): Promise<boolean> {
  try {
    if (!user || !user.id) {
      console.error('addReviewReaction: User not authenticated');
      throw new Error('User must be authenticated to add a reaction');
    }
    
    if (!reviewId) {
      console.error('addReviewReaction: Missing review ID');
      throw new Error('Review ID is required');
    }
    
    // Önce oturum durumunu kontrol et
    const { data: { session } } = await supabase.auth.getSession();
    
    // Önce mevcut reaksiyonu kontrol et (aynı kullanıcı aynı yoruma birden fazla reaksiyon ekleyemez)
    const { data: existingReaction, error: checkError } = await supabase
      .from('review_reactions')
      .select('id, reaction_type')
      .eq('user_id', user.id)
      .eq('review_id', reviewId)
      .maybeSingle();
    
    // RLS politikalarını aşmak için geçici SERVICE_ROLE ile işlem
    // NOT: Bu sadece test amaçlıdır, gerçek uygulamada SERVICE_ROLE kullanmak güvenlik açığı yaratabilir
    if (!session) {
      console.warn('No active session found, attempting to add reaction without authentication');
      
      // Mevcut reaksiyon kontrolü
      if (!checkError && existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          // Aynı reaksiyonu kaldır
          const { error: deleteError } = await supabase
            .from('review_reactions')
            .delete()
            .eq('id', existingReaction.id);
          
          if (deleteError) {
            console.error('Error removing reaction:', deleteError);
            throw deleteError;
          }
          
          return true;
        } else {
          // Farklı bir reaksiyon ekleniyorsa, önceki reaksiyonu yeni tiple güncelle
          const { error: updateError } = await supabase
            .from('review_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', existingReaction.id);
          
          if (updateError) {
            console.error('Error updating reaction:', updateError);
            throw updateError;
          }
          
          return true;
        }
      } else {
        // Yeni reaksiyon ekle
        const { error: insertError } = await supabase
          .from('review_reactions')
          .insert({
            user_id: user.id,
            review_id: reviewId,
            reaction_type: reactionType,
          });
        
        if (insertError) {
          console.error('Error adding reaction:', insertError);
          throw insertError;
        }
        
        return true;
      }
    } else {
      console.log('Active session found, adding reaction with authenticated user');
      
      // Normal işlem akışı (oturum açıkken)
      if (!checkError && existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          // Aynı reaksiyonu kaldır
          const { error } = await supabase
            .from('review_reactions')
            .delete()
            .eq('id', existingReaction.id);
          
          if (error) throw error;
        } else {
          // Farklı bir reaksiyon ekleniyorsa, önceki reaksiyonu yeni tiple güncelle
          const { error } = await supabase
            .from('review_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', existingReaction.id);
          
          if (error) throw error;
        }
      } else {
        // Yeni reaksiyon ekle
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
    }
  } catch (error) {
    console.error('Error adding review reaction:', error);
    return false;
  }
}

// Add a comment to a review
export async function addReviewComment(
  user: UserBase | SupabaseUser,
  reviewId: string,
  content: string
): Promise<ReviewComment | null> {
  try {
    if (!user || !user.id) {
      console.error('addReviewComment: User not authenticated');
      throw new Error('User must be authenticated to add a comment');
    }
    
    if (!reviewId) {
      console.error('addReviewComment: Missing review ID');
      throw new Error('Review ID is required');
    }
    
    if (!content.trim()) {
      console.error('addReviewComment: Empty content');
      throw new Error('Comment content cannot be empty');
    }
    
    // Önce oturum durumunu kontrol et
    const { data: { session } } = await supabase.auth.getSession();
    
    // RLS politikalarını aşmak için geçici SERVICE_ROLE ile insert
    // NOT: Bu sadece test amaçlıdır, gerçek uygulamada SERVICE_ROLE kullanmak güvenlik açığı yaratabilir
    let commentResult;
    
    if (!session) {
      console.warn('No active session found, attempting to create comment without authentication');
      
      // SERVICE_ROLE ile ekleme işlemi (normalde bu yöntem önerilmez, sadece geliştirme için)
      // Gerçek projelerde Supabase'in server-side RLS kurallarını doğru yapılandırın
      commentResult = await supabase
        .from('review_comments')
        .insert({
          user_id: user.id,
          review_id: reviewId,
          content,
        })
        .select()
        .single();
    } else {
      console.log('Active session found, creating comment with authenticated user');
      
      // Normal kimlik doğrulamayla ekleme işlemi
      commentResult = await supabase
        .from('review_comments')
        .insert({
          user_id: user.id,
          review_id: reviewId,
          content,
        })
        .select()
        .single();
    }
    
    const { data: comment, error } = commentResult;
      
    if (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
    
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
    console.log(`Fetching comments for review ${reviewId}, page ${page}, limit ${limit}`);
    
    // Get basic comment information
    const { data: comments, count, error } = await supabase
      .from('review_comments')
      .select('*', { count: 'exact' })
      .eq('review_id', reviewId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);
      
    if (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
    
    if (!comments || comments.length === 0) {
      console.log(`No comments found for review ${reviewId}`);
      return { comments: [], count: 0 };
    }
    
    // Get user details for each comment
    const commentsWithUserDetails = await Promise.all(
      comments.map(async (comment) => {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, display_name, avatar_url')
          .eq('id', comment.user_id)
          .single();
          
        if (userError && userError.code !== 'PGRST116') {
          console.error(`Error fetching user info for comment ${comment.id}:`, userError);
        }
        
        return {
          ...comment,
          user: userData 
            ? { 
                id: userData.id, 
                username: userData.display_name || 'Unknown User', 
                avatar_url: userData.avatar_url 
              }
            : { id: comment.user_id, username: 'Unknown User', avatar_url: undefined }
        };
      })
    );
    
    return { comments: commentsWithUserDetails, count: count || 0 };
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
    console.log(`Fetching reviews for user ${userId}, page ${page}, limit ${limit}`);
    
    // Get reviews with basic information
    const { data: reviews, count, error } = await supabase
      .from('reviews')
      .select(`
        *,
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
    
    if (!reviews || reviews.length === 0) {
      console.log(`No reviews found for user ${userId}`);
      return { reviews: [], count: 0 };
    }
    
    // Fetch user information 
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, display_name, avatar_url')
      .eq('id', userId)
      .single();
      
    if (userError && userError.code !== 'PGRST116') {
      console.error(`Error fetching user info:`, userError);
    }
    
    // Format the data for frontend use
    const formattedReviews: ReviewWithDetails[] = (reviews as ReviewRow[]).map((review: ReviewRow) => {
      return {
        ...review,
        user: userData 
          ? { 
              id: userData.id, 
              username: userData.display_name || 'Unknown User', 
              avatar_url: userData.avatar_url 
            }
          : { id: userId, username: 'Unknown User', avatar_url: undefined },
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