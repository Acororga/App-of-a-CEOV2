-- Enable Row Level Security
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- Users table is handled by Supabase Auth (auth.users), but we might need a public profile table
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- RLS for profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- 1. Habits
create table public.habits (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  created_by uuid references auth.users not null,
  title text not null,
  archived boolean default false,
  is_daily boolean default true,
  specific_days integer[]
);
alter table public.habits enable row level security;
create policy "Users can CRUD their own habits" on public.habits using (auth.uid() = created_by);

-- 2. Habit Completions
create table public.habit_completions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  habit_id uuid references public.habits not null,
  date text not null,
  state text,
  completed boolean default false,
  created_by uuid references auth.users not null,
  checked_in_date timestamptz
);
alter table public.habit_completions enable row level security;
create policy "Users can CRUD their own habit completions" on public.habit_completions using (auth.uid() = created_by);

-- 3. Calendar Events
create table public.calendar_events (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  created_by uuid references auth.users not null,
  title text not null,
  description text,
  event_date text,
  event_time text,
  notification_24h_time timestamptz,
  notification_2h_time timestamptz,
  notification_24h_sent boolean default false,
  notification_2h_sent boolean default false
);
alter table public.calendar_events enable row level security;
create policy "Users can CRUD their own events" on public.calendar_events using (auth.uid() = created_by);

-- 4. Pareto Tasks
create table public.pareto_tasks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  created_by uuid references auth.users not null,
  title text not null,
  importance_level text,
  time_duration text,
  completed boolean default false,
  completed_date timestamptz,
  impact_level text,
  sort_order integer
);
alter table public.pareto_tasks enable row level security;
create policy "Users can CRUD their own tasks" on public.pareto_tasks using (auth.uid() = created_by);

-- 5. App Settings
create table public.app_settings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  created_by uuid references auth.users not null,
  active_apps text[]
);
alter table public.app_settings enable row level security;
create policy "Users can CRUD their own settings" on public.app_settings using (auth.uid() = created_by);

-- 6. User Rank
create table public.user_ranks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  created_by uuid references auth.users not null,
  rank_name text,
  rank_level integer,
  screen_time_avg_minutes numeric,
  win_streak_bonus integer,
  total_rank_points integer,
  days_at_current_rank integer,
  previous_rank_name text,
  last_rank_change_date text
);
alter table public.user_ranks enable row level security;
create policy "Users can CRUD their own rank" on public.user_ranks using (auth.uid() = created_by);

-- 7. Win Streak
create table public.win_streaks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  created_by uuid references auth.users not null,
  current_streak integer default 0,
  longest_streak integer default 0,
  total_completed_sessions integer default 0,
  total_failed_sessions integer default 0,
  last_session_date text
);
alter table public.win_streaks enable row level security;
create policy "Users can CRUD their own streak" on public.win_streaks using (auth.uid() = created_by);

-- 8. CEO Mode Sessions
create table public.ceo_mode_sessions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  created_by uuid references auth.users not null,
  active boolean default false,
  start_time timestamptz,
  end_time timestamptz,
  duration_minutes integer,
  approved_apps_count integer
);
alter table public.ceo_mode_sessions enable row level security;
create policy "Users can CRUD their own ceo sessions" on public.ceo_mode_sessions using (auth.uid() = created_by);

-- 9. Focus Sessions
create table public.focus_sessions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  created_by uuid references auth.users not null,
  duration_minutes integer,
  completed boolean default false,
  early_exit boolean default false,
  start_time timestamptz,
  end_time timestamptz,
  actual_duration_minutes integer
);
alter table public.focus_sessions enable row level security;
create policy "Users can CRUD their own focus sessions" on public.focus_sessions using (auth.uid() = created_by);

-- 10. Notes
create table public.notes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  created_by uuid references auth.users not null,
  content text,
  title text,
  updated_date timestamptz default now()
);
alter table public.notes enable row level security;
create policy "Users can CRUD their own notes" on public.notes using (auth.uid() = created_by);

-- 11. Objectives
create table public.objectives (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  created_by uuid references auth.users not null,
  title text,
  archived boolean default false
);
alter table public.objectives enable row level security;
create policy "Users can CRUD their own objectives" on public.objectives using (auth.uid() = created_by);

-- 12. Screen Time Logs
create table public.screen_time_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  created_by uuid references auth.users not null,
  entity_type text,
  entity_name text,
  duration_seconds integer,
  date text,
  start_time timestamptz,
  end_time timestamptz,
  awareness_notifications_shown integer default 0
);
alter table public.screen_time_logs enable row level security;
create policy "Users can CRUD their own logs" on public.screen_time_logs using (auth.uid() = created_by);

-- 13. Event Types
create table public.event_types (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  created_by uuid references auth.users not null,
  name text,
  color text,
  icon text
);
alter table public.event_types enable row level security;
create policy "Users can CRUD their own event types" on public.event_types using (auth.uid() = created_by);

-- 14. Leaderboard Entries
create table public.leaderboard_entries (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  created_by uuid references auth.users not null,
  rank_level integer,
  rank_name text,
  win_streak integer,
  screen_time_avg_minutes numeric,
  percentile integer,
  opted_in boolean default true,
  last_sync_date timestamptz
);
alter table public.leaderboard_entries enable row level security;
create policy "Everyone can view leaderboard entries" on public.leaderboard_entries for select using (true);
create policy "Users can CRUD their own entry" on public.leaderboard_entries using (auth.uid() = created_by);

-- 15. Friend Connections
create table public.friend_connections (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  created_by uuid references auth.users not null,
  friend_email text,
  friend_name text,
  friend_rank_level integer,
  friend_rank_name text,
  friend_win_streak integer,
  last_updated timestamptz
);
alter table public.friend_connections enable row level security;
create policy "Users can CRUD their own connections" on public.friend_connections using (auth.uid() = created_by);

-- 16. Weekly Habit Scores
create table public.weekly_habit_scores (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  created_by uuid references auth.users not null,
  week_start_date text,
  week_end_date text,
  total_expected integer,
  total_completed integer,
  success_percentage integer,
  threshold_percentage integer,
  threshold_met boolean,
  calculated_date timestamptz
);
alter table public.weekly_habit_scores enable row level security;
create policy "Users can CRUD their own scores" on public.weekly_habit_scores using (auth.uid() = created_by);

-- 17. Weekly Contracts
create table public.weekly_contracts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  created_by uuid references auth.users not null,
  week_start_date text,
  week_end_date text,
  reward_text text,
  sanction_text text,
  success_threshold_percentage integer default 90,
  committed boolean default false,
  evaluated boolean default false,
  outcome_grade text default 'pending',
  actual_success_percentage integer,
  evaluated_date timestamptz
);
alter table public.weekly_contracts enable row level security;
create policy "Users can CRUD their own contracts" on public.weekly_contracts using (auth.uid() = created_by);

-- 18. Blocked Apps
create table public.blocked_apps (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  created_by uuid references auth.users not null,
  app_name text,
  time_limit_minutes integer
);
alter table public.blocked_apps enable row level security;
create policy "Users can CRUD their own blocked apps" on public.blocked_apps using (auth.uid() = created_by);

-- 19. Blocked Websites
create table public.blocked_websites (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  created_by uuid references auth.users not null,
  url_domain text,
  time_limit_minutes integer
);
alter table public.blocked_websites enable row level security;
create policy "Users can CRUD their own blocked websites" on public.blocked_websites using (auth.uid() = created_by);

-- 20. Rest Periods
create table public.rest_periods (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  created_by uuid references auth.users not null,
  start_time text,
  end_time text,
  active boolean default true
);
alter table public.rest_periods enable row level security;
create policy "Users can CRUD their own rest periods" on public.rest_periods using (auth.uid() = created_by);

-- 21. App Configs
create table public.app_configs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  config_key text,
  config_value jsonb
);
alter table public.app_configs enable row level security;
create policy "Everyone can read app configs" on public.app_configs for select using (true);

-- 22. Approved Apps
create table public.approved_apps (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  created_by uuid references auth.users not null,
  app_name text,
  approved boolean default true,
  essential boolean default false,
  icon text
);
alter table public.approved_apps enable row level security;
create policy "Users can CRUD their own approved apps" on public.approved_apps using (auth.uid() = created_by);