import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { getOrCreateWinStreak, hasUncheckedHabits } from '../functions/businessLogic';
import { base44 } from '@/api/base44Client';
import { subDays } from 'date-fns';
import { 
  BarChart3, CheckSquare, ListChecks, Calendar, Shield, Circle 
} from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState(null);

  const { data: streakData } = useQuery({
    queryKey: ['winStreak'],
    queryFn: getOrCreateWinStreak,
    refetchInterval: 60000
  });

  const { data: rankData } = useQuery({
    queryKey: ['userRank'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const ranks = await base44.entities.UserRank.filter({ created_by: user.email });
      return ranks[0] || { rank_name: 'Panda', rank_level: 1 };
    }
  });

  const { data: todayHabits } = useQuery({
    queryKey: ['todayHabitsCount'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const habits = await base44.entities.Habit.filter({ 
        created_by: user.email,
        archived: false
      });
      return habits.length;
    }
  });

  const { data: needsCheckIn } = useQuery({
    queryKey: ['needsCheckIn'],
    queryFn: () => hasUncheckedHabits(subDays(new Date(), 1))
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-800 flex items-center justify-center shadow-lg border border-zinc-700/50">
            <span className="text-sm font-bold bg-gradient-to-br from-white to-zinc-300 bg-clip-text text-transparent">
              {user?.full_name?.charAt(0) || '?'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] text-zinc-600 font-semibold tracking-wider">RANK</div>
            <div className="text-sm font-bold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">
              {rankData?.rank_name || 'Panda'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-zinc-600 font-semibold tracking-wider">STREAK</div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🔥</span>
              <span className="text-sm font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                {streakData?.current_streak || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Card - Large Rectangular */}
      <Link
        to={createPageUrl('Dashboard')}
        className="block mb-4 group relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
        <div className="relative h-32 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 p-6 overflow-hidden shadow-2xl group-hover:border-zinc-600/50 transition-all group-active:scale-[0.98]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-3xl" />
          <div className="relative flex items-center justify-between h-full">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold mb-1">Dashboard</div>
                <div className="text-xs text-zinc-500 font-medium">Today's overview</div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{todayHabits || 0}</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Habits</div>
              </div>
              {needsCheckIn && (
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-orange-500 animate-pulse shadow-lg shadow-red-500/50" />
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Pareto Matrix */}
        <Link to={createPageUrl('Pareto')} className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative h-40 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 p-5 overflow-hidden shadow-xl group-hover:border-zinc-600/50 transition-all group-active:scale-[0.97]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 rounded-full blur-2xl" />
            <div className="relative h-full flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <ListChecks className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-base font-bold mb-0.5">Pareto</div>
                <div className="text-[10px] text-zinc-500 font-medium">80/20 Matrix</div>
              </div>
            </div>
          </div>
        </Link>

        {/* Productivity & Habits */}
        <Link to={createPageUrl('Habits')} className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative h-40 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 p-5 overflow-hidden shadow-xl group-hover:border-zinc-600/50 transition-all group-active:scale-[0.97]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-600/10 to-teal-600/10 rounded-full blur-2xl" />
            <div className="relative h-full flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-base font-bold mb-0.5">Habits</div>
                <div className="text-[10px] text-zinc-500 font-medium">Track & Build</div>
              </div>
            </div>
          </div>
        </Link>

        {/* Schedule */}
        <Link to={createPageUrl('Calendar')} className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 to-rose-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative h-40 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 p-5 overflow-hidden shadow-xl group-hover:border-zinc-600/50 transition-all group-active:scale-[0.97]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-600/10 to-rose-600/10 rounded-full blur-2xl" />
            <div className="relative h-full flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-base font-bold mb-0.5">Schedule</div>
                <div className="text-[10px] text-zinc-500 font-medium">Events & Time</div>
              </div>
            </div>
          </div>
        </Link>

        {/* Screen Time Manager */}
        <Link to={createPageUrl('ScreenTimeManager')} className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-orange-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative h-40 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 p-5 overflow-hidden shadow-xl group-hover:border-zinc-600/50 transition-all group-active:scale-[0.97]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-600/10 to-orange-600/10 rounded-full blur-2xl" />
            <div className="relative h-full flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-base font-bold mb-0.5">Screen Time</div>
                <div className="text-[10px] text-zinc-500 font-medium">Block & Focus</div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* CEO Mode - Rectangular Black */}
      <Link to={createPageUrl('CEOMode')} className="block group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-zinc-700/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
        <div className="relative h-24 rounded-3xl bg-gradient-to-br from-black via-zinc-950 to-black border border-zinc-800/50 p-5 overflow-hidden shadow-2xl group-hover:border-zinc-700/50 transition-all group-active:scale-[0.98]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl" />
          <div className="relative flex items-center justify-between h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center shadow-lg border border-zinc-700/50">
                <Circle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold">CEO Mode</div>
                <div className="text-[10px] text-zinc-600 font-medium uppercase tracking-wide">Maximum Focus</div>
              </div>
            </div>
            <div className="text-zinc-700 text-xs font-semibold uppercase tracking-widest">
              Restricted
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}