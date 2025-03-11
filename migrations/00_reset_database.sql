-- 00_reset_database.sql
-- DİKKAT: Bu script mevcut tüm tabloları ve verileri silecektir!
-- Sadece tamamen yeniden başlamak istiyorsanız kullanın

-- Function to drop all policies from a table
CREATE OR REPLACE FUNCTION drop_all_policies(table_name text) RETURNS void AS $$
DECLARE
    policy_name text;
BEGIN
    FOR policy_name IN
        SELECT policyname FROM pg_policies WHERE tablename = table_name
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Views
DROP VIEW IF EXISTS public.profiles;

-- Tetikleyicileri kaldır
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Politikaları temizle
SELECT drop_all_policies('users');
SELECT drop_all_policies('reviews');
SELECT drop_all_policies('review_comments');
SELECT drop_all_policies('review_reactions');
SELECT drop_all_policies('review_tags');
SELECT drop_all_policies('common_tags');

-- İndeksleri sil
DROP INDEX IF EXISTS idx_reviews_item;
DROP INDEX IF EXISTS idx_reviews_user;
DROP INDEX IF EXISTS idx_review_comments_review;
DROP INDEX IF EXISTS idx_review_comments_user;
DROP INDEX IF EXISTS idx_review_reactions_review;
DROP INDEX IF EXISTS idx_review_reactions_user;
DROP INDEX IF EXISTS idx_review_tags_review;
DROP INDEX IF EXISTS idx_common_tags_item_type;

-- İlişkilendirilmiş tabloları sil (sıra önemli)
DROP TABLE IF EXISTS public.review_tags;
DROP TABLE IF EXISTS public.review_reactions;
DROP TABLE IF EXISTS public.review_comments;
DROP TABLE IF EXISTS public.reviews;
DROP TABLE IF EXISTS public.common_tags;
DROP TABLE IF EXISTS public.users;

-- Fonksiyonu temizle
DROP FUNCTION IF EXISTS drop_all_policies(text);