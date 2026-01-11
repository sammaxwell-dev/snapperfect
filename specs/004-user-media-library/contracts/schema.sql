-- ============================================
-- User Media Library Schema
-- Feature: 004-user-media-library
-- ============================================

-- Enum types
CREATE TYPE media_type AS ENUM ('image', 'video');
CREATE TYPE generation_source AS ENUM ('product-enhance', 'fashion-motion', 'generate', 'angles');

-- ============================================
-- Table: library_items
-- ============================================
CREATE TABLE public.library_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    media_type media_type NOT NULL,
    metadata JSONB DEFAULT '{}',
    file_size INTEGER DEFAULT 0,
    source generation_source NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.library_items IS 'Stores metadata for user-generated images and videos';
COMMENT ON COLUMN public.library_items.storage_path IS 'Full path in user-media bucket: {user_id}/{filename}';
COMMENT ON COLUMN public.library_items.metadata IS 'JSON with prompt, model, seed, aspect_ratio, style, platform';

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_library_items_user_id ON library_items(user_id);
CREATE INDEX idx_library_items_created_at ON library_items(created_at DESC);
CREATE INDEX idx_library_items_media_type ON library_items(media_type);
CREATE INDEX idx_library_items_user_created ON library_items(user_id, created_at DESC);

-- ============================================
-- Enable RLS
-- ============================================
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies: library_items
-- ============================================

-- SELECT: Users can only view their own items
CREATE POLICY "Users can view own library items"
ON library_items FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can only insert items for themselves
CREATE POLICY "Users can insert own library items"
ON library_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own items
CREATE POLICY "Users can delete own library items"
ON library_items FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- Storage Bucket: user-media (private)
-- ============================================

-- Create private bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-media', 'user-media', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- RLS Policies: storage.objects (user-media bucket)
-- ============================================

-- SELECT: Users can view files in their own folder
CREATE POLICY "Users can view own media files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'user-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- INSERT: Users can upload to their own folder only
CREATE POLICY "Users can upload to own media folder"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'user-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- DELETE: Users can delete files from their own folder
CREATE POLICY "Users can delete own media files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'user-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
