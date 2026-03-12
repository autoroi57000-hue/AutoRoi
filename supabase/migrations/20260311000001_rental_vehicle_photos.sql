-- ─── rental_vehicle_photos table ──────────────────────────────────────────────
-- Separate photo table for rental vehicles (mirrors vehicle_photos for sale vehicles)

create table if not exists public.rental_vehicle_photos (
  id                uuid primary key default gen_random_uuid(),
  rental_vehicle_id uuid not null references public.rental_vehicles(id) on delete cascade,
  url               text not null,
  storage_path      text not null,
  is_primary        boolean not null default false,
  sort_order        integer not null default 0,
  width             integer,
  height            integer,
  size_bytes        integer,
  created_at        timestamptz not null default now()
);

create index if not exists rental_vehicle_photos_vehicle_id_idx
  on public.rental_vehicle_photos(rental_vehicle_id);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table public.rental_vehicle_photos enable row level security;

-- Single combined policy: admins and collaborateurs can do everything
create policy "rental_vehicle_photos_all_auth" on public.rental_vehicle_photos
  for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'collaborateur')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'collaborateur')
    )
  );

-- ─── Storage bucket: rental-vehicle-photos ────────────────────────────────────
-- Run in Supabase Dashboard > Storage > New bucket OR via the API:
--   Name: rental-vehicle-photos
--   Public: true (URLs are public; upload/delete requires auth)
--
-- Storage RLS policies (run in SQL Editor after creating the bucket):

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'rental-vehicle-photos',
  'rental-vehicle-photos',
  true,
  20971520,  -- 20 MB
  array['image/webp','image/jpeg','image/jpg','image/png','image/heic','image/heif']
)
on conflict (id) do nothing;

-- Authenticated users can upload
create policy "rental_photos_storage_insert" on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'rental-vehicle-photos');

-- Public read
create policy "rental_photos_storage_select" on storage.objects
  for select
  using (bucket_id = 'rental-vehicle-photos');

-- Authenticated users can delete
create policy "rental_photos_storage_delete" on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'rental-vehicle-photos');
