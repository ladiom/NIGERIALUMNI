-- Supabase Storage Setup for Image Uploads
-- Run this in your Supabase SQL Editor

-- 1. Create storage bucket for member images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('member-images', 'member-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create RLS policies for storage
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'member-images' 
  AND auth.role() = 'authenticated'
);

-- Allow public access to view images
CREATE POLICY "Allow public access to view images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'member-images');

-- Allow users to update their own images
CREATE POLICY "Allow users to update own images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'member-images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own images
CREATE POLICY "Allow users to delete own images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'member-images' 
  AND auth.role() = 'authenticated'
);

-- 3. Create alumni_gallery table for multiple images per alumni
CREATE TABLE IF NOT EXISTS alumni_gallery (
  id BIGSERIAL PRIMARY KEY,
  alumni_id VARCHAR(20) REFERENCES alumni(id) ON DELETE CASCADE,
  image_url VARCHAR(255) NOT NULL,
  image_type VARCHAR(50) DEFAULT 'gallery',
  uploaded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create bulk_uploads table for tracking bulk uploads
CREATE TABLE IF NOT EXISTS bulk_uploads (
  id BIGSERIAL PRIMARY KEY,
  upload_batch_id VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  image_url VARCHAR(255),
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error', 'pending')),
  error_message TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_alumni_gallery_alumni_id ON alumni_gallery(alumni_id);
CREATE INDEX IF NOT EXISTS idx_bulk_uploads_batch_id ON bulk_uploads(upload_batch_id);
CREATE INDEX IF NOT EXISTS idx_bulk_uploads_status ON bulk_uploads(status);

-- 6. Create RLS policies for new tables
-- Alumni gallery policies
CREATE POLICY "Allow public to view gallery images" 
ON alumni_gallery FOR SELECT 
USING (true);

CREATE POLICY "Allow alumni to manage their own gallery" 
ON alumni_gallery FOR ALL 
USING (
  auth.role() = 'authenticated' 
  AND alumni_id IN (
    SELECT id FROM alumni WHERE id = auth.jwt() ->> 'alumni_id'
  )
);

-- Bulk uploads policies
CREATE POLICY "Allow authenticated users to view their uploads" 
ON bulk_uploads FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to create upload records" 
ON bulk_uploads FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 7. Create function to clean up old failed uploads (optional)
CREATE OR REPLACE FUNCTION cleanup_failed_uploads()
RETURNS void AS $$
BEGIN
  DELETE FROM bulk_uploads 
  WHERE status = 'error' 
  AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to get alumni profile with gallery
CREATE OR REPLACE FUNCTION get_alumni_with_gallery(alumni_id_param VARCHAR(20))
RETURNS TABLE (
  id VARCHAR(20),
  full_name VARCHAR(255),
  profile_picture VARCHAR(255),
  school_name VARCHAR(255),
  gallery_images JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.full_name,
    a.profile_picture,
    s.name as school_name,
    COALESCE(
      json_agg(
        json_build_object(
          'id', ag.id,
          'image_url', ag.image_url,
          'image_type', ag.image_type,
          'uploaded_at', ag.uploaded_at
        )
      ) FILTER (WHERE ag.id IS NOT NULL),
      '[]'::json
    ) as gallery_images
  FROM alumni a
  LEFT JOIN schools s ON a.school_id = s.id
  LEFT JOIN alumni_gallery ag ON a.id = ag.alumni_id
  WHERE a.id = alumni_id_param
  GROUP BY a.id, a.full_name, a.profile_picture, s.name;
END;
$$ LANGUAGE plpgsql;

-- 9. Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON alumni_gallery TO authenticated;
GRANT ALL ON bulk_uploads TO authenticated;

-- 10. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_alumni_gallery_updated_at
  BEFORE UPDATE ON alumni_gallery
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Supabase Storage setup completed successfully!' as message;
