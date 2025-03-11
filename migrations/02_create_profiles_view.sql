-- Migration: 02_create_profiles_view.sql
-- Kullanıcı profilleri için görünüm oluşturma

-- Profiller görünümü oluşturma
CREATE OR REPLACE VIEW public.profiles AS
SELECT 
  id,
  raw_user_meta_data->>'username' as username,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'avatar_url' as avatar_url
FROM auth.users;

-- Profiller görünümü için izinler
GRANT SELECT ON public.profiles TO anon, authenticated; 