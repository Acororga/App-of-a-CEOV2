import { supabase } from './supabaseClient';

const createEntity = (tableName) => ({
  filter: async (query = {}) => {
    let request = supabase.from(tableName).select('*');
    
    // Inject created_by if not present and user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user && !query.created_by && tableName !== 'app_configs' && tableName !== 'leaderboard_entries') {
      request = request.eq('created_by', user.id);
    }

    Object.entries(query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        request = request.in(key, value);
      } else {
        request = request.eq(key, value);
      }
    });
    const { data, error } = await request;
    if (error) throw error;
    return data;
  },
  get: async (id) => {
    const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  list: async () => {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) throw error;
    return data;
  },
  create: async (payload) => {
    // Inject created_by if missing
    if (!payload.created_by) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) payload.created_by = user.id;
    }

    const { data, error } = await supabase.from(tableName).insert(payload).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, payload) => {
    const { data, error } = await supabase.from(tableName).update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id) => {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw error;
    return true;
  }
});

// Mapping Base44 PascalCase entities to Supabase snake_case tables
export const entities = {
  Habit: createEntity('habits'),
  HabitCompletion: createEntity('habit_completions'),
  CalendarEvent: createEntity('calendar_events'),
  ParetoTask: createEntity('pareto_tasks'),
  AppSettings: createEntity('app_settings'),
  UserRank: createEntity('user_ranks'),
  WinStreak: createEntity('win_streaks'),
  CEOModeSession: createEntity('ceo_mode_sessions'),
  FocusSession: createEntity('focus_sessions'),
  Note: createEntity('notes'),
  Objective: createEntity('objectives'),
  ScreenTimeLog: createEntity('screen_time_logs'),
  EventType: createEntity('event_types'),
  LeaderboardEntry: createEntity('leaderboard_entries'),
  FriendConnection: createEntity('friend_connections'),
  WeeklyHabitScore: createEntity('weekly_habit_scores'),
  WeeklyContract: createEntity('weekly_contracts'),
  BlockedApp: createEntity('blocked_apps'),
  BlockedWebsite: createEntity('blocked_websites'),
  RestPeriod: createEntity('rest_periods'),
  AppConfig: createEntity('app_configs'),
  ApprovedApp: createEntity('approved_apps'),
  User: createEntity('profiles'), // Mapping User entity to profiles table
};
