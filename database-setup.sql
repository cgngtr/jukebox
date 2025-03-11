-- Create tables for the review system

-- Users table (if not already exists - Supabase provides this by default)
-- This is just for reference, don't run this part if you're using Supabase Auth
/*
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('album', 'track', 'artist')),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review comments table
CREATE TABLE IF NOT EXISTS public.review_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review reactions table
CREATE TABLE IF NOT EXISTS public.review_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Review tags table
CREATE TABLE IF NOT EXISTS public.review_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  UNIQUE(review_id, tag_name)
);

-- Common tags table (for tag suggestions)
CREATE TABLE IF NOT EXISTS public.common_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  item_type TEXT NOT NULL CHECK (item_type IN ('album', 'track', 'artist')),
  frequency INTEGER NOT NULL DEFAULT 1
);

-- Add some initial common tags
INSERT INTO public.common_tags (name, item_type, frequency)
VALUES 
  ('catchy', 'track', 10),
  ('relaxing', 'track', 8),
  ('energetic', 'track', 7),
  ('emotional', 'track', 6),
  ('melodic', 'track', 5),
  ('upbeat', 'album', 10),
  ('cohesive', 'album', 8),
  ('experimental', 'album', 7),
  ('classic', 'album', 6),
  ('innovative', 'album', 5),
  ('versatile', 'artist', 10),
  ('talented', 'artist', 8),
  ('unique', 'artist', 7),
  ('consistent', 'artist', 6),
  ('authentic', 'artist', 5);

-- Create RLS policies for security

-- Enable RLS on all tables
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.common_tags ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

-- Allow users to create their own reviews
CREATE POLICY "Users can create their own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own reviews
CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own reviews
CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Allow authenticated users to view all review comments
CREATE POLICY "Anyone can view review comments" ON public.review_comments
  FOR SELECT USING (true);

-- Allow users to create their own comments
CREATE POLICY "Users can create their own comments" ON public.review_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own comments
CREATE POLICY "Users can update their own comments" ON public.review_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments" ON public.review_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Allow authenticated users to view all reactions
CREATE POLICY "Anyone can view reactions" ON public.review_reactions
  FOR SELECT USING (true);

-- Allow users to create their own reactions
CREATE POLICY "Users can create their own reactions" ON public.review_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own reactions
CREATE POLICY "Users can update their own reactions" ON public.review_reactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own reactions
CREATE POLICY "Users can delete their own reactions" ON public.review_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Allow anyone to view tags
CREATE POLICY "Anyone can view tags" ON public.review_tags
  FOR SELECT USING (true);

-- Allow anyone to view common tags
CREATE POLICY "Anyone can view common tags" ON public.common_tags
  FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_item ON public.reviews(item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_review ON public.review_comments(review_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_user ON public.review_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_review_reactions_review ON public.review_reactions(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reactions_user ON public.review_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_review_tags_review ON public.review_tags(review_id);
CREATE INDEX IF NOT EXISTS idx_common_tags_item_type ON public.common_tags(item_type);

-- Create public profiles view
CREATE OR REPLACE VIEW public.profiles AS
SELECT 
  id,
  raw_user_meta_data->>'username' as username,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'avatar_url' as avatar_url
FROM auth.users;

-- Grant permissions for authenticated users
ALTER TABLE public.profiles OWNER TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon; 