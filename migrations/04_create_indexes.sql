-- Migration: 04_create_indexes.sql
-- Performans için indeksler oluşturma

-- Reviews tablosu için indeksler
CREATE INDEX IF NOT EXISTS idx_reviews_item ON public.reviews(item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);

-- Review comments tablosu için indeksler
CREATE INDEX IF NOT EXISTS idx_review_comments_review ON public.review_comments(review_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_user ON public.review_comments(user_id);

-- Review reactions tablosu için indeksler
CREATE INDEX IF NOT EXISTS idx_review_reactions_review ON public.review_reactions(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reactions_user ON public.review_reactions(user_id);

-- Review tags tablosu için indeksler
CREATE INDEX IF NOT EXISTS idx_review_tags_review ON public.review_tags(review_id);

-- Common tags tablosu için indeksler
CREATE INDEX IF NOT EXISTS idx_common_tags_item_type ON public.common_tags(item_type); 