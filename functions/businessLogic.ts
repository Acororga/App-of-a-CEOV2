import { base44 } from '@/api/base44Client';
import { format, startOfWeek, endOfWeek, addDays, differenceInMinutes, parseISO, differenceInDays, isAfter, isBefore, addHours, startOfDay } from 'date-fns';

/**
 * RANK SYSTEM LOGIC
 * Ranks: Panda (1) → Soldier (2) → Warrior (3) → Knight (4) → Captain (5) → Commander (6) → General (7) → Sigma (8) → CEO (9)
 * 
 * Rank calculation based on:
 * - Average daily screen time (lower is better)
 * - Win streak consistency (bonus points)
 */

export const RANK_TIERS = [
  { level: 1, name: 'Panda', icon: '🐼', maxScreenTimeMinutes: Infinity, minScreenTimeMinutes: 360 },
  { level: 2, name: 'Soldier', icon: '🪖', maxScreenTimeMinutes: 360, minScreenTimeMinutes: 300 },
  { level: 3, name: 'Warrior', icon: '⚔️', maxScreenTimeMinutes: 300, minScreenTimeMinutes: 240 },
  { level: 4, name: 'Knight', icon: '🛡️', maxScreenTimeMinutes: 240, minScreenTimeMinutes: 180 },
  { level: 5, name: 'Captain', icon: '👨‍✈️', maxScreenTimeMinutes: 180, minScreenTimeMinutes: 120 },
  { level: 6, name: 'Commander', icon: '🎖️', maxScreenTimeMinutes: 120, minScreenTimeMinutes: 90 },
  { level: 7, name: 'General', icon: '⭐', maxScreenTimeMinutes: 90, minScreenTimeMinutes: 60 },
  { level: 8, name: 'Sigma', icon: '💎', maxScreenTimeMinutes: 60, minScreenTimeMinutes: 30 },
  { level: 9, name: 'CEO', icon: '👑', maxScreenTimeMinutes: 30, minScreenTimeMinutes: 0 }
];

/**
 * Calculate rank based on screen time and win streak
 */
export async function calculateRank(avgScreenTimeMinutes, winStreak) {
  let baseRank = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (avgScreenTimeMinutes <= tier.maxScreenTimeMinutes && avgScreenTimeMinutes > tier.minScreenTimeMinutes) {
      baseRank = tier;
      break;
    }
  }

  const streakBonus = Math.floor(winStreak / 10);
  let finalRankLevel = Math.min(baseRank.level + streakBonus, 9);
  
  const finalRank = RANK_TIERS.find(r => r.level === finalRankLevel) || baseRank;

  let progressToNext = 0;
  const nextRank = RANK_TIERS.find(r => r.level === finalRankLevel + 1);
  if (nextRank) {
    const currentMax = finalRank.maxScreenTimeMinutes;
    const nextMin = nextRank.minScreenTimeMinutes;
    const range = currentMax - nextMin;
    const position = currentMax - avgScreenTimeMinutes;
    progressToNext = Math.max(0, Math.min(100, (position / range) * 100));
  } else {
    progressToNext = 100;
  }

  return {
    level: finalRankLevel,
    name: finalRank.name,
    icon: finalRank.icon,
    progressToNext: Math.round(progressToNext),
    nextRank: nextRank || null,
    streakBonus
  };
}

/**
 * Update user's rank in database
 */
export async function updateUserRank() {
  const user = await base44.auth.me();
  
  const avgScreenTime = await getAverageScreenTime(7);
  
  const streakData = await getOrCreateWinStreak();
  
  const rankData = await calculateRank(avgScreenTime, streakData.current_streak);
  
  const existingRanks = await base44.entities.UserRank.filter({ created_by: user.email });
  let userRank;
  
  if (existingRanks.length > 0) {
    userRank = existingRanks[0];
    const previousRankName = userRank.rank_name;
    const daysAtRank = userRank.rank_name === rankData.name ? (userRank.days_at_current_rank || 0) + 1 : 0;
    
    await base44.entities.UserRank.update(userRank.id, {
      rank_level: rankData.level,
      rank_name: rankData.name,
      screen_time_avg_minutes: avgScreenTime,
      win_streak_bonus: rankData.streakBonus,
      total_rank_points: rankData.level * 100 + rankData.streakBonus * 10,
      days_at_current_rank: daysAtRank,
      previous_rank_name: previousRankName !== rankData.name ? previousRankName : userRank.previous_rank_name,
      last_rank_change_date: previousRankName !== rankData.name ? format(new Date(), 'yyyy-MM-dd') : userRank.last_rank_change_date
    });
  } else {
    userRank = await base44.entities.UserRank.create({
      rank_level: rankData.level,
      rank_name: rankData.name,
      screen_time_avg_minutes: avgScreenTime,
      win_streak_bonus: rankData.streakBonus,
      total_rank_points: rankData.level * 100 + rankData.streakBonus * 10,
      days_at_current_rank: 0,
      last_rank_change_date: format(new Date(), 'yyyy-MM-dd')
    });
  }
  
  return { ...rankData, userRank };
}

/**
 * Get average screen time for last N days
 */
export async function getAverageScreenTime(days = 7) {
  const user = await base44.auth.me();
  const logs = await base44.entities.ScreenTimeLog.filter({ created_by: user.email });
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const relevantLogs = logs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= startDate && logDate <= endDate;
  });
  
  const totalMinutes = relevantLogs.reduce((sum, log) => sum + (log.duration_seconds / 60), 0);
  return days > 0 ? totalMinutes / days : 0;
}

/**
 * Get today's total screen time
 */
export async function getTodayScreenTime() {
  const user = await base44.auth.me();
  const today = format(new Date(), 'yyyy-MM-dd');
  const logs = await base44.entities.ScreenTimeLog.filter({ created_by: user.email, date: today });
  
  const totalSeconds = logs.reduce((sum, log) => sum + (log.duration_seconds || 0), 0);
  return Math.round(totalSeconds / 60);
}

/**
 * Get or create win streak record for current user
 */
export async function getOrCreateWinStreak() {
  const user = await base44.auth.me();
  const streaks = await base44.entities.WinStreak.filter({ created_by: user.email });
  
  if (streaks.length > 0) {
    return streaks[0];
  }
  
  return await base44.entities.WinStreak.create({
    current_streak: 0,
    longest_streak: 0,
    total_completed_sessions: 0,
    total_failed_sessions: 0
  });
}

/**
 * Increment win streak after successful focus session
 */
export async function incrementWinStreak() {
  const streakData = await getOrCreateWinStreak();
  const newStreak = streakData.current_streak + 1;
  const newLongest = Math.max(newStreak, streakData.longest_streak);
  
  await base44.entities.WinStreak.update(streakData.id, {
    current_streak: newStreak,
    longest_streak: newLongest,
    last_session_date: format(new Date(), 'yyyy-MM-dd'),
    total_completed_sessions: (streakData.total_completed_sessions || 0) + 1
  });
  
  await updateUserRank();
  
  return newStreak;
}

/**
 * Reset win streak to zero (when focus mode exited early)
 */
export async function resetWinStreak() {
  const streakData = await getOrCreateWinStreak();
  
  await base44.entities.WinStreak.update(streakData.id, {
    current_streak: 0,
    total_failed_sessions: (streakData.total_failed_sessions || 0) + 1
  });
  
  await updateUserRank();
  
  return 0;
}

/**
 * Start a focus session
 */
export async function startFocusSession(durationMinutes) {
  const session = await base44.entities.FocusSession.create({
    start_time: new Date().toISOString(),
    duration_minutes: durationMinutes,
    completed: false,
    early_exit: false
  });
  
  return session;
}

/**
 * Complete focus session successfully
 */
export async function completeFocusSession(sessionId) {
  const session = await base44.entities.FocusSession.filter({ id: sessionId });
  if (session.length === 0) return null;
  
  const sessionData = session[0];
  const actualDuration = differenceInMinutes(new Date(), parseISO(sessionData.start_time));
  
  await base44.entities.FocusSession.update(sessionId, {
    end_time: new Date().toISOString(),
    completed: true,
    early_exit: false,
    actual_duration_minutes: actualDuration
  });
  
  const newStreak = await incrementWinStreak();
  
  return { success: true, newStreak, actualDuration };
}

/**
 * Exit focus session early (breaks streak)
 */
export async function exitFocusSessionEarly(sessionId) {
  const session = await base44.entities.FocusSession.filter({ id: sessionId });
  if (session.length === 0) return null;
  
  const sessionData = session[0];
  const actualDuration = differenceInMinutes(new Date(), parseISO(sessionData.start_time));
  
  await base44.entities.FocusSession.update(sessionId, {
    end_time: new Date().toISOString(),
    completed: false,
    early_exit: true,
    actual_duration_minutes: actualDuration
  });
  
  await resetWinStreak();
  
  return { success: false, streakBroken: true, actualDuration };
}

/**
 * Get habits scheduled for a specific date
 */
export async function getHabitsForDate(date) {
  const user = await base44.auth.me();
  const allHabits = await base44.entities.Habit.filter({ created_by: user.email, archived: false });
  
  const dayOfWeek = new Date(date).getDay();
  
  const scheduledHabits = allHabits.filter(habit => {
    if (habit.is_daily) {
      return true;
    }
    if (habit.specific_days && Array.isArray(habit.specific_days)) {
      return habit.specific_days.includes(dayOfWeek);
    }
    return false;
  });
  
  return scheduledHabits;
}

/**
 * Get habit completions for a specific date
 */
export async function getHabitCompletionsForDate(date) {
  const user = await base44.auth.me();
  const dateStr = format(new Date(date), 'yyyy-MM-dd');
  const completions = await base44.entities.HabitCompletion.filter({ 
    created_by: user.email, 
    date: dateStr 
  });
  
  return completions;
}

/**
 * Check if date has unchecked habits
 */
export async function hasUncheckedHabits(date) {
  const habits = await getHabitsForDate(date);
  const completions = await getHabitCompletionsForDate(date);
  
  const completionMap = {};
  completions.forEach(c => {
    completionMap[c.habit_id] = c;
  });
  
  for (const habit of habits) {
    if (!completionMap[habit.id]) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check in habit for a date
 */
export async function checkInHabit(habitId, date, completed) {
  const user = await base44.auth.me();
  const dateStr = format(new Date(date), 'yyyy-MM-dd');
  
  const existingCompletions = await base44.entities.HabitCompletion.filter({
    created_by: user.email,
    habit_id: habitId,
    date: dateStr
  });
  
  if (existingCompletions.length > 0) {
    await base44.entities.HabitCompletion.update(existingCompletions[0].id, {
      completed,
      checked_in_date: new Date().toISOString()
    });
  } else {
    await base44.entities.HabitCompletion.create({
      habit_id: habitId,
      date: dateStr,
      completed,
      checked_in_date: new Date().toISOString()
    });
  }
}

/**
 * Calculate weekly habit score
 */
export async function calculateWeeklyHabitScore(weekStartDate) {
  const user = await base44.auth.me();
  const weekStart = startOfWeek(new Date(weekStartDate), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(weekStartDate), { weekStartsOn: 1 });
  
  let totalExpected = 0;
  let totalCompleted = 0;
  
  for (let d = 0; d < 7; d++) {
    const currentDate = addDays(weekStart, d);
    const habits = await getHabitsForDate(currentDate);
    const completions = await getHabitCompletionsForDate(currentDate);
    
    const completionMap = {};
    completions.forEach(c => {
      completionMap[c.habit_id] = c.completed;
    });
    
    habits.forEach(habit => {
      totalExpected++;
      if (completionMap[habit.id]) {
        totalCompleted++;
      }
    });
  }
  
  const successPercentage = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;
  
  const existingScores = await base44.entities.WeeklyHabitScore.filter({
    created_by: user.email,
    week_start_date: format(weekStart, 'yyyy-MM-dd')
  });
  
  const scoreData = {
    week_start_date: format(weekStart, 'yyyy-MM-dd'),
    week_end_date: format(weekEnd, 'yyyy-MM-dd'),
    total_expected: totalExpected,
    total_completed: totalCompleted,
    success_percentage: successPercentage,
    threshold_percentage: 90,
    threshold_met: successPercentage >= 90,
    calculated_date: new Date().toISOString()
  };
  
  if (existingScores.length > 0) {
    await base44.entities.WeeklyHabitScore.update(existingScores[0].id, scoreData);
  } else {
    await base44.entities.WeeklyHabitScore.create(scoreData);
  }
  
  return scoreData;
}

/**
 * Get current week's contract
 */
export async function getCurrentWeekContract() {
  const user = await base44.auth.me();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  
  const contracts = await base44.entities.WeeklyContract.filter({
    created_by: user.email,
    week_start_date: weekStartStr
  });
  
  return contracts.length > 0 ? contracts[0] : null;
}

/**
 * Create weekly contract
 */
export async function createWeeklyContract(rewardText, sanctionText, thresholdPercentage = 90) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  
  const contract = await base44.entities.WeeklyContract.create({
    week_start_date: format(weekStart, 'yyyy-MM-dd'),
    week_end_date: format(weekEnd, 'yyyy-MM-dd'),
    reward_text: rewardText,
    sanction_text: sanctionText,
    success_threshold_percentage: thresholdPercentage,
    committed: false,
    evaluated: false,
    outcome_grade: 'pending'
  });
  
  return contract;
}

/**
 * Commit to contract
 */
export async function commitToContract(contractId) {
  await base44.entities.WeeklyContract.update(contractId, {
    committed: true
  });
}

/**
 * Evaluate weekly contract (called at week end)
 */
export async function evaluateWeeklyContract(contractId) {
  const contracts = await base44.entities.WeeklyContract.filter({ id: contractId });
  if (contracts.length === 0) return null;
  
  const contract = contracts[0];
  
  const weekScore = await calculateWeeklyHabitScore(contract.week_start_date);
  
  let outcomeGrade = 'full_sanction';
  if (weekScore.success_percentage >= contract.success_threshold_percentage) {
    outcomeGrade = 'full_reward';
  } else if (weekScore.success_percentage >= 70) {
    outcomeGrade = 'partial_reward';
  } else if (weekScore.success_percentage >= 50) {
    outcomeGrade = 'partial_sanction';
  }
  
  await base44.entities.WeeklyContract.update(contractId, {
    actual_success_percentage: weekScore.success_percentage,
    outcome_grade: outcomeGrade,
    evaluated: true,
    evaluated_date: new Date().toISOString()
  });
  
  return { ...contract, actual_success_percentage: weekScore.success_percentage, outcome_grade: outcomeGrade };
}

/**
 * Get top N high-impact incomplete tasks
 */
export async function getTopParetoTasks(limit = 3) {
  const user = await base44.auth.me();
  const tasks = await base44.entities.ParetoTask.filter({
    created_by: user.email,
    impact_level: 'high',
    completed: false
  }, 'sort_order', limit);
  
  return tasks;
}

/**
 * Get upcoming events (next 7 days)
 */
export async function getUpcomingEvents(days = 7) {
  const user = await base44.auth.me();
  const allEvents = await base44.entities.CalendarEvent.filter({ created_by: user.email });
  
  const now = new Date();
  const futureDate = addDays(now, days);
  
  const upcomingEvents = allEvents.filter(event => {
    const eventDateTime = parseISO(`${event.event_date}T${event.event_time}`);
    return isAfter(eventDateTime, now) && isBefore(eventDateTime, futureDate);
  }).sort((a, b) => {
    const dateA = parseISO(`${a.event_date}T${a.event_time}`);
    const dateB = parseISO(`${b.event_date}T${b.event_time}`);
    return dateA - dateB;
  });
  
  return upcomingEvents;
}

/**
 * Get next event (soonest upcoming)
 */
export async function getNextEvent() {
  const events = await getUpcomingEvents(30);
  return events.length > 0 ? events[0] : null;
}

/**
 * Start CEO Mode session
 */
export async function startCEOModeSession() {
  const session = await base44.entities.CEOModeSession.create({
    start_time: new Date().toISOString()
  });
  
  return session;
}

/**
 * End CEO Mode session
 */
export async function endCEOModeSession(sessionId) {
  const sessions = await base44.entities.CEOModeSession.filter({ id: sessionId });
  if (sessions.length === 0) return null;
  
  const session = sessions[0];
  const duration = differenceInMinutes(new Date(), parseISO(session.start_time));
  
  await base44.entities.CEOModeSession.update(sessionId, {
    end_time: new Date().toISOString(),
    duration_minutes: duration
  });
  
  return { ...session, duration_minutes: duration };
}

/**
 * Get approved apps for CEO Mode
 */
export async function getApprovedApps() {
  const user = await base44.auth.me();
  const apps = await base44.entities.ApprovedApp.filter({ 
    created_by: user.email, 
    approved: true 
  });
  
  return apps;
}

export function getCurrentWeekBoundaries() {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  
  return {
    start: weekStart,
    end: weekEnd,
    startStr: format(weekStart, 'yyyy-MM-dd'),
    endStr: format(weekEnd, 'yyyy-MM-dd')
  };
}

export function formatTimeRemaining(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}