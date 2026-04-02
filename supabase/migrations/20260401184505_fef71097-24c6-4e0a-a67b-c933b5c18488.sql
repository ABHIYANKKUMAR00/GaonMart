
INSERT INTO storage.buckets (id, name, public)
VALUES ('registration-docs', 'registration-docs', true);

CREATE POLICY "Anyone can view registration docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'registration-docs');

CREATE POLICY "Authenticated users can upload their own docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'registration-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own docs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'registration-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own docs"
ON storage.objects FOR DELETE
USING (bucket_id = 'registration-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
