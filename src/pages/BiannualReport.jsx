import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, TrendingUp, TrendingDown, Award, Target, Zap } from 'lucide-react';
import { format, subDays, differenceInDays } from 'date-fns';

export default function BiannualReport() {
  const { data: reportData } = useQuery({
    queryKey: ['biannualReport'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const sixMonthsAgo = subDays(new Date(), 180);
      
      // Get focus sessions
      const focusSessions = await base44.entities.FocusSession.filter({
        created_by: user.email
      });
      const recentSessions = focusSessions.filter(s => new Date(s.start_time) >= sixMonthsAgo);
      const completedSessions = recentSessions.filter(s => s.completed);
      const totalFocusHours = completedSessions.reduce((sum, s) => sum + (s.duration_minutes / 60), 0);
      
      // Get CEO mode sessions
      const ceoSessions = await base44.entities.CEOModeSession.filter({
        created_by: user.email
      });
      const recentCEO = ceoSessions.filter(s => new Date(s.start_time) >= sixMonthsAgo);
      const completedCEO = recentCEO.filter(s => s.end_time && !s.early_exit);
      const totalCEOHours = completedCEO.reduce((sum, s) => sum + (s.duration_minutes / 60), 0);
      
      // Get win streak
      const streaks = await base44.entities.WinStreak.filter({ created_by: user.email });
      const streak = streaks[0];
      
      // Get rank
      const ranks = await base44.entities.UserRank.filter({ created_by: user.email });
      const rank = ranks[0];
      
      // Get habits
      const habits = await base44.entities.Habit.filter({ 
        created_by: user.email,
        archived: false
      });
      
      // Get habit completions
      const completions = await base44.entities.HabitCompletion.filter({
        created_by: user.email
      });
      const recentCompletions = completions.filter(c => new Date(c.date) >= sixMonthsAgo && c.completed);
      
      // Calculate habit success rate
      const daysActive = Math.min(180, differenceInDays(new Date(), new Date(user.created_date)));
      const expectedCompletions = habits.length * daysActive;
      const habitSuccessRate = expectedCompletions > 0 ? (recentCompletions.length / expectedCompletions) * 100 : 0;
      
      // Get Pareto tasks
      const paretoTasks = await base44.entities.ParetoTask.filter({
        created_by: user.email,
        completed: true
      });
      const recentTasks = paretoTasks.filter(t => t.completed_date && new Date(t.completed_date) >= sixMonthsAgo);
      
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
        strengths: [],
        improvements: []
      };
    }
  });

  // Calculate strengths and improvements
  const getStrengthsAndImprovements = () => {
    if (!reportData) return { strengths: [], improvements: [] };
    
    const strengths = [];
    const improvements = [];
    
    if (reportData.currentStreak >= 30) {
      strengths.push({ icon: '🔥', text: `Amazing ${reportData.currentStreak}-day win streak!` });
    } else if (reportData.currentStreak < 7) {
      improvements.push({ icon: '🔥', text: 'Build a longer win streak' });
    }
    
    if (reportData.totalFocusHours >= 50) {
      strengths.push({ icon: '⏰', text: `${reportData.totalFocusHours} hours in Focus Mode` });
    } else {
      improvements.push({ icon: '⏰', text: 'Increase Focus Mode usage' });
    }
    
    if (reportData.habitSuccessRate >= 80) {
      strengths.push({ icon: '✅', text: `${reportData.habitSuccessRate}% habit success rate` });
    } else {
      improvements.push({ icon: '✅', text: 'Improve habit consistency' });
    }
    
    if (reportData.completedTasks >= 50) {
      strengths.push({ icon: '🎯', text: `${reportData.completedTasks} Pareto tasks completed` });
    } else {
      improvements.push({ icon: '🎯', text: 'Complete more priority tasks' });
    }
    
    if (reportData.totalCEOHours >= 20) {
      strengths.push({ icon: '👑', text: `${reportData.totalCEOHours} hours in CEO Mode` });
    } else if (reportData.totalCEOHours > 0) {
      improvements.push({ icon: '👑', text: 'Increase CEO Mode usage' });
    }
    
    return { strengths, improvements };
  };

  const { strengths, improvements } = getStrengthsAndImprovements();

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
          <p className="text-zinc-500">A snapshot of your productivity journey</p>
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
            <div className="text-sm text-zinc-500">Habit Success</div>
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