-- Player Card cloud schema. Run this in the Supabase SQL editor for your
-- project (Dashboard -> SQL -> New query -> paste -> Run). Safe to re-run.
--
-- Model: profiles (one per auth user, with a searchable @username), matches
-- (a published copy of a player's local matches), and follows (the social
-- graph). RLS makes profiles/matches readable by any signed-in user so you can
-- view people you follow, while only the owner can write their own rows.

-- ------- profiles -------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  name          text default '',
  batting_style text default '',
  bowling_arm   text default '',
  bowler_type   text default '',
  created_at    timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles readable by authenticated" on public.profiles;
create policy "profiles readable by authenticated"
  on public.profiles for select to authenticated using (true);

drop policy if exists "users manage own profile" on public.profiles;
create policy "users manage own profile"
  on public.profiles for all to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- ------- matches -------
create table if not exists public.matches (
  id           uuid primary key,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  season       text,
  date         text,
  opposition   text,
  venue        text,
  format       text,
  custom_overs numeric,
  batting      jsonb,
  bowling      jsonb,
  fielding     jsonb,
  created_at   bigint,
  updated_at   bigint
);

create index if not exists matches_user_id_idx on public.matches(user_id);

alter table public.matches enable row level security;

drop policy if exists "matches readable by authenticated" on public.matches;
create policy "matches readable by authenticated"
  on public.matches for select to authenticated using (true);

drop policy if exists "users manage own matches" on public.matches;
create policy "users manage own matches"
  on public.matches for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------- follows -------
create table if not exists public.follows (
  follower_id  uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at   timestamptz default now(),
  primary key (follower_id, following_id)
);

alter table public.follows enable row level security;

drop policy if exists "follows readable by authenticated" on public.follows;
create policy "follows readable by authenticated"
  on public.follows for select to authenticated using (true);

drop policy if exists "users manage own follows" on public.follows;
create policy "users manage own follows"
  on public.follows for all to authenticated
  using (auth.uid() = follower_id) with check (auth.uid() = follower_id);
