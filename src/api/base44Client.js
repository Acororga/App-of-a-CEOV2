import { supabase } from './supabaseClient';

/**
 * MIGRATION LAYER: This file now uses Supabase but maintains the Base44 API 
 * structure so the rest of the app doesn't break.
 */

const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
};

const createEntity = (tableName) => ({
  filter: async (filters = {}) => {
    const userId = await getUserId();
    let query = supabase.from(tableName).select('*');
    
    Object.entries(filters).forEach(([key, value]) => {
      // Compatibility mapping: if code filters by 'created_by' (email), use the current user's UUID instead.
      if (key === 'created_by' && typeof value === 'string' && value.includes('@')) {
        if (userId) {
          query = query.eq('created_by', userId);
        }
      } else {
        query = query.eq(key, value);
      }
    });
    
    const { data, error } = await query;
    if (error) {
      console.error(`Error filtering ${tableName}:`, error);
      return [];
    }
    return data;
  },
  
  create: async (data) => {
    const userId = await getUserId();
    const finalData = { ...data };
    
    // Always force current user's UUID for created_by
    if (userId) {
      finalData.created_by = userId;
    }
    
    const { data: result, error } = await supabase
      .from(tableName)
      .insert([finalData])
      .select();
    
    if (error) {
      console.error(`Error creating ${tableName}:`, error);
      throw error;
    }
    return result[0];
  },
  
  update: async (id, updates) => {
    const { data: result, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`Error updating ${tableName}:`, error);
      throw error;
    }
    return result[0];
  },
  
  delete: async (id) => {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    if (error) {
      console.error(`Error deleting ${tableName}:`, error);
      throw error;
    }
    return true;
  },

  list: async () => {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
      console.error(`Error listing ${tableName}:`, error);
      return [];
    }
    return data;
  }
});

export const base44 = {
  entities: {
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
    LeaderboardEntry: createEntity('leaderboard_entries'),
    FriendConnection: createEntity('friend_connections'),
    WeeklyHabitScore: createEntity('weekly_habit_scores'),
    WeeklyContract: createEntity('weekly_contracts'),
    ApprovedApp: createEntity('approved_apps'),
    AppConfig: createEntity('app_configs'),
    EventType: createEntity('event_types'),
    RestPeriod: createEntity('rest_periods'),
    BlockedApp: createEntity('blocked_apps'),
    BlockedWebsite: createEntity('blocked_websites'),
    // Public user profile table
    User: createEntity('profiles') 
  },
  auth: {
    me: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) throw new Error('Not authenticated');
      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email.split('@')[0],
      };
    },
    logout: async () => {
      await supabase.auth.signOut();
      window.location.reload();
    },
    redirectToLogin: () => {
      console.log('Redirecting to login...');
      // Implement redirect logic if you have a login page
    }
  },
  appLogs: {
    create: async (log) => console.log('Log:', log),
    logUserInApp: async (page) => console.log('User navigated to:', page)
  },
  stripe: {
    redirectToCheckout: () => {
      alert('Stripe integration needs to be set up manually for Supabase.');
    },
    getSubscriptionStatus: async () => {
      return { isPremium: false };
    }
  }
};