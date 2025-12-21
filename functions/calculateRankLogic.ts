import { base44 } from '@/api/base44Client';
import { differenceInDays } from 'date-fns';

/**
 * Rank Requirements:
 * Bronze - Starting rank
 * Silver - 15 days in app + 10 day win streak
 * Gold - 50 day win streak
 * Platinum - 90 day win streak + 60 hours in Focus Mode
 * Diamond - 180 day win streak + 200 hours in Focus Mode
 * Batman - 365 day win streak + 200 hours in Focus Mode + 100 hours in CEO Mode
 * CEO - 500 day win streak + 250 hours in Focus Mode + 250 hours in CEO Mode
 */

export async function calculateUserRank() {
  const user = await base44.auth.me();
  
  // Get user's days in app
  const daysInApp = differenceInDays(new Date(), new Date(user.created_date));
  
  // Get win streak
  const streaks = await base44.entities.WinStreak.filter({ created_by: user.email });
  const streak = streaks[0];
  const currentStreak = streak?.current_streak || 0;
  
  // Get focus sessions
  const focusSessions = await base44.entities.FocusSession.filter({ 
    created_by: user.email,
    completed: true
  });
  const totalFocusHours = focusSessions.reduce((sum, s) => sum + (s.duration_minutes / 60), 0);
  
  // Get CEO mode sessions
  const ceoSessions = await base44.entities.CEOModeSession.filter({ 
    created_by: user.email
  });
  const completedCEO = ceoSessions.filter(s => s.end_time && !s.early_exit);
  const totalCEOHours = completedCEO.reduce((sum, s) => sum + (s.duration_minutes / 60), 0);
  
  // Determine rank
  let rankLevel = 1;
  let rankName = 'Bronze';
  
  if (currentStreak >= 500 && totalFocusHours >= 250 && totalCEOHours >= 250) {
    rankLevel = 7;
    rankName = 'CEO';
  } else if (currentStreak >= 365 && totalFocusHours >= 200 && totalCEOHours >= 100) {
    rankLevel = 6;
    rankName = 'Batman';
  } else if (currentStreak >= 180 && totalFocusHours >= 200) {
    rankLevel = 5;
    rankName = 'Diamond';
  } else if (currentStreak >= 90 && totalFocusHours >= 60) {
    rankLevel = 4;
    rankName = 'Platinum';
  } else if (currentStreak >= 50) {
    rankLevel = 3;
    rankName = 'Gold';
  } else if (daysInApp >= 15 && currentStreak >= 10) {
    rankLevel = 2;
    rankName = 'Silver';
  }
  
  // Update or create rank record
  const ranks = await base44.entities.UserRank.filter({ created_by: user.email });
  const currentRank = ranks[0];
  
  if (currentRank) {
    if (currentRank.rank_level !== rankLevel) {
      await base44.entities.UserRank.update(currentRank.id, {
        rank_level: rankLevel,
        rank_name: rankName,
        days_in_app: daysInApp,
        win_streak_current: currentStreak,
        total_focus_hours: Math.round(totalFocusHours),
        total_ceo_hours: Math.round(totalCEOHours),
        last_rank_change_date: new Date().toISOString().split('T')[0]
      });
    } else {
      await base44.entities.UserRank.update(currentRank.id, {
        days_in_app: daysInApp,
        win_streak_current: currentStreak,
        total_focus_hours: Math.round(totalFocusHours),
        total_ceo_hours: Math.round(totalCEOHours)
      });
    }
  } else {
    await base44.entities.UserRank.create({
      rank_level: rankLevel,
      rank_name: rankName,
      days_in_app: daysInApp,
      win_streak_current: currentStreak,
      total_focus_hours: Math.round(totalFocusHours),
      total_ceo_hours: Math.round(totalCEOHours),
      created_by: user.email
    });
  }
  
  return { rankLevel, rankName, currentStreak, totalFocusHours, totalCEOHours, daysInApp };
}

export function getNextRankRequirements(currentRankLevel, currentStats) {
  const { currentStreak, totalFocusHours, totalCEOHours, daysInApp } = currentStats;
  
  const requirements = {
    1: { // Bronze -> Silver
      name: 'Silver',
      needs: [
        daysInApp < 15 ? `${15 - daysInApp} more days in app` : null,
        currentStreak < 10 ? `${10 - currentStreak} day win streak` : null
      ].filter(Boolean)
    },
    2: { // Silver -> Gold
      name: 'Gold',
      needs: [
        currentStreak < 50 ? `${50 - currentStreak} day win streak` : null
      ].filter(Boolean)
    },
    3: { // Gold -> Platinum
      name: 'Platinum',
      needs: [
        currentStreak < 90 ? `${90 - currentStreak} day win streak` : null,
        totalFocusHours < 60 ? `${Math.round(60 - totalFocusHours)} more Focus hours` : null
      ].filter(Boolean)
    },
    4: { // Platinum -> Diamond
      name: 'Diamond',
      needs: [
        currentStreak < 180 ? `${180 - currentStreak} day win streak` : null,
        totalFocusHours < 200 ? `${Math.round(200 - totalFocusHours)} more Focus hours` : null
      ].filter(Boolean)
    },
    5: { // Diamond -> Batman
      name: 'Batman',
      needs: [
        currentStreak < 365 ? `${365 - currentStreak} day win streak` : null,
        totalCEOHours < 100 ? `${Math.round(100 - totalCEOHours)} more CEO Mode hours` : null
      ].filter(Boolean)
    },
    6: { // Batman -> CEO
      name: 'CEO',
      needs: [
        currentStreak < 500 ? `${500 - currentStreak} day win streak` : null,
        totalFocusHours < 250 ? `${Math.round(250 - totalFocusHours)} more Focus hours` : null,
        totalCEOHours < 250 ? `${Math.round(250 - totalCEOHours)} more CEO Mode hours` : null
      ].filter(Boolean)
    }
  };
  
  return requirements[currentRankLevel] || null;
}