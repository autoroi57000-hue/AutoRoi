-- =============================================================================
-- Create the 'contracts' storage bucket for rental contract PDFs
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contracts',
  'contracts',
  false,
  10485760, -- 10 MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users (admins) to upload/read contracts
CREATE POLICY "Admins can upload contracts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'contracts');

CREATE POLICY "Admins can update contracts"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'contracts');

CREATE POLICY "Admins can read contracts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'contracts');

CREATE POLICY "Admins can delete contracts"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'contracts');
