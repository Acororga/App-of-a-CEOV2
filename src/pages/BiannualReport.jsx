import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, TrendingUp, Target, Clock, Smartphone, CheckSquare, ListTodo } from 'lucide-react';
import { format, subDays, differenceInDays } from 'date-fns';

export default function BiannualReport() {
  const { data: reportData } = useQuery({
    queryKey: ['biannualReport'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const sixMonthsAgo = subDays(new Date(), 180);
      
      // Focus sessions
      const focusSessions = await base44.entities.FocusSession.filter({
        created_by: user.email
      });
      const recentSessions = focusSessions.filter(s => new Date(s.start_time) >= sixMonthsAgo);
      const completedSessions = recentSessions.filter(s => s.completed);
      const totalFocusHours = completedSessions.reduce((sum, s) => sum + (s.duration_minutes / 60), 0);
      
      // CEO mode sessions
      const ceoSessions = await base44.entities.CEOModeSession.filter({
        created_by: user.email
      });
      const recentCEO = ceoSessions.filter(s => new Date(s.start_time) >= sixMonthsAgo);
      const completedCEO = recentCEO.filter(s => s.end_time && !s.early_exit);
      const totalCEOHours = completedCEO.reduce((sum, s) => sum + (s.duration_minutes / 60), 0);
      
      // Win streak
      const streaks = await base44.entities.WinStreak.filter({ created_by: user.email });
      const streak = streaks[0];
      
      // Rank
      const ranks = await base44.entities.UserRank.filter({ created_by: user.email });
      const rank = ranks[0];
      
      // Habits
      const habits = await base44.entities.Habit.filter({ 
        created_by: user.email,
        archived: false
      });
      
      // Habit completions
      const completions = await base44.entities.HabitCompletion.filter({
        created_by: user.email
      });
      const recentCompletions = completions.filter(c => new Date(c.date) >= sixMonthsAgo && c.completed);
      
      // Habit success by category
      const objectives = await base44.entities.Objective.filter({ 
        created_by: user.email,
        archived: false
      });
      
      const categoryStats = {};
      for (const obj of objectives) {
        const objHabits = habits.filter(h => h.objective_id === obj.id);
        const objCompletions = recentCompletions.filter(c => 
          objHabits.some(h => h.id === c.habit_id)
        );
        const expectedCount = objHabits.length * 180;
        const rate = expectedCount > 0 ? (objCompletions.length / expectedCount) * 100 : 0;
        categoryStats[obj.title] = Math.round(rate);
      }
      
      // Calculate habit success rate
      const daysActive = Math.min(180, differenceInDays(new Date(), new Date(user.created_date)));
      const expectedCompletions = habits.length * daysActive;
      const habitSuccessRate = expectedCompletions > 0 ? (recentCompletions.length / expectedCompletions) * 100 : 0;
      
      // Pareto tasks
      const paretoTasks = await base44.entities.ParetoTask.filter({
        created_by: user.email,
        completed: true
      });
      const recentTasks = paretoTasks.filter(t => t.completed_date && new Date(t.completed_date) >= sixMonthsAgo);
      
      // Productivity Index from Pareto Matrix
      const crucialShort = recentTasks.filter(t => t.importance_level === 'crucial' && (t.time_duration === 'less_than_30min' || t.time_duration === '1_hour')).length;
      const crucialLong = recentTasks.filter(t => t.importance_level === 'crucial' && (t.time_duration === '2_hours' || t.time_duration === 'half_day' || t.time_duration === '1_day' || t.time_duration === 'several_days')).length;
      const essentialShort = recentTasks.filter(t => t.importance_level === 'essential' && (t.time_duration === 'less_than_30min' || t.time_duration === '1_hour')).length;
      const essentialLong = recentTasks.filter(t => t.importance_level === 'essential' && (t.time_duration === '2_hours' || t.time_duration === 'half_day' || t.time_duration === '1_day' || t.time_duration === 'several_days')).length;
      const lowPriority = recentTasks.filter(t => t.importance_level === 'average' || t.importance_level === 'low').length;
      
      const totalTasks = recentTasks.length;
      const highImpactScore = totalTasks > 0 ? ((crucialShort + crucialLong + essentialShort + essentialLong) / totalTasks) * 100 : 0;
      const quickWinsScore = totalTasks > 0 ? (crucialShort / totalTasks) * 100 : 0;
      
      // Screen Time
      const screenLogs = await base44.entities.ScreenTimeLog.filter({
        created_by: user.email
      });
      const recentLogs = screenLogs.filter(l => new Date(l.date) >= sixMonthsAgo);
      const totalScreenSeconds = recentLogs.reduce((sum, l) => sum + l.duration_seconds, 0);
      const avgDailyMinutes = (totalScreenSeconds / 60) / 180;
      const avgWeeklyHours = (avgDailyMinutes * 7) / 60;
      
      // Life projection
      const yearsRemaining = 80 - (new Date().getFullYear() - new Date(user.created_date).getFullYear());
      const lifetimeScreenHours = (avgDailyMinutes * 365 * yearsRemaining) / 60;
      const lifetimeScreenYears = lifetimeScreenHours / 8760; // hours in a year
      
      // Category breakdown
      const categoryBreakdown = {};
      recentLogs.forEach(log => {
        const category = log.is_social_media ? 'Social Media' : 'Other';
        if (!categoryBreakdown[category]) categoryBreakdown[category] = 0;
        categoryBreakdown[category] += log.duration_seconds / 3600;
      });
      
      return {
        totalFocusHours: Math.round(totalFocusHours),
        totalCEOHours: Math.round(totalCEOHours),
        currentStreak: streak?.current_streak || 0,
        longestStreak: streak?.longest_streak || 0,
        rankName: rank?.rank_name || 'Bronze',
        rankLevel: rank?.rank_level || 1,
        habitSuccessRate: Math.round(habitSuccessRate),
        totalHabits: habits.length,
        completedTasks: recentTasks.length,
        daysActive,
        categoryStats,
        productivityIndex: Math.round(highImpactScore),
        quickWinsRate: Math.round(quickWinsScore),
        avgDailyScreenMinutes: Math.round(avgDailyMinutes),
        avgWeeklyScreenHours: Math.round(avgWeeklyScreenHours * 10) / 10,
        lifetimeScreenYears: Math.round(lifetimeScreenYears * 10) / 10,
        lifetimeScreenHours: Math.round(lifetimeScreenHours),
        categoryBreakdown,
        paretoBreakdown: {
          crucialShort,
          crucialLong,
          essentialShort,
          essentialLong,
          lowPriority
        }
      };
    }
  });

  // Calculate strengths and improvements
  const getStrengthsAndImprovements = () => {
    if (!reportData) return { strengths: [], improvements: [] };
    
    const strengths = [];
    const improvements = [];
    
    if (reportData.currentStreak >= 30) {
      strengths.push({ icon: '🔥', text: `${reportData.currentStreak}-day win streak` });
    } else if (reportData.currentStreak < 7) {
      improvements.push({ icon: '🔥', text: 'Build a longer win streak' });
    }
    
    if (reportData.productivityIndex >= 70) {
      strengths.push({ icon: '🎯', text: `${reportData.productivityIndex}% high-impact tasks` });
    } else {
      improvements.push({ icon: '🎯', text: 'Focus on high-impact activities' });
    }
    
    if (reportData.habitSuccessRate >= 80) {
      strengths.push({ icon: '✅', text: `${reportData.habitSuccessRate}% habit success` });
    } else {
      improvements.push({ icon: '✅', text: 'Improve habit consistency' });
    }
    
    if (reportData.avgDailyScreenMinutes <= 120) {
      strengths.push({ icon: '📱', text: 'Excellent screen time control' });
    } else if (reportData.avgDailyScreenMinutes >= 240) {
      improvements.push({ icon: '📱', text: 'Reduce daily screen time' });
    }
    
    return { strengths, improvements };
  };

  const { strengths, improvements } = getStrengthsAndImprovements();

  const getLifetimeComparison = () => {
    const hours = reportData?.lifetimeScreenHours || 0;
    if (hours >= 20000) return 'learn 3 new languages fluently';
    if (hours >= 10000) return 'become an expert in any field';
    if (hours >= 5000) return 'learn 2 new languages';
    if (hours >= 2000) return 'master a new skill';
    return 'develop a meaningful hobby';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Home</span>
        </Link>

        <div className="text-center mb-12">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Your 6-Month Report
          </h1>
          <p className="text-zinc-500">Data-driven insights on your productivity</p>
        </div>

        {/* Rank & Level */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 rounded-3xl blur-2xl" />
          <div className="relative p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 text-center">
            <div className="text-7xl mb-4">
              {reportData?.rankName === 'Bronze' && '🥉'}
              {reportData?.rankName === 'Silver' && '🥈'}
              {reportData?.rankName === 'Gold' && '🥇'}
              {reportData?.rankName === 'Platinum' && '💎'}
              {reportData?.rankName === 'Diamond' && '💠'}
              {reportData?.rankName === 'Batman' && '🦇'}
              {reportData?.rankName === 'CEO' && '👑'}
            </div>
            <div className="text-3xl font-bold mb-2">{reportData?.rankName || 'Bronze'}</div>
            <div className="text-sm text-zinc-500">Current Rank</div>
          </div>
        </div>

        {/* Screen Time Analysis */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold">Screen Time Analysis</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-2xl font-bold">{reportData?.avgDailyScreenMinutes || 0}m</div>
                  <div className="text-sm text-zinc-500">Daily Average</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{reportData?.avgWeeklyScreenHours || 0}h</div>
                  <div className="text-sm text-zinc-500">Weekly Average</div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50">
                <div className="text-sm text-red-300 mb-2">
                  ⚠️ <span className="font-semibold">Lifetime Projection</span>
                </div>
                <div className="text-xs text-red-400">
                  At this rate, you'll spend <span className="font-bold">{reportData?.lifetimeScreenYears || 0} years</span> ({reportData?.lifetimeScreenHours?.toLocaleString() || 0} hours) on your phone. With that time, you could {getLifetimeComparison()}.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Productivity Index */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ListTodo className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-bold">Productivity Index</h2>
          </div>
          
          <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold mb-2">{reportData?.productivityIndex || 0}%</div>
              <div className="text-sm text-zinc-500">High-Impact Focus</div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Crucial & Quick</span>
                <span className="font-semibold">{reportData?.paretoBreakdown?.crucialShort || 0} tasks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Crucial & Long</span>
                <span className="font-semibold">{reportData?.paretoBreakdown?.crucialLong || 0} tasks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Essential & Quick</span>
                <span className="font-semibold">{reportData?.paretoBreakdown?.essentialShort || 0} tasks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Essential & Long</span>
                <span className="font-semibold">{reportData?.paretoBreakdown?.essentialLong || 0} tasks</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Low Priority</span>
                <span>{reportData?.paretoBreakdown?.lowPriority || 0} tasks</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 rounded-lg bg-zinc-900/50">
              <div className="text-xs text-zinc-500">
                🎯 Quick wins rate: <span className="font-bold text-white">{reportData?.quickWinsRate || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Habit Success by Category */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-bold">Habit Success by Category</h2>
          </div>
          
          <div className="space-y-3">
            {reportData?.categoryStats && Object.entries(reportData.categoryStats).map(([category, rate]) => (
              <div key={category} className="p-4 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{category}</span>
                  <span className="text-lg font-bold">{rate}%</span>
                </div>
                <div className="h-2 bg-zinc-950 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      rate >= 80 ? 'bg-green-500' : rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50">
            <div className="text-3xl font-bold mb-1">{reportData?.currentStreak || 0}</div>
            <div className="text-sm text-zinc-500">Day Win Streak</div>
          </div>
          
          <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50">
            <div className="text-3xl font-bold mb-1">{reportData?.totalFocusHours || 0}h</div>
            <div className="text-sm text-zinc-500">Focus Mode</div>
          </div>
          
          <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50">
            <div className="text-3xl font-bold mb-1">{reportData?.habitSuccessRate || 0}%</div>
            <div className="text-sm text-zinc-500">Overall Habits</div>
          </div>
          
          <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50">
            <div className="text-3xl font-bold mb-1">{reportData?.completedTasks || 0}</div>
            <div className="text-sm text-zinc-500">Tasks Done</div>
          </div>
        </div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-bold">Your Strengths</h2>
            </div>
            <div className="space-y-3">
              {strengths.map((strength, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-green-950/30 border border-green-900/50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{strength.icon}</span>
                    <span className="text-green-300">{strength.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Areas for Improvement */}
        {improvements.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-bold">Growth Opportunities</h2>
            </div>
            <div className="space-y-3">
              {improvements.map((improvement, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{improvement.icon}</span>
                    <span className="text-blue-300">{improvement.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Motivational Message */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl" />
          <div className="relative p-6 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700/50 text-center">
            <div className="text-2xl mb-3">⚡</div>
            <div className="text-lg font-semibold mb-2">Keep Pushing Forward!</div>
            <div className="text-sm text-zinc-400">
              You've been active for {reportData?.daysActive || 0} days. Every day is a step toward becoming the best version of yourself.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}