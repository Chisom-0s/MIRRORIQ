-- ═══════════════════════════════════════════════════════════
-- Supabase Storage Buckets Configuration
-- ═══════════════════════════════════════════════════════════

-- 1. Create Storage Buckets
insert into storage.buckets (id, name, public)
values
  ('mirroriq-products', 'mirroriq-products', true),
  ('mirroriq-results', 'mirroriq-results', true),
  ('mirroriq-selfies', 'mirroriq-selfies', false)
on conflict (id) do nothing;

-- 2. Storage Policies

-- Products Bucket: Publicly readable, admin insert
create policy "Public Access to Product Images"
  on storage.objects for select
  using (bucket_id = 'mirroriq-products');

create policy "Service Role can upload Product Images"
  on storage.objects for insert
  with check (bucket_id = 'mirroriq-products');

-- Results Bucket: Publicly readable
create policy "Public Access to Simulation Previews"
  on storage.objects for select
  using (bucket_id = 'mirroriq-results');

create policy "Service Role can upload Simulation Previews"
  on storage.objects for insert
  with check (bucket_id = 'mirroriq-results');

-- Selfies Bucket: Private (only authenticated owner or service role)
create policy "Users can upload their own selfies"
  on storage.objects for insert
  with check (bucket_id = 'mirroriq-selfies' and (auth.uid() = owner or auth.uid() is not null));

create policy "Users can access their own selfies"
  on storage.objects for select
  using (bucket_id = 'mirroriq-selfies' and (auth.uid() = owner));
