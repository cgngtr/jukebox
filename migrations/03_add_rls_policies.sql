-- Migration: 03_add_rls_policies.sql
-- Satır Düzeyi Güvenlik (RLS) Politikaları Ekleme

-- Tüm tablolarda RLS etkinleştirme
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.common_tags ENABLE ROW LEVEL SECURITY;

-- Reviews tablosu için politikalar
CREATE POLICY "reviews_select_policy" 
ON public.reviews FOR SELECT 
USING (true);

CREATE POLICY "reviews_insert_policy" 
ON public.reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_policy" 
ON public.reviews FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "reviews_delete_policy" 
ON public.reviews FOR DELETE 
USING (auth.uid() = user_id);

-- Review comments tablosu için politikalar
CREATE POLICY "review_comments_select_policy" 
ON public.review_comments FOR SELECT 
USING (true);

CREATE POLICY "review_comments_insert_policy" 
ON public.review_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "review_comments_update_policy" 
ON public.review_comments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "review_comments_delete_policy" 
ON public.review_comments FOR DELETE 
USING (auth.uid() = user_id);

-- Review reactions tablosu için politikalar
CREATE POLICY "review_reactions_select_policy" 
ON public.review_reactions FOR SELECT 
USING (true);

CREATE POLICY "review_reactions_insert_policy" 
ON public.review_reactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "review_reactions_update_policy" 
ON public.review_reactions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "review_reactions_delete_policy" 
ON public.review_reactions FOR DELETE 
USING (auth.uid() = user_id);

-- Review tags tablosu için politikalar
CREATE POLICY "review_tags_select_policy" 
ON public.review_tags FOR SELECT 
USING (true);

-- Common tags tablosu için politikalar
CREATE POLICY "common_tags_select_policy" 
ON public.common_tags FOR SELECT 
USING (true); 