-- Create classes bucket.
insert into storage.buckets
  (id, name)
values
  ('classes', 'classes')
on conflict (id) do nothing;

CREATE POLICY "Enable select to authenticated for classes bucket" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'classes');

CREATE POLICY "Enable insert to authenticated for classes bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'classes');

CREATE POLICY "Enable update to authenticated for classes bucket" ON storage.objects FOR UPDATE TO authenticated WITH CHECK (bucket_id = 'classes');

CREATE POLICY "Enable delete to authenticated for classes bucket" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'classes');