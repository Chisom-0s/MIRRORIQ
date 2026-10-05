-- ═══════════════════════════════════════════════════════════
-- MirrorIQ PostgreSQL Database Schema & Security Definition
-- ═══════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── 1. PROFILES ────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ─── 2. PRODUCTS ────────────────────────────────────────────
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  brand text not null,
  description text,
  category text not null,
  image_url text not null,
  price text not null,
  color text,
  occasion text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ─── 3. ANALYSIS SESSIONS ───────────────────────────────────
create table if not exists public.analysis_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  selfie_url text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- ─── 4. SKIN ANALYSES ───────────────────────────────────────
create table if not exists public.skin_analyses (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.analysis_sessions(id) on delete cascade,
  skin_type text,
  overall_score numeric(5, 2),
  analysis_data jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ─── 5. TRY-ON RESULTS ──────────────────────────────────────
create table if not exists public.try_on_results (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.analysis_sessions(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  source_image_url text not null,
  result_image_url text,
  youcam_task_id text,
  status text not null default 'running' check (status in ('running', 'success', 'error')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ─── 6. DECISION REPORTS ────────────────────────────────────
create table if not exists public.decision_reports (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.analysis_sessions(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  confidence_score numeric(5, 2) not null,
  visual_score numeric(5, 2),
  occasion_score numeric(5, 2),
  preference_score numeric(5, 2),
  versatility_score numeric(5, 2),
  recommendation text,
  explanation text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ─── 7. COMPARISONS ─────────────────────────────────────────
create table if not exists public.comparisons (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.analysis_sessions(id) on delete cascade,
  product_a_id uuid references public.products(id) on delete set null,
  product_b_id uuid references public.products(id) on delete set null,
  score_a numeric(5, 2),
  score_b numeric(5, 2),
  winner_product_id uuid references public.products(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ─── INDEXES ────────────────────────────────────────────────
create index if not exists idx_sessions_user on public.analysis_sessions(user_id);
create index if not exists idx_skin_session on public.skin_analyses(session_id);
create index if not exists idx_tryon_session on public.try_on_results(session_id);
create index if not exists idx_tryon_product on public.try_on_results(product_id);
create index if not exists idx_decision_session on public.decision_reports(session_id);
create index if not exists idx_decision_product on public.decision_reports(product_id);
create index if not exists idx_comparisons_session on public.comparisons(session_id);

-- ─── ROW LEVEL SECURITY (RLS) ───────────────────────────────
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.analysis_sessions enable row level security;
alter table public.skin_analyses enable row level security;
alter table public.try_on_results enable row level security;
alter table public.decision_reports enable row level security;
alter table public.comparisons enable row level security;

-- Products: Publicly readable by everyone
create policy "Products are publicly readable"
  on public.products for select
  using (true);

-- Profiles: Users can view and update their own profile
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Analysis Sessions: Users can view and insert their own sessions (or anonymous sessions)
create policy "Users can view their own sessions"
  on public.analysis_sessions for select
  using (auth.uid() = user_id or user_id is null);

create policy "Users can create sessions"
  on public.analysis_sessions for insert
  with check (auth.uid() = user_id or user_id is null);

-- Skin Analyses: Linked via session ownership
create policy "Users can view skin analyses"
  on public.skin_analyses for select
  using (
    exists (
      select 1 from public.analysis_sessions
      where id = skin_analyses.session_id
      and (user_id = auth.uid() or user_id is null)
    )
  );

-- Try-On Results: Linked via session ownership
create policy "Users can view try-on results"
  on public.try_on_results for select
  using (
    exists (
      select 1 from public.analysis_sessions
      where id = try_on_results.session_id
      and (user_id = auth.uid() or user_id is null)
    )
  );

-- Decision Reports: Linked via session ownership
create policy "Users can view decision reports"
  on public.decision_reports for select
  using (
    exists (
      select 1 from public.analysis_sessions
      where id = decision_reports.session_id
      and (user_id = auth.uid() or user_id is null)
    )
  );

-- Comparisons: Linked via session ownership
create policy "Users can view comparisons"
  on public.comparisons for select
  using (
    exists (
      select 1 from public.analysis_sessions
      where id = comparisons.session_id
      and (user_id = auth.uid() or user_id is null)
    )
  );
