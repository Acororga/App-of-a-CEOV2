import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrCreateWinStreak, hasUncheckedHabits, startFocusSession } from '../functions/businessLogic';
import { base44 } from '@/api/base44Client';
import { subDays } from 'date-fns';
import { 
  BarChart3, CheckSquare, ClipboardList, Calendar, Shield, Circle, Zap, Plus 
} from 'lucide-react';
import FocusModeQuickStart from '../components/FocusModeQuickStart';
import HabitModal from '../components/habits/HabitModal';
import EventModal from '../components/calendar/EventModal';
import OnboardingTutorial from '../components/OnboardingTutorial';

export default function Home() {
  const [user, setUser] = useState(null);
  const [showFocusModal, setShowFocusModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showParetoForm, setShowParetoForm] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const handleCompleteTutorial = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setShowTutorial(false);
  };

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

  const { data: appSettingsData, isLoading: settingsLoading } = useQuery({
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

  const activeApps = appSettingsData?.active_apps || [];
  const isScreenTimeActive = !settingsLoading && appSettingsData && activeApps.includes('ScreenTimeManager');

  const startFocusMutation = useMutation({
    mutationFn: async (duration) => {
      return await startFocusSession(duration);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activeSession']);
      navigate(createPageUrl('FocusMode'));
    }
  });

  const { data: objectives } = useQuery({
    queryKey: ['objectives'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.Objective.filter({ created_by: user.email, archived: false });
    }
  });

  const createHabitMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return await base44.entities.Habit.create({
        ...data,
        created_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allHabits']);
      queryClient.invalidateQueries(['habits']);
      setShowHabitModal(false);
    }
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData) => {
      const user = await base44.auth.me();
      return await base44.entities.CalendarEvent.create({
        ...eventData,
        created_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      setShowEventModal(false);
    }
  });

  const handleQuickAddClick = (e, appId) => {
    e.preventDefault();
    e.stopPropagation();
    if (appId === 'Habits') {
      setShowHabitModal(true);
    } else if (appId === 'Calendar') {
      setShowEventModal(true);
    } else if (appId === 'Pareto') {
      navigate(createPageUrl('Pareto'));
      setTimeout(() => {
        const addButton = document.querySelector('[data-pareto-add]');
        if (addButton) addButton.click();
      }, 100);
    }
  };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleFocusStart = (duration) => {
    startFocusMutation.mutate(duration);
  };

  const apps = [
    { id: 'Pareto', name: 'To-Do', icon: ClipboardList, gradient: 'from-indigo-600/20 to-purple-600/20', colors: 'from-indigo-500 to-purple-600', glow: 'from-indigo-600/10 to-purple-600/10' },
    { id: 'Habits', name: 'Habits', icon: CheckSquare, gradient: 'from-emerald-600/20 to-teal-600/20', colors: 'from-emerald-500 to-teal-600', glow: 'from-emerald-600/10 to-teal-600/10' },
    { id: 'Calendar', name: 'Schedule', icon: Calendar, gradient: 'from-pink-600/20 to-rose-600/20', colors: 'from-pink-500 to-rose-600', glow: 'from-pink-600/10 to-rose-600/10' },
    { id: 'ScreenTimeManager', name: 'Screen Time', icon: Shield, gradient: 'from-red-600/20 to-orange-600/20', colors: 'from-red-500 to-orange-600', glow: 'from-red-600/10 to-orange-600/10' }
  ];

  const filteredApps = apps.filter(app => activeApps.includes(app.id));

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
      {/* Modern texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      {/* Rank Branches - Only visible when ScreenTimeManager is active */}
      {isScreenTimeActive && (
        <>
          <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl ${bgStyle.branches} rounded-full blur-3xl opacity-40 pointer-events-none`} />
          <div className={`absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr ${bgStyle.branches} rounded-full blur-3xl opacity-40 pointer-events-none`} />
        </>
      )}

      {/* Header with Rank, Streak, and Focus Button */}
      <div className="fixed top-6 left-6 right-6 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Rank */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50">
            <div className="text-[10px] text-zinc-500 font-semibold tracking-wider">RANK</div>
            <div className="text-xs font-bold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">
              {rankData?.rank_name || 'Panda'}
            </div>
          </div>
          
          {/* Streak */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              {streakData?.current_streak || 0}
            </span>
          </div>
        </div>

        {/* Focus Mode Quick Button */}
        <button
          onClick={() => setShowFocusModal(true)}
          className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg hover:scale-105 transition-transform relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
          <Zap className="w-5 h-5 text-white relative z-10" />
        </button>
      </div>

      {/* Dashboard Card - Large Rectangular */}
      <Link
        to={createPageUrl('Dashboard')}
        className="block mb-4 group relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
        <div className="relative h-32 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 p-6 overflow-hidden shadow-2xl group-hover:border-zinc-600/50 transition-all group-active:scale-[0.98]">
          {/* Texture overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
          }} />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-3xl" />
          <div className="relative flex items-center justify-between h-full">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                <BarChart3 className="w-7 h-7 text-white relative z-10" />
              </div>
              <div>
                <div className="text-xl font-bold">Dashboard</div>
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
                {(app.id === 'Pareto' || app.id === 'Habits' || app.id === 'Calendar') && (
                  <button
                    onClick={(e) => handleQuickAddClick(e, app.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors z-10"
                  >
                    <Plus className="w-4 h-4 text-zinc-400" />
                  </button>
                )}
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
                  {(app.id === 'Pareto' || app.id === 'Habits' || app.id === 'Calendar') && (
                    <button
                      onClick={(e) => handleQuickAddClick(e, app.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors z-10"
                    >
                      <Plus className="w-4 h-4 text-zinc-400" />
                    </button>
                  )}
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
                  {(app.id === 'Pareto' || app.id === 'Habits' || app.id === 'Calendar') && (
                    <button
                      onClick={(e) => handleQuickAddClick(e, app.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors z-10"
                    >
                      <Plus className="w-4 h-4 text-zinc-400" />
                    </button>
                  )}
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
                {(app.id === 'Pareto' || app.id === 'Habits' || app.id === 'Calendar') && (
                  <button
                    onClick={(e) => handleQuickAddClick(e, app.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors z-10"
                  >
                    <Plus className="w-4 h-4 text-zinc-400" />
                  </button>
                )}
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
                {(app.id === 'Pareto' || app.id === 'Habits' || app.id === 'Calendar') && (
                  <button
                    onClick={(e) => handleQuickAddClick(e, app.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors z-10"
                  >
                    <Plus className="w-4 h-4 text-zinc-400" />
                  </button>
                )}
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
          {/* Texture */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`
          }} />
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl" />
          <div className="relative flex items-center justify-between h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center shadow-lg border border-zinc-700/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
                <Circle className="w-6 h-6 text-white relative z-10" />
              </div>
              <div>
                <div className="text-lg font-bold">CEO Mode</div>
              </div>
            </div>
            <div className="text-zinc-700 text-xs font-semibold uppercase tracking-widest">
              Restricted
            </div>
          </div>
        </div>
      </Link>

      {showTutorial && <OnboardingTutorial onComplete={handleCompleteTutorial} />}

      <FocusModeQuickStart
        open={showFocusModal}
        onClose={() => setShowFocusModal(false)}
        onStart={handleFocusStart}
      />

      <HabitModal
        open={showHabitModal}
        onClose={() => setShowHabitModal(false)}
        onSubmit={(data) => createHabitMutation.mutate(data)}
        objectives={objectives}
      />

      <EventModal
        open={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSubmit={(data) => createEventMutation.mutate(data)}
      />
    </div>
  );
}