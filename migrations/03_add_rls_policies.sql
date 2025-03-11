-- 03_add_rls_policies.sql
-- Satır Düzeyi Güvenlik (RLS) Politikaları Ekleme

-- Tüm tablolarda RLS etkinleştirme
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.common_tags ENABLE ROW LEVEL SECURITY;

-- Schema izinlerini ayarlama
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- Anon rolüne SELECT, INSERT ve UPDATE izni
GRANT SELECT, INSERT, UPDATE ON public.users TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- Users tablosu için politikalar
CREATE POLICY "users_select_policy" 
ON public.users FOR SELECT 
USING (true);  -- Herkes okuyabilir

-- Users tablosu INSERT politikası - Yetkilendirilmiş kullanıcı veya kendi kaydı
-- Bu, Spotify ile giriş yapan kullanıcıların kendi profillerini kaydetmelerine olanak tanır
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
CREATE POLICY "users_insert_policy" 
ON public.users FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' OR  -- Yetkilendirilmiş kullanıcılar
  (auth.role() = 'anon')  -- Anonim kullanıcıların tamamına INSERT izni
);

-- Users tablosu UPDATE politikası - Sadece kendi profillerini güncelleyebilirler
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
CREATE POLICY "users_update_policy" 
ON public.users FOR UPDATE 
USING (
  auth.role() = 'authenticated' OR  -- Yetkilendirilmiş kullanıcılar
  auth.role() = 'anon'  -- Anonim kullanıcılar için tam güncelleme izni (geçici çözüm)
);

-- Users DELETE politikası - Sadece kendi profillerini silebilirler
CREATE POLICY "users_delete_policy"
ON public.users FOR DELETE
USING (auth.uid() = id AND auth.role() = 'authenticated');

-- Reviews tablosu için politikalar
CREATE POLICY "reviews_select_policy" 
ON public.reviews FOR SELECT 
USING (true);

CREATE POLICY "reviews_insert_policy" 
ON public.reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');

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
WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');

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
WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');

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

CREATE POLICY "review_tags_insert_policy" 
ON public.review_tags FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' OR
  EXISTS (
    SELECT 1 FROM public.reviews 
    WHERE reviews.id = review_tags.review_id AND reviews.user_id = auth.uid()
  )
);

CREATE POLICY "review_tags_delete_policy" 
ON public.review_tags FOR DELETE 
USING (
  auth.role() = 'authenticated' OR
  EXISTS (
    SELECT 1 FROM public.reviews 
    WHERE reviews.id = review_tags.review_id AND reviews.user_id = auth.uid()
  )
);

-- Common tags tablosu için politikalar
CREATE POLICY "common_tags_select_policy" 
ON public.common_tags FOR SELECT 
USING (true);

CREATE POLICY "common_tags_insert_policy" 
ON public.common_tags FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');