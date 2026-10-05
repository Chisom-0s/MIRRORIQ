-- ─── MirrorIQ Database Schema ──────────────────────────────
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  email text,
  selfie_url text,
  selfie_file_id text,
  undertone text default 'Warm Neutral',
  contrast_ratio text default 'High',
  metadata jsonb default '{}'::jsonb
);

-- 2. Analyses Table
create table if not exists public.analyses (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  profile_id uuid references public.profiles(id) on delete set null,
  product_name text not null,
  product_brand text,
  product_category text,
  product_price text,
  product_image_url text not null,
  preview_image_url text,
  confidence_score integer not null,
  verdict text not null default 'recommended',
  factors jsonb default '[]'::jsonb,
  recommendation text,
  alternatives jsonb default '[]'::jsonb,
  raw_youcam_result jsonb default '{}'::jsonb
);

-- 3. Comparisons Table
create table if not exists public.comparisons (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  profile_id uuid references public.profiles(id) on delete set null,
  primary_analysis_id uuid references public.analyses(id) on delete cascade,
  selected_winner_id text,
  items jsonb default '[]'::jsonb
);

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.analyses enable row level security;
alter table public.comparisons enable row level security;

-- Permissive policies for prototype / public access
create policy "Allow public read analyses" on public.analyses for select using (true);
create policy "Allow public insert analyses" on public.analyses for insert with check (true);
create policy "Allow public update analyses" on public.analyses for update using (true);

create policy "Allow public read profiles" on public.profiles for select using (true);
create policy "Allow public insert profiles" on public.profiles for insert with check (true);
create policy "Allow public update profiles" on public.profiles for update using (true);

create policy "Allow public read comparisons" on public.comparisons for select using (true);
create policy "Allow public insert comparisons" on public.comparisons for insert with check (true);
