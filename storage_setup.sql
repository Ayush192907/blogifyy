-- 1. Create a public storage bucket named 'blog-images' if it doesn't already exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Clean up existing policies for the 'blog-images' bucket to prevent duplicate errors
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Access" ON storage.objects;

-- 3. Configure policies for the 'blog-images' bucket

-- Enable select (read) policy for anyone
CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

-- Enable insert (upload) policy for authenticated users
CREATE POLICY "Authenticated Insert Access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- Enable update policy for authenticated users
CREATE POLICY "Authenticated Update Access" ON storage.objects
  FOR UPDATE USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- Enable delete policy for authenticated users
CREATE POLICY "Authenticated Delete Access" ON storage.objects
  FOR DELETE USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
