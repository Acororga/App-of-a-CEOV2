import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrCreateWinStreak, hasUncheckedHabits, startFocusSession } from '../functions/businessLogic';
import { base44 } from '@/api/base44Client';
import { subDays } from 'date-fns';
import { 
  BarChart3, CheckSquare, ListChecks, Calendar, Shield, Circle, Zap 
} from 'lucide-react';
import FocusModeQuickStart from '../components/FocusModeQuickStart';

export default function Home() {
  const [user, setUser] = useState(null);
  const [showFocusModal, setShowFocusModal] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const { data: appSettingsData } = useQuery({
    queryKey: ['appSettings'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const settings = await base44.entities.AppSettings.filter({ created_by: user.email });
      if (settings.length === 0) {
        const newSettings = await base44.entities.AppSettings.create({
          active_apps: ['Pareto', 'Habits', 'Calendar', 'ScreenTimeManager']
        });
        return newSettings;
      }
      return settings[0];
    }
  });

  const activeApps = appSettingsData?.active_apps || ['Pareto', 'Habits', 'Calendar', 'ScreenTimeManager'];

  const startFocusMutation = useMutation({
    mutationFn: async (duration) => {
      return await startFocusSession(duration);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activeSession']);
      navigate(createPageUrl('FocusMode'));
    }
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleFocusStart = (duration) => {
    startFocusMutation.mutate(duration);
  };

  const apps = [
    { id: 'Pareto', name: 'Pareto', icon: ListChecks, gradient: 'from-indigo-600/20 to-purple-600/20', colors: 'from-indigo-500 to-purple-600', glow: 'from-indigo-600/10 to-purple-600/10' },
    { id: 'Habits', name: 'Habits', icon: CheckSquare, gradient: 'from-emerald-600/20 to-teal-600/20', colors: 'from-emerald-500 to-teal-600', glow: 'from-emerald-600/10 to-teal-600/10' },
    { id: 'Calendar', name: 'Schedule', icon: Calendar, gradient: 'from-pink-600/20 to-rose-600/20', colors: 'from-pink-500 to-rose-600', glow: 'from-pink-600/10 to-rose-600/10' },
    { id: 'ScreenTimeManager', name: 'Screen Time', icon: Shield, gradient: 'from-red-600/20 to-orange-600/20', colors: 'from-red-500 to-orange-600', glow: 'from-red-600/10 to-orange-600/10' }
  ];

  const filteredApps = apps.filter(app => activeApps.includes(app.id));
  
  const isScreenTimeActive = activeApps.includes('ScreenTimeManager');

  const getRankBackground = () => {
    const rankLevel = rankData?.rank_level || 1;
    
    const backgrounds = {
      1: { branches: 'from-amber-700/20 via-orange-600/20 to-amber-800/20' },
      2: { branches: 'from-gray-400/20 via-gray-500/20 to-gray-400/20' },
      3: { branches: 'from-yellow-500/20 via-yellow-600/20 to-yellow-400/20' },
      4: { branches: 'from-cyan-300/20 via-slate-400/20 to-cyan-300/20' },
      5: { branches: 'from-blue-300/20 via-cyan-400/20 to-blue-300/20' },
      6: { branches: 'from-zinc-900/30 via-black/30 to-zinc-900/30' },
      7: { branches: 'from-yellow-500/30 via-yellow-600/30 to-yellow-500/30' }
    };
    
    return backgrounds[rankLevel] || backgrounds[1];
  };

  const bgStyle = getRankBackground();

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6 pt-20 relative overflow-hidden">
      {/* Rank Branches - Only visible when ScreenTimeManager is active */}
      {isScreenTimeActive && (
        <>
          <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl ${bgStyle.branches} rounded-full blur-3xl opacity-40 pointer-events-none`} />
          <div className={`absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr ${bgStyle.branches} rounded-full blur-3xl opacity-40 pointer-events-none`} />
        </>
      )}

      {/* Focus Mode Quick Button */}
      <button
        onClick={() => setShowFocusModal(true)}
        className="fixed top-6 right-6 z-50 w-11 h-11 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        <Zap className="w-5 h-5 text-white" />
      </button>

      {/* Header */}
      <div className="relative flex justify-end items-center mb-10">
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

      {/* Dynamic Grid */}
      {filteredApps.length === 4 && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {filteredApps.map(app => (
            <Link key={app.id} to={createPageUrl(app.id)} className="group relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} rounded-2xl blur-xl group-hover:blur-2xl transition-all`} />
              <div className="relative h-40 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 p-5 overflow-hidden shadow-xl group-hover:border-zinc-600/50 transition-all group-active:scale-[0.97]">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${app.glow} rounded-full blur-2xl`} />
                <div className="relative h-full flex flex-col justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.colors} flex items-center justify-center shadow-lg`}>
                    <app.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-base font-bold mb-0.5">{app.name}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {filteredApps.length === 3 && (
        <div className="space-y-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            {filteredApps.slice(0, 2).map(app => (
              <Link key={app.id} to={createPageUrl(app.id)} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} rounded-2xl blur-xl group-hover:blur-2xl transition-all`} />
                <div className="relative h-40 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 p-5 overflow-hidden shadow-xl group-hover:border-zinc-600/50 transition-all group-active:scale-[0.97]">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${app.glow} rounded-full blur-2xl`} />
                  <div className="relative h-full flex flex-col justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.colors} flex items-center justify-center shadow-lg`}>
                      <app.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-base font-bold mb-0.5">{app.name}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {(() => {
            const app = filteredApps[2];
            const Icon = app.icon;
            return (
              <Link to={createPageUrl(app.id)} className="block group relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} rounded-2xl blur-xl group-hover:blur-2xl transition-all`} />
                <div className="relative h-40 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 p-5 overflow-hidden shadow-xl group-hover:border-zinc-600/50 transition-all group-active:scale-[0.97]">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${app.glow} rounded-full blur-2xl`} />
                  <div className="relative h-full flex flex-col justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.colors} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-base font-bold mb-0.5">{app.name}</div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })()}
        </div>
      )}

      {filteredApps.length === 2 && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {filteredApps.map(app => (
            <Link key={app.id} to={createPageUrl(app.id)} className="group relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} rounded-2xl blur-xl group-hover:blur-2xl transition-all`} />
              <div className="relative h-40 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 p-5 overflow-hidden shadow-xl group-hover:border-zinc-600/50 transition-all group-active:scale-[0.97]">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${app.glow} rounded-full blur-2xl`} />
                <div className="relative h-full flex flex-col justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.colors} flex items-center justify-center shadow-lg`}>
                    <app.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-base font-bold mb-0.5">{app.name}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {filteredApps.length === 1 && (() => {
        const app = filteredApps[0];
        const Icon = app.icon;
        return (
          <div className="mb-4">
            <Link to={createPageUrl(app.id)} className="block group relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} rounded-2xl blur-xl group-hover:blur-2xl transition-all`} />
              <div className="relative h-40 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 p-5 overflow-hidden shadow-xl group-hover:border-zinc-600/50 transition-all group-active:scale-[0.97]">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${app.glow} rounded-full blur-2xl`} />
                <div className="relative h-full flex flex-col justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.colors} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-base font-bold mb-0.5">{app.name}</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        );
      })()}



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

      <FocusModeQuickStart
        open={showFocusModal}
        onClose={() => setShowFocusModal(false)}
        onStart={handleFocusStart}
      />
    </div>
  );
}