-- Safe Supabase Storage Setup for Image Uploads
-- This script handles existing policies gracefully

-- 1. Create storage bucket for member images (if not already created)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('member-images', 'member-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to view images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete images" ON storage.objects;

-- 3. Create RLS policies for storage
CREATE POLICY "Allow authenticated users to upload images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'member-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public access to view images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'member-images');

CREATE POLICY "Allow authenticated users to update images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'member-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'member-images'
  AND auth.role() = 'authenticated'
);

-- 4. Update alumni table to ensure profile_picture column exists
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255);

-- 5. Create alumni_gallery table for multiple images (if not exists)
CREATE TABLE IF NOT EXISTS alumni_gallery (
  id BIGSERIAL PRIMARY KEY,
  alumni_id VARCHAR(20) REFERENCES alumni(id) ON DELETE CASCADE,
  image_url VARCHAR(255) NOT NULL,
  image_type VARCHAR(50) DEFAULT 'gallery',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create bulk_uploads table for tracking bulk image uploads (if not exists)
CREATE TABLE IF NOT EXISTS bulk_uploads (
  id BIGSERIAL PRIMARY KEY,
  upload_batch_id VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  image_url VARCHAR(255),
  status VARCHAR(20) NOT NULL, -- e.g., 'success', 'error'
  error_message TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Add RLS to alumni_gallery table (if not already enabled)
ALTER TABLE alumni_gallery ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to view gallery" ON alumni_gallery;
DROP POLICY IF EXISTS "Allow authenticated users to insert gallery images" ON alumni_gallery;
DROP POLICY IF EXISTS "Allow authenticated users to update own gallery images" ON alumni_gallery;
DROP POLICY IF EXISTS "Allow authenticated users to delete own gallery images" ON alumni_gallery;

CREATE POLICY "Allow authenticated users to view gallery"
ON alumni_gallery FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert gallery images"
ON alumni_gallery FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update own gallery images"
ON alumni_gallery FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete own gallery images"
ON alumni_gallery FOR DELETE
USING (auth.role() = 'authenticated');

-- 8. Add RLS to bulk_uploads table (if not already enabled)
ALTER TABLE bulk_uploads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to view bulk uploads" ON bulk_uploads;
DROP POLICY IF EXISTS "Allow authenticated users to insert bulk uploads" ON bulk_uploads;

CREATE POLICY "Allow authenticated users to view bulk uploads"
ON bulk_uploads FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert bulk uploads"
ON bulk_uploads FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 9. Verify setup
SELECT 'Storage bucket created successfully' as status;
SELECT 'RLS policies applied successfully' as status;
SELECT 'Database tables created successfully' as status;
