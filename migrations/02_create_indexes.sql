-- 02_create_indexes.sql
-- Performans için indeksler oluşturma

-- Reviews tablosu için indeksler
CREATE INDEX IF NOT EXISTS idx_reviews_item_type ON public.reviews(item_type);
CREATE INDEX IF NOT EXISTS idx_reviews_item_id ON public.reviews(item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_item_combined ON public.reviews(item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);

-- Review comments tablosu için indeksler
CREATE INDEX IF NOT EXISTS idx_review_comments_review_id ON public.review_comments(review_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_user_id ON public.review_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_created_at ON public.review_comments(created_at);

-- Review reactions tablosu için indeksler
CREATE INDEX IF NOT EXISTS idx_review_reactions_review_id ON public.review_reactions(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reactions_user_id ON public.review_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_review_reactions_type ON public.review_reactions(reaction_type);
CREATE INDEX IF NOT EXISTS idx_review_reactions_review_user ON public.review_reactions(review_id, user_id);

-- Review tags tablosu için indeksler
CREATE INDEX IF NOT EXISTS idx_review_tags_review_id ON public.review_tags(review_id);
CREATE INDEX IF NOT EXISTS idx_review_tags_tag_name ON public.review_tags(tag_name);

-- Common tags tablosu için indeksler (eğer oluşturduysanız)
CREATE INDEX IF NOT EXISTS idx_common_tags_item_type ON public.common_tags(item_type);
CREATE INDEX IF NOT EXISTS idx_common_tags_frequency ON public.common_tags(frequency DESC);
CREATE INDEX IF NOT EXISTS idx_common_tags_name ON public.common_tags(name);

-- Users tablosu için indeksler
CREATE INDEX IF NOT EXISTS idx_users_spotify_id ON public.users(spotify_id);
CREATE INDEX IF NOT EXISTS idx_users_display_name ON public.users(display_name);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON public.users(last_login DESC);

-- Full-text arama için indeksler (PostgreSQL'in built-in full-text search özelliğini kullanarak)
-- Reviews içerik araması için
CREATE INDEX IF NOT EXISTS idx_reviews_content_search ON public.reviews USING gin(to_tsvector('simple', content));

-- Common tags adları için full-text arama
CREATE INDEX IF NOT EXISTS idx_common_tags_name_search ON public.common_tags USING gin(to_tsvector('simple', name));