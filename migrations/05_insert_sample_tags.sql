-- Migration: 05_insert_sample_tags.sql
-- Örnek etiketler ekleme

-- Şarkılar için örnek etiketler
INSERT INTO public.common_tags (name, item_type, frequency)
VALUES 
  ('catchy', 'track', 10),
  ('relaxing', 'track', 8),
  ('energetic', 'track', 7),
  ('emotional', 'track', 6),
  ('melodic', 'track', 5),
  ('repetitive', 'track', 4),
  ('uplifting', 'track', 4),
  ('nostalgic', 'track', 3),
  ('intense', 'track', 3),
  ('chill', 'track', 3)
ON CONFLICT (name) DO NOTHING;

-- Albümler için örnek etiketler
INSERT INTO public.common_tags (name, item_type, frequency)
VALUES 
  ('upbeat', 'album', 10),
  ('cohesive', 'album', 8),
  ('experimental', 'album', 7),
  ('classic', 'album', 6),
  ('innovative', 'album', 5),
  ('varied', 'album', 4),
  ('conceptual', 'album', 4),
  ('atmospheric', 'album', 3),
  ('introspective', 'album', 3),
  ('raw', 'album', 3)
ON CONFLICT (name) DO NOTHING;

-- Sanatçılar için örnek etiketler
INSERT INTO public.common_tags (name, item_type, frequency)
VALUES 
  ('versatile', 'artist', 10),
  ('talented', 'artist', 8),
  ('unique', 'artist', 7),
  ('consistent', 'artist', 6),
  ('authentic', 'artist', 5),
  ('innovative', 'artist', 4),
  ('influential', 'artist', 4),
  ('underrated', 'artist', 3),
  ('legendary', 'artist', 3),
  ('charismatic', 'artist', 3)
ON CONFLICT (name) DO NOTHING; 