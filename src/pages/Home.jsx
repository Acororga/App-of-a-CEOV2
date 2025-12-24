import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrCreateWinStreak, hasUncheckedHabits, startFocusSession } from '../functions/businessLogic';
import { base44 } from '@/api/base44Client';
import { subDays } from 'date-fns';
import { 
  BarChart3, CheckSquare, ClipboardList, Calendar, Shield, Circle, Zap, Plus, X, FileText 
} from 'lucide-react';
import FocusModeQuickStart from '../components/FocusModeQuickStart';
import HabitModal from '../components/habits/HabitModal';
import EventModal from '../components/calendar/EventModal';
import OnboardingTutorial from '../components/OnboardingTutorial';
import OnboardingQuestionnaire from '../components/OnboardingQuestionnaire';

export default function Home() {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showFocusModal, setShowFocusModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showParetoForm, setShowParetoForm] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    
    const hasCompletedQuestionnaire = localStorage.getItem('hasCompletedQuestionnaire');
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    
    if (!hasCompletedQuestionnaire) {
      setShowQuestionnaire(true);
    } else if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const handleCompleteQuestionnaire = () => {
    localStorage.setItem('hasCompletedQuestionnaire', 'true');
    setShowQuestionnaire(false);
    setShowTutorial(true);
  };

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

      {/* Header with User Icon, Rank, Streak, and Focus Button */}
      <div className="fixed top-6 left-6 right-6 z-50 flex items-center justify-between">
        {/* User Icon - Left */}
        <button
          onClick={() => setShowMenu(true)}
          className="w-11 h-11 rounded-full bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-800 flex items-center justify-center shadow-lg border border-zinc-700/50 hover:scale-105 transition-transform"
        >
          <span className="text-sm font-bold bg-gradient-to-br from-white to-zinc-300 bg-clip-text text-transparent">
            {user?.full_name?.charAt(0) || '?'}
          </span>
        </button>

        {/* Rank, Streak, and Focus Button - Right */}
        <div className="flex items-center gap-2">
          {/* Rank */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/60 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
            <div className="text-[9px] text-zinc-500 font-bold tracking-wider uppercase">Rank</div>
            <div className="text-sm font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm">
              {rankData?.rank_name || 'Panda'}
            </div>
          </div>
          
          {/* Streak */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/60 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
            <span className="text-base drop-shadow-lg">🔥</span>
            <span className="text-sm font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-sm">
              {streakData?.current_streak || 0}
            </span>
          </div>
          
          {/* Focus Mode Quick Button */}
          <button
            onClick={() => setShowFocusModal(true)}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-red-600 flex items-center justify-center shadow-[0_8px_24px_rgba(239,68,68,0.4)] hover:shadow-[0_12px_32px_rgba(239,68,68,0.5)] hover:scale-105 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/20" />
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Zap className="w-6 h-6 text-white relative z-10 drop-shadow-lg" />
          </button>
        </div>
      </div>

      {/* Dashboard Card - PRIMARY FOCUS */}
      <Link
        to={createPageUrl('Dashboard')}
        className="block mb-6 group relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 to-purple-500/40 rounded-3xl blur-3xl opacity-70 group-hover:opacity-90 transition-all duration-500" />
        <div className="relative h-40 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 backdrop-blur-xl border-2 border-zinc-700/90 p-6 overflow-hidden shadow-[0_12px_48px_rgba(0,0,0,0.6)] group-hover:shadow-[0_16px_64px_rgba(59,130,246,0.2)] transition-all duration-300 group-active:scale-[0.98]">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Light ray effect */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />

          <div className="relative flex items-center justify-between h-full">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-[0_8px_24px_rgba(59,130,246,0.4)] relative overflow-hidden group-hover:shadow-[0_12px_32px_rgba(59,130,246,0.5)] transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/20" />
                <BarChart3 className="w-8 h-8 text-white relative z-10 drop-shadow-lg" />
              </div>
              <div>
                <div className="text-xl font-bold mb-0.5 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">Dashboard</div>
                <div className="text-xs text-zinc-500">Your daily overview</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Visual State Indicator */}
              <div className={`relative text-center px-4 py-2 rounded-xl backdrop-blur-sm border transition-all ${
                (todayHabits || 0) === 0 && needsCheckIn
                  ? 'bg-red-950/30 border-red-700/40'
                  : (todayHabits || 0) >= 5
                  ? 'bg-emerald-950/30 border-emerald-700/40'
                  : (todayHabits || 0) >= 3
                  ? 'bg-blue-950/30 border-blue-700/40'
                  : 'bg-zinc-800/50 border-zinc-700/50'
              }`}>
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-800 overflow-hidden rounded-b-xl">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      (todayHabits || 0) >= 5 ? 'bg-emerald-400' : (todayHabits || 0) >= 3 ? 'bg-blue-400' : 'bg-zinc-600'
                    }`}
                    style={{ width: `${Math.min(100, ((todayHabits || 0) / 7) * 100)}%` }}
                  />
                </div>
                <div className={`text-3xl font-bold bg-gradient-to-b bg-clip-text text-transparent ${
                  (todayHabits || 0) === 0 && needsCheckIn
                    ? 'from-red-300 to-red-500'
                    : (todayHabits || 0) >= 5
                    ? 'from-emerald-200 to-emerald-400'
                    : (todayHabits || 0) >= 3
                    ? 'from-blue-200 to-blue-400'
                    : 'from-white to-zinc-400'
                }`}>{todayHabits || 0}</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mt-0.5">Habits</div>
              </div>
              {needsCheckIn && (
                <div className="relative flex items-center gap-1">
                  <div className="absolute inset-0 bg-red-500/40 rounded-full blur-lg animate-pulse" />
                  <div className="relative w-2 h-2 rounded-full bg-red-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Dynamic Grid */}
      {filteredApps.length === 4 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {filteredApps.map(app => (
            <Link key={app.id} to={createPageUrl(app.id)} className="group relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-500`} />
              <div className="relative h-40 rounded-2xl bg-gradient-to-br from-zinc-900/90 via-zinc-850/90 to-zinc-900/90 backdrop-blur-lg border border-zinc-700/50 p-4 overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.3)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] group-hover:border-zinc-600/60 transition-all duration-300 group-active:scale-[0.98]">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${app.glow} rounded-full blur-2xl opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700`} />
                {(app.id === 'Pareto' || app.id === 'Habits' || app.id === 'Calendar') && (
                  <button
                    onClick={(e) => handleQuickAddClick(e, app.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors z-10"
                  >
                    <Plus className="w-4 h-4 text-zinc-400" />
                  </button>
                )}
                <div className="relative h-full flex flex-col justify-between">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${app.colors} flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.4)] group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] transition-all duration-300 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/10" />
                    <app.icon className="w-7 h-7 text-white drop-shadow-lg relative z-10" />
                  </div>
                  <div>
                    <div className="text-lg font-bold mb-1 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">{app.name}</div>
                    <div className="text-xs text-zinc-500">Quick access</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {filteredApps.length === 3 && (
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-2 gap-3">
            {filteredApps.slice(0, 2).map(app => (
              <Link key={app.id} to={createPageUrl(app.id)} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-500`} />
                <div className="relative h-40 rounded-2xl bg-gradient-to-br from-zinc-900/90 via-zinc-850/90 to-zinc-900/90 backdrop-blur-lg border border-zinc-700/50 p-4 overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.3)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] group-hover:border-zinc-600/60 transition-all duration-300 group-active:scale-[0.98]">
                  <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${app.glow} rounded-full blur-xl opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700`} />
                  {(app.id === 'Pareto' || app.id === 'Habits' || app.id === 'Calendar') && (
                    <button
                      onClick={(e) => handleQuickAddClick(e, app.id)}
                      className="absolute top-2 right-2 p-1 rounded-lg bg-zinc-800/40 hover:bg-zinc-700/60 transition-colors z-10"
                    >
                      <Plus className="w-3.5 h-3.5 text-zinc-500" />
                    </button>
                  )}
                  <div className="relative h-full flex flex-col justify-between">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${app.colors} flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.3)] group-hover:shadow-[0_8px_28px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/10" />
                      <app.icon className="w-6 h-6 text-white drop-shadow-md relative z-10" />
                    </div>
                    <div>
                      <div className="text-base font-bold mb-0.5 text-white">{app.name}</div>
                      <div className="text-[10px] text-zinc-600 font-medium">Quick access</div>
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
                <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-500`} />
                <div className="relative h-40 rounded-2xl bg-gradient-to-br from-zinc-900/90 via-zinc-850/90 to-zinc-900/90 backdrop-blur-lg border border-zinc-700/50 p-4 overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.3)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] group-hover:border-zinc-600/60 transition-all duration-300 group-active:scale-[0.98]">
                  <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${app.glow} rounded-full blur-xl opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700`} />
                  {(app.id === 'Pareto' || app.id === 'Habits' || app.id === 'Calendar') && (
                    <button
                      onClick={(e) => handleQuickAddClick(e, app.id)}
                      className="absolute top-2 right-2 p-1 rounded-lg bg-zinc-800/40 hover:bg-zinc-700/60 transition-colors z-10"
                    >
                      <Plus className="w-3.5 h-3.5 text-zinc-500" />
                    </button>
                  )}
                  <div className="relative h-full flex flex-col justify-between">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${app.colors} flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.3)] group-hover:shadow-[0_8px_28px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/10" />
                      <Icon className="w-6 h-6 text-white drop-shadow-md relative z-10" />
                    </div>
                    <div>
                      <div className="text-base font-bold mb-0.5 text-white">{app.name}</div>
                      <div className="text-[10px] text-zinc-600 font-medium">Quick access</div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })()}
        </div>
      )}

      {filteredApps.length === 2 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {filteredApps.map(app => (
            <Link key={app.id} to={createPageUrl(app.id)} className="group relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-500`} />
              <div className="relative h-40 rounded-2xl bg-gradient-to-br from-zinc-900/90 via-zinc-850/90 to-zinc-900/90 backdrop-blur-lg border border-zinc-700/50 p-4 overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.3)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] group-hover:border-zinc-600/60 transition-all duration-300 group-active:scale-[0.98]">
                <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${app.glow} rounded-full blur-xl opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700`} />
                {(app.id === 'Pareto' || app.id === 'Habits' || app.id === 'Calendar') && (
                  <button
                    onClick={(e) => handleQuickAddClick(e, app.id)}
                    className="absolute top-2 right-2 p-1 rounded-lg bg-zinc-800/40 hover:bg-zinc-700/60 transition-colors z-10"
                  >
                    <Plus className="w-3.5 h-3.5 text-zinc-500" />
                  </button>
                )}
                <div className="relative h-full flex flex-col justify-between">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${app.colors} flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.3)] group-hover:shadow-[0_8px_28px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/10" />
                    <app.icon className="w-6 h-6 text-white drop-shadow-md relative z-10" />
                  </div>
                  <div>
                    <div className="text-base font-bold mb-0.5 text-white">{app.name}</div>
                    <div className="text-[10px] text-zinc-600 font-medium">Quick access</div>
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
          <div className="mb-6">
            <Link to={createPageUrl(app.id)} className="block group relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-500`} />
              <div className="relative h-40 rounded-2xl bg-gradient-to-br from-zinc-900/90 via-zinc-850/90 to-zinc-900/90 backdrop-blur-lg border border-zinc-700/50 p-4 overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.3)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] group-hover:border-zinc-600/60 transition-all duration-300 group-active:scale-[0.98]">
                <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${app.glow} rounded-full blur-xl opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700`} />
                {(app.id === 'Pareto' || app.id === 'Habits' || app.id === 'Calendar') && (
                  <button
                    onClick={(e) => handleQuickAddClick(e, app.id)}
                    className="absolute top-2 right-2 p-1 rounded-lg bg-zinc-800/40 hover:bg-zinc-700/60 transition-colors z-10"
                  >
                    <Plus className="w-3.5 h-3.5 text-zinc-500" />
                  </button>
                )}
                <div className="relative h-full flex flex-col justify-between">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${app.colors} flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.3)] group-hover:shadow-[0_8px_28px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/10" />
                    <Icon className="w-6 h-6 text-white drop-shadow-md relative z-10" />
                  </div>
                  <div>
                    <div className="text-base font-bold mb-0.5 text-white">{app.name}</div>
                    <div className="text-[10px] text-zinc-600 font-medium">Quick access</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        );
      })()}



      {/* CEO Mode - TERTIARY (Quieter) */}
      <Link to={createPageUrl('CEOMode')} className="block group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-600/5 to-zinc-700/5 rounded-2xl blur-md opacity-20 group-hover:opacity-30 transition-all duration-500" />
        <div className="relative h-24 rounded-2xl bg-gradient-to-br from-black/80 via-zinc-950/80 to-black/80 backdrop-blur-md border border-zinc-800/40 p-5 overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.4)] group-hover:shadow-[0_6px_24px_rgba(0,0,0,0.5)] group-hover:border-zinc-700/50 transition-all duration-300 group-active:scale-[0.99]">
          {/* Depth light */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-zinc-700/5 to-transparent rounded-full blur-2xl" />

          <div className="relative flex items-center justify-between h-full">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-zinc-850 via-zinc-900 to-black flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.5)] border border-zinc-800/40 relative overflow-hidden group-hover:border-zinc-700/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/[0.02]" />
                <Circle className="w-5 h-5 text-zinc-500 relative z-10" />
              </div>
              <div>
                <div className="text-base font-semibold text-zinc-400 mb-0.5">CEO Mode</div>
                <div className="text-[10px] text-zinc-700 font-medium">Maximum focus</div>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-zinc-900/30 border border-zinc-800/30">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-700">
                Restricted
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Slide-in Menu */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60]"
            onClick={() => setShowMenu(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-gradient-to-b from-zinc-900/98 via-zinc-950/98 to-black/98 backdrop-blur-xl border-r border-zinc-700/50 shadow-[0_0_80px_rgba(0,0,0,0.8)] z-[60] p-6 overflow-y-auto">
            <button
              onClick={() => setShowMenu(false)}
              className="absolute top-6 right-6 p-2 hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>

            {/* User Profile */}
            <div className="mb-8">
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-800 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.6)] border-2 border-zinc-700/60 mb-4 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/5 rounded-full" />
                <span className="text-3xl font-bold bg-gradient-to-br from-white to-zinc-300 bg-clip-text text-transparent">
                  {user?.full_name?.charAt(0) || '?'}
                </span>
              </div>
              <div className="text-xl font-bold text-center mb-1">{user?.full_name || 'User'}</div>
              <div className="text-sm text-zinc-500 text-center">{user?.email}</div>
            </div>

            {/* Quick Stats - Intelligent Visual State */}
            <div className="mb-6 grid grid-cols-3 gap-2">
              {/* Rank - Contextual State */}
              <div className="relative group">
                <div className={`absolute inset-0 rounded-xl blur-lg transition-opacity duration-300 ${
                  (rankData?.rank_level || 1) >= 5 
                    ? 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30 opacity-70' 
                    : (rankData?.rank_level || 1) >= 3 
                    ? 'bg-gradient-to-br from-amber-500/25 to-yellow-500/25 opacity-65'
                    : 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 opacity-60'
                } group-hover:opacity-90`} />
                <div className={`relative p-3 rounded-xl bg-zinc-900/80 backdrop-blur-sm border text-center transition-colors ${
                  (rankData?.rank_level || 1) >= 5 
                    ? 'border-cyan-700/60' 
                    : (rankData?.rank_level || 1) >= 3 
                    ? 'border-yellow-700/60'
                    : 'border-zinc-700/60'
                }`}>
                  <div className="text-2xl mb-1">{rankData?.rank_level || 1}</div>
                  <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Rank</div>
                  <div className={`text-xs font-bold mt-1 ${
                    (rankData?.rank_level || 1) >= 5 
                      ? 'bg-gradient-to-r from-cyan-200 to-blue-400 bg-clip-text text-transparent'
                      : (rankData?.rank_level || 1) >= 3 
                      ? 'bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent'
                      : 'bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent'
                  }`}>
                    {rankData?.rank_name || 'Panda'}
                  </div>
                </div>
              </div>

              {/* Streak - Visual Intensity */}
              <div className="relative group">
                <div className={`absolute inset-0 rounded-xl blur-lg transition-all duration-300 ${
                  (streakData?.current_streak || 0) >= 7 
                    ? 'bg-gradient-to-br from-orange-500/40 to-red-500/40 opacity-80 animate-pulse' 
                    : (streakData?.current_streak || 0) >= 3 
                    ? 'bg-gradient-to-br from-orange-500/25 to-red-500/25 opacity-70'
                    : (streakData?.current_streak || 0) >= 1
                    ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 opacity-60'
                    : 'bg-gradient-to-br from-zinc-600/15 to-zinc-500/15 opacity-40'
                } group-hover:opacity-90`} />
                <div className={`relative p-3 rounded-xl bg-zinc-900/80 backdrop-blur-sm border text-center transition-all ${
                  (streakData?.current_streak || 0) >= 7
                    ? 'border-orange-600/70 shadow-[0_0_20px_rgba(249,115,22,0.2)]'
                    : (streakData?.current_streak || 0) >= 3
                    ? 'border-orange-700/60'
                    : (streakData?.current_streak || 0) >= 1
                    ? 'border-zinc-700/60'
                    : 'border-zinc-800/50'
                }`}>
                  <div className="text-2xl mb-1">{(streakData?.current_streak || 0) === 0 ? '💤' : '🔥'}</div>
                  <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Streak</div>
                  <div className={`text-xl font-bold mt-1 transition-all ${
                    (streakData?.current_streak || 0) >= 7
                      ? 'bg-gradient-to-r from-orange-300 to-red-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]'
                      : (streakData?.current_streak || 0) >= 3
                      ? 'bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent'
                      : (streakData?.current_streak || 0) >= 1
                      ? 'bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent'
                      : 'text-zinc-600'
                  }`}>
                    {streakData?.current_streak || 0}
                  </div>
                </div>
              </div>

              {/* Today's Habits - Progress State */}
              <div className="relative group">
                <div className={`absolute inset-0 rounded-xl blur-lg transition-opacity duration-300 ${
                  (todayHabits || 0) >= 5 
                    ? 'bg-gradient-to-br from-emerald-500/30 to-green-500/30 opacity-75'
                    : (todayHabits || 0) >= 3 
                    ? 'bg-gradient-to-br from-blue-500/25 to-purple-500/25 opacity-65'
                    : (todayHabits || 0) >= 1
                    ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-60'
                    : 'bg-gradient-to-br from-zinc-600/15 to-zinc-500/15 opacity-40'
                } group-hover:opacity-85`} />
                <div className={`relative p-3 rounded-xl bg-zinc-900/80 backdrop-blur-sm border text-center transition-colors ${
                  (todayHabits || 0) >= 5
                    ? 'border-emerald-700/60'
                    : (todayHabits || 0) >= 3
                    ? 'border-blue-700/60'
                    : (todayHabits || 0) >= 1
                    ? 'border-zinc-700/60'
                    : 'border-zinc-800/50'
                }`}>
                  <div className="text-2xl mb-1">{(todayHabits || 0) === 0 ? '○' : '✓'}</div>
                  <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Today</div>
                  <div className={`text-xl font-bold mt-1 ${
                    (todayHabits || 0) >= 5
                      ? 'bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent'
                      : (todayHabits || 0) >= 3
                      ? 'bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent'
                      : (todayHabits || 0) >= 1
                      ? 'bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent'
                      : 'text-zinc-600'
                  }`}>
                    {todayHabits || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Intelligent Alert - Visual Priority */}
            {needsCheckIn && (
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-orange-500/30 rounded-xl blur-lg animate-pulse" />
                <div className="relative p-3 rounded-xl bg-gradient-to-r from-red-950/90 to-orange-950/90 backdrop-blur-sm border-2 border-red-500/40 shadow-[0_0_24px_rgba(239,68,68,0.3)]">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500 rounded-full blur-sm animate-pulse" />
                      <div className="relative w-2 h-2 rounded-full bg-red-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-red-300">Action Required</div>
                      <div className="text-[10px] text-red-400/60 font-medium">Yesterday unvalidated</div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                      <span className="text-red-300 font-black text-xs">!</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link
                to={createPageUrl('BiannualReport')}
                onClick={() => setShowMenu(false)}
                className="group flex items-center gap-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-purple-500/30 hover:bg-zinc-900/70 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/10 rounded-lg" />
                  <BarChart3 className="w-5 h-5 text-white relative z-10" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">6-Month Report</div>
                  <div className="text-xs text-zinc-500">Your progress overview</div>
                </div>
              </Link>

              <div className="space-y-2">
                <div className="text-[10px] text-zinc-600 uppercase tracking-wider font-bold mb-3 px-1">Active Apps</div>
                {[
                  { id: 'Pareto', name: 'To-Do', icon: ClipboardList, color: 'from-indigo-500 to-purple-600' },
                  { id: 'Habits', name: 'Habits', icon: CheckSquare, color: 'from-emerald-500 to-teal-600' },
                  { id: 'Calendar', name: 'Schedule', icon: Calendar, color: 'from-pink-500 to-rose-600' },
                  { id: 'ScreenTimeManager', name: 'Screen Time', icon: Shield, color: 'from-red-500 to-orange-600' }
                ].map(app => {
                  const currentApps = appSettingsData?.active_apps || [];
                  const isActive = currentApps.includes(app.id);
                  const Icon = app.icon;
                  return (
                    <button
                      key={app.id}
                      onClick={() => {
                        const newApps = isActive
                          ? currentApps.filter(a => a !== app.id)
                          : [...currentApps, app.id];
                        base44.entities.AppSettings.update(appSettingsData.id, { active_apps: newApps }).then(() => {
                          queryClient.invalidateQueries(['appSettings']);
                        });
                      }}
                      className={`group w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                        isActive
                          ? 'bg-zinc-900/60 border-zinc-700/50 hover:border-zinc-600/50'
                          : 'bg-zinc-950/30 border-zinc-800/30 opacity-40 hover:opacity-70'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.02] to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${app.color} flex items-center justify-center shadow-md relative ${!isActive && 'opacity-40'}`}>
                        <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/10 rounded-lg" />
                        <Icon className="w-4 h-4 text-white relative z-10" />
                      </div>
                      <div className="text-left flex-1">
                        <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                          {app.name}
                        </div>
                      </div>
                      <div className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isActive ? 'border-green-500 bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]' : 'border-zinc-700'
                      }`}>
                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                className="group w-full flex items-center gap-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-green-500/30 hover:bg-zinc-900/70 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/10 rounded-lg" />
                  <FileText className="w-5 h-5 text-white relative z-10" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold">Privacy Policy</div>
                  <div className="text-xs text-zinc-500">Terms & conditions</div>
                </div>
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800/50">
              <button
                onClick={() => base44.auth.logout()}
                className="w-full p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-950/40 hover:border-red-900/50 transition-all duration-300 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}

      {showQuestionnaire && <OnboardingQuestionnaire onComplete={handleCompleteQuestionnaire} />}
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