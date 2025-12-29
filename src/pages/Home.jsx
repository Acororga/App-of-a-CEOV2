import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrCreateWinStreak, hasUncheckedHabits, startFocusSession } from '../functions/businessLogic';
import { base44 } from '@/api/base44Client';
import { subDays } from 'date-fns';
import { 
  BarChart3, CheckSquare, ClipboardList, Calendar, Shield, Circle, Zap, Plus, X, FileText, Settings as SettingsIcon
} from 'lucide-react';
import FocusModeQuickStart from '../components/FocusModeQuickStart';
import HabitModal from '../components/habits/HabitModal';
import EventModal from '../components/calendar/EventModal';
import OnboardingTutorial from '../components/OnboardingTutorial';
import OnboardingQuestionnaire from '../components/OnboardingQuestionnaire';
import { useLanguage } from '../components/LanguageProvider';
import { useRankAmbient } from '../components/RankAmbientProvider';

// Ajout des animations CSS dans le style global
const style = document.createElement('style');
style.textContent = `
  @keyframes scan {
    0%, 100% { transform: translateY(0); opacity: 0; }
    10% { opacity: 0.6; }
    50% { transform: translateY(100%); opacity: 0.4; }
    90% { opacity: 0.6; }
  }
  @keyframes pulse-ring {
    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
    100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }
  @keyframes shield-pulse {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
    100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
  }
  .perspective-1000 { perspective: 1000px; }
`;
if (!document.querySelector('style[data-futuristic-icons]')) {
  style.setAttribute('data-futuristic-icons', 'true');
  document.head.appendChild(style);
}

export default function Home() {
  const { t } = useLanguage();
  const { ambientStyles, isCEO } = useRankAmbient();
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showFocusModal, setShowFocusModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
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
    { 
      id: 'Pareto', 
      name: t('todo'), 
      icon: ClipboardList, 
      gradient: 'from-indigo-600/20 to-purple-600/20', 
      colors: 'from-indigo-500 to-purple-600', 
      glow: 'from-indigo-600/10 to-purple-600/10',
      customIcon: (
        <div className="relative w-full h-full">
          <div className="absolute inset-0 rounded-[18px]" style={{
            background: 'linear-gradient(145deg, #3d3d3d 0%, #2f2f2f 100%)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03), inset 0 -1px 0 rgba(0, 0, 0, 0.3)'
          }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-[52%] h-[52%]" viewBox="0 0 24 24" fill="none">
              <g style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' }}>
                <rect x="6" y="5" width="12" height="3" rx="1.5" fill="#7a9b9e" opacity="0.85" />
                <rect x="6" y="10.5" width="12" height="3" rx="1.5" fill="#7a9b9e" opacity="0.85" />
                <rect x="6" y="16" width="12" height="3" rx="1.5" fill="#7a9b9e" opacity="0.85" />
                <path d="M9 6.5l1.5 1.5 3-3" stroke="#5a7d7f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>
            </svg>
          </div>
        </div>
      )
    },
    { 
      id: 'Habits', 
      name: t('habits'), 
      icon: CheckSquare, 
      gradient: 'from-emerald-600/20 to-teal-600/20', 
      colors: 'from-emerald-500 to-teal-600', 
      glow: 'from-emerald-600/10 to-teal-600/10',
      customIcon: (
        <div className="relative w-full h-full">
          <div className="absolute inset-0 rounded-[18px]" style={{
            background: 'linear-gradient(145deg, #3d3d3d 0%, #2f2f2f 100%)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03), inset 0 -1px 0 rgba(0, 0, 0, 0.3)'
          }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-[54%] h-[54%]" viewBox="0 0 24 24" fill="none">
              <g style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' }}>
                <rect x="7" y="8" width="5" height="2" rx="1" fill="#7a9b9e" opacity="0.85" />
                <rect x="13" y="8" width="4" height="2" rx="1" fill="#7a9b9e" opacity="0.75" />
                <rect x="7" y="11.5" width="5" height="2" rx="1" fill="#7a9b9e" opacity="0.85" />
                <rect x="13" y="11.5" width="4" height="2" rx="1" fill="#7a9b9e" opacity="0.75" />
                <rect x="7" y="15" width="5" height="2" rx="1" fill="#7a9b9e" opacity="0.85" />
                <rect x="13" y="15" width="4" height="2" rx="1" fill="#7a9b9e" opacity="0.75" />
                <path d="M9.5 8.8l0.8 0.8 1.5-1.5" stroke="#5a7d7f" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>
            </svg>
          </div>
        </div>
      )
    },
    { 
      id: 'Calendar', 
      name: t('schedule'), 
      icon: Calendar, 
      gradient: 'from-pink-600/20 to-rose-600/20', 
      colors: 'from-pink-500 to-rose-600', 
      glow: 'from-pink-600/10 to-rose-600/10',
      customIcon: (
        <div className="relative w-full h-full">
          <div className="absolute inset-0 rounded-[18px]" style={{
            background: 'linear-gradient(145deg, #3d3d3d 0%, #2f2f2f 100%)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03), inset 0 -1px 0 rgba(0, 0, 0, 0.3)'
          }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-[56%] h-[56%]" viewBox="0 0 24 24" fill="none">
              <g style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' }}>
                <rect x="5" y="7" width="14" height="12" rx="2" fill="#7a9b9e" opacity="0.85" />
                <rect x="5" y="4" width="14" height="4" rx="2" fill="#6a8b8d" opacity="0.9" />
                <circle cx="9" cy="12" r="0.8" fill="#5a7d7f" opacity="0.7" />
                <circle cx="12" cy="12" r="0.8" fill="#5a7d7f" opacity="0.8" />
                <circle cx="15" cy="12" r="0.8" fill="#5a7d7f" opacity="0.7" />
                <circle cx="9" cy="15" r="0.8" fill="#5a7d7f" opacity="0.65" />
                <circle cx="12" cy="15" r="0.8" fill="#5a7d7f" opacity="0.65" />
              </g>
            </svg>
          </div>
        </div>
      )
    },
    { 
      id: 'ScreenTimeManager', 
      name: t('screenTime'), 
      icon: Shield, 
      gradient: 'from-red-600/20 to-orange-600/20', 
      colors: 'from-red-500 to-orange-600', 
      glow: 'from-red-600/10 to-orange-600/10',
      customIcon: (
        <div className="relative w-full h-full">
          <div className="absolute inset-0 rounded-[18px]" style={{
            background: 'linear-gradient(145deg, #3d3d3d 0%, #2f2f2f 100%)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03), inset 0 -1px 0 rgba(0, 0, 0, 0.3)'
          }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-[58%] h-[58%]" viewBox="0 0 24 24" fill="none">
              <g style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' }}>
                <path d="M12 4L5 7.5v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10v-5L12 4z" 
                      fill="#7a9b9e" opacity="0.85" />
                <circle cx="12" cy="13" r="2.5" fill="#5a7d7f" opacity="0.8" />
                <path d="M12 10.5v3l1.5 1.5" stroke="#3d5d5f" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              </g>
            </svg>
          </div>
        </div>
      )
    }
  ];

  const filteredApps = apps.filter(app => activeApps.includes(app.id));



  return (
    <div className="min-h-screen bg-black text-white p-6 pt-20 relative overflow-hidden">
      {/* Noise texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px'
      }} />

      {/* Header */}
      <div className="fixed top-6 left-6 right-6 z-50 flex items-center justify-between">
        <button
          onClick={() => setShowMenu(true)}
          className="w-11 h-11 rounded-full bg-gradient-to-br from-zinc-800/90 via-zinc-700/90 to-zinc-800/90 backdrop-blur-xl flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] border border-zinc-700/30 hover:scale-105 active:scale-100 transition-all duration-150"
        >
          <span className="text-sm font-bold bg-gradient-to-br from-white to-zinc-300 bg-clip-text text-transparent drop-shadow-sm">
            {user?.full_name?.charAt(0) || '?'}
          </span>
        </button>

        <div className="flex items-center gap-2">
          {/* Rank */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="text-[9px] text-zinc-600 font-bold tracking-wider uppercase">Rank</div>
            <div className="text-sm font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm">
              {rankData?.rank_name || 'Panda'}
            </div>
          </div>
          
          {/* Streak */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)]">
            <span className="text-base drop-shadow-[0_2px_8px_rgba(251,146,60,0.4)]">🔥</span>
            <span className="text-sm font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-sm">
              {streakData?.current_streak || 0}
            </span>
          </div>
          
          {/* Focus Mode Quick Button */}
          <button
            onClick={() => setShowFocusModal(true)}
            className={`w-12 h-12 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 relative overflow-hidden group ${
              isCEO 
                ? 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-600 shadow-[0_8px_32px_rgba(234,179,8,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_12px_40px_rgba(234,179,8,0.6)]'
                : 'bg-gradient-to-br from-orange-500 via-red-500 to-red-600 shadow-[0_8px_32px_rgba(239,68,68,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_12px_40px_rgba(239,68,68,0.6)]'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/25" />
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <Zap className="w-6 h-6 text-white relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
          </button>
        </div>
      </div>

      {/* Main content - ACTION ZONE */}
      <div className="space-y-6 mb-6">
        {/* Critical Alert - Maximum visual priority */}
        {needsCheckIn && (
          <div className="relative animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/40 to-orange-500/40 rounded-[28px] blur-2xl animate-pulse" />
            <div className="relative p-6 rounded-3xl bg-gradient-to-br from-red-950/95 to-orange-950/95 backdrop-blur-xl border-2 border-red-500/50 shadow-[0_16px_64px_rgba(239,68,68,0.4),0_0_0_1px_rgba(239,68,68,0.1),inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-3 h-3 rounded-full bg-red-400 shadow-[0_0_16px_rgba(248,113,113,0.8)]" />
                </div>
                <div className="flex-1">
                  <div className="text-base font-black text-red-200 mb-1 tracking-tight">ACTION REQUIRED</div>
                  <div className="text-xs text-red-400/70 font-medium">Yesterday unvalidated</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-red-500/30 border-2 border-red-500/50 flex items-center justify-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]">
                  <span className="text-red-200 font-black text-lg drop-shadow-sm">!</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard - PRIMARY ACTION */}
        <Link
          to={createPageUrl('Dashboard')}
          className="block group relative animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="absolute inset-0 rounded-[32px] blur-[48px] opacity-60 group-hover:opacity-90 group-active:opacity-70 transition-all duration-300" style={{
            background: `linear-gradient(to bottom right, rgba(${ambientStyles.accentRgb}, 0.3), rgba(${ambientStyles.accentRgb}, 0.2))`
          }} />
          <div className="relative h-44 rounded-[32px] bg-gradient-to-br from-zinc-900/95 via-zinc-850/95 to-zinc-900/95 backdrop-blur-xl border-2 border-zinc-700/60 p-7 overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(59,130,246,0.1),inset_0_1px_0_rgba(255,255,255,0.05)] group-hover:shadow-[0_24px_96px_rgba(59,130,246,0.3),0_0_0_1px_rgba(59,130,246,0.15)] group-active:scale-[0.99] transition-all duration-200">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/8 via-transparent to-purple-600/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-700" style={{
              background: `linear-gradient(to bottom right, rgba(${ambientStyles.accentRgb}, 0.2), rgba(${ambientStyles.accentRgb}, 0.15))`
            }} />

            <div className="relative flex items-center justify-between h-full">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 group-active:scale-[0.96] transition-transform duration-100 relative">
                  <div className="absolute inset-0 rounded-[16px]" style={{
                    background: 'linear-gradient(145deg, #3d3d3d 0%, #2f2f2f 100%)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03), inset 0 -1px 0 rgba(0, 0, 0, 0.3)'
                  }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-[56%] h-[56%]" viewBox="0 0 24 24" fill="none">
                      <g style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' }}>
                        <rect x="6.5" y="13" width="3" height="7" rx="1"
                              fill="#7a9b9e" opacity="0.75"/>
                        <rect x="10.5" y="9" width="3" height="11" rx="1"
                              fill="#7a9b9e" opacity="0.85"/>
                        <rect x="14.5" y="6" width="3" height="14" rx="1"
                              fill="#7a9b9e" opacity="0.85"/>
                      </g>
                    </svg>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black mb-1 bg-gradient-to-r from-white via-white to-zinc-200 bg-clip-text text-transparent drop-shadow-sm tracking-tight">{t('dashboard')}</div>
                  <div className="text-xs text-zinc-500 font-medium">{t('yourDailyControlCenter')}</div>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className={`relative text-center px-5 py-3 rounded-2xl backdrop-blur-sm border-2 transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] ${
                  (todayHabits || 0) === 0 && needsCheckIn
                    ? 'bg-red-950/40 border-red-600/50'
                    : (todayHabits || 0) >= 5
                    ? 'bg-emerald-950/40 border-emerald-600/50'
                    : (todayHabits || 0) >= 3
                    ? 'bg-blue-950/40 border-blue-600/50'
                    : 'bg-zinc-800/60 border-zinc-700/50'
                }`}>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-900 overflow-hidden rounded-b-2xl">
                    <div 
                      className={`h-full transition-all duration-500 shadow-[0_0_8px_currentColor] ${
                        (todayHabits || 0) >= 5 ? 'bg-emerald-400' : (todayHabits || 0) >= 3 ? 'bg-blue-400' : 'bg-zinc-600'
                      }`}
                      style={{ width: `${Math.min(100, ((todayHabits || 0) / 7) * 100)}%` }}
                    />
                  </div>
                  <div className={`text-4xl font-black bg-gradient-to-b bg-clip-text text-transparent leading-none mb-2 ${
                    (todayHabits || 0) === 0 && needsCheckIn
                      ? 'from-red-300 to-red-500'
                      : (todayHabits || 0) >= 5
                      ? 'from-emerald-200 to-emerald-400'
                      : (todayHabits || 0) >= 3
                      ? 'from-blue-200 to-blue-400'
                      : 'from-white to-zinc-400'
                  }`}>{todayHabits || 0}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">{t('habits')}</div>
                </div>
                {needsCheckIn && (
                  <div className="relative flex items-center gap-1">
                    <div className="absolute inset-0 bg-red-500/50 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.8)]" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* NAVIGATION ZONE - Dynamic Grid Layout */}
      <div className="space-y-3 mb-6">
        {/* 4 apps: 2x2 grid */}
        {filteredApps.length === 4 && (
          <div className="grid grid-cols-2 gap-3">
            {filteredApps.map(app => {
              const AppIcon = app.icon;
              return (
                <Link key={app.id} to={createPageUrl(app.id)} className="group relative animate-in fade-in zoom-in-95 duration-200">
                  <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-50 group-active:opacity-30 transition-all duration-200`} />
                  <div className="relative h-36 rounded-2xl bg-gradient-to-br from-zinc-900/80 via-zinc-850/80 to-zinc-900/80 backdrop-blur-lg border border-zinc-700/40 p-4 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)] group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(99,102,241,0.15)] group-hover:border-zinc-600/50 group-active:scale-[0.98] transition-all duration-150">
                    <div className={`absolute inset-0 bg-gradient-to-br ${app.glow} opacity-0 group-hover:opacity-30 transition-opacity duration-300`} />
                    <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${app.glow} rounded-full blur-2xl opacity-40 group-hover:opacity-70 group-hover:scale-110 transition-all duration-500`} />
                    {(app.id === 'Pareto' || app.id === 'Habits' || app.id === 'Calendar') && (
                      <button
                        onClick={(e) => handleQuickAddClick(e, app.id)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/60 active:scale-95 transition-all duration-150 shadow-[0_2px_8px_rgba(0,0,0,0.3)] z-10"
                      >
                        <Plus className="w-3.5 h-3.5 text-zinc-400" />
                      </button>
                    )}
                    <div className="relative h-full flex flex-col justify-between">
                      <div className="w-12 h-12 group-active:scale-[0.96] transition-transform duration-100">
                        {app.customIcon || <AppIcon className="w-6 h-6 text-white drop-shadow-lg" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{app.name}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* 3 apps: 1 rectangle + 2 squares (1-2-1-1 pattern) */}
        {filteredApps.length === 3 && (
          <div className="space-y-3">
            {/* First app takes full width */}
            {(() => {
              const app = filteredApps[0];
              const AppIcon = app.icon;
              return (
                <Link key={app.id} to={createPageUrl(app.id)} className="block group relative animate-in fade-in zoom-in-95 duration-200">
                  <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-all duration-200`} />
                  <div className="relative h-36 rounded-2xl bg-gradient-to-br from-zinc-900/80 via-zinc-850/80 to-zinc-900/80 backdrop-blur-lg border border-zinc-700/40 p-4 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(99,102,241,0.15)] group-active:scale-[0.98] transition-all duration-150">
                  <div className={`absolute inset-0 bg-gradient-to-br ${app.glow} opacity-0 group-hover:opacity-30 transition-opacity duration-300`} />
                  {(app.id === 'Pareto' || app.id === 'Habits' || app.id === 'Calendar') && (
                    <button onClick={(e) => handleQuickAddClick(e, app.id)} className="absolute top-2 right-2 p-1 rounded-lg bg-zinc-800/40 hover:bg-zinc-700/60 active:scale-95 transition-all z-10">
                      <Plus className="w-3.5 h-3.5 text-zinc-500" />
                    </button>
                  )}
                  <div className="relative h-full flex flex-col justify-between">
                    <div className="w-12 h-12 group-hover:translate-y-[-2px] transition-transform duration-200" 
                         style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))' }}>
                      {app.customIcon || <AppIcon className="w-6 h-6 text-white drop-shadow-md" />}
                    </div>
                    <div className="text-sm font-bold text-white">{app.name}</div>
                  </div>
                  </div>
                </Link>
              );
            })()}
            {/* Last 2 apps in grid */}
            <div className="grid grid-cols-2 gap-3">
              {filteredApps.slice(1).map(app => {
                const AppIcon = app.icon;
                return (
                  <Link key={app.id} to={createPageUrl(app.id)} className="group relative animate-in fade-in zoom-in-95 duration-200">
                    <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-all duration-200`} />
                    <div className="relative h-36 rounded-2xl bg-gradient-to-br from-zinc-900/80 via-zinc-850/80 to-zinc-900/80 backdrop-blur-lg border border-zinc-700/40 p-4 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] group-active:scale-[0.98] transition-all duration-150">
                      {(app.id === 'Pareto' || app.id === 'Habits' || app.id === 'Calendar') && (
                        <button onClick={(e) => handleQuickAddClick(e, app.id)} className="absolute top-2 right-2 p-1 rounded-lg bg-zinc-800/40 hover:bg-zinc-700/60 z-10">
                          <Plus className="w-3.5 h-3.5 text-zinc-500" />
                        </button>
                      )}
                      <div className="relative h-full flex flex-col justify-between">
                        <div className="w-12 h-12 group-hover:translate-y-[-2px] transition-transform duration-200" 
                             style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))' }}>
                          {app.customIcon || <AppIcon className="w-6 h-6 text-white drop-shadow-md" />}
                        </div>
                        <div className="text-sm font-bold text-white">{app.name}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* 2 apps: column layout (1-1-1-1 pattern) */}
        {filteredApps.length === 2 && (
          <div className="space-y-3">
            {filteredApps.map(app => {
              const AppIcon = app.icon;
              return (
                <Link key={app.id} to={createPageUrl(app.id)} className="block group relative animate-in fade-in duration-200">
                  <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-all duration-200`} />
                  <div className="relative h-36 rounded-2xl bg-gradient-to-br from-zinc-900/80 via-zinc-850/80 to-zinc-900/80 backdrop-blur-lg border border-zinc-700/40 p-4 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] group-active:scale-[0.98] transition-all duration-150">
                    {(app.id === 'Pareto' || app.id === 'Habits' || app.id === 'Calendar') && (
                      <button onClick={(e) => handleQuickAddClick(e, app.id)} className="absolute top-2 right-2 p-1 rounded-lg bg-zinc-800/40 hover:bg-zinc-700/60 z-10">
                        <Plus className="w-3.5 h-3.5 text-zinc-500" />
                      </button>
                    )}
                    <div className="relative h-full flex flex-col justify-between">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${app.colors} flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/15" />
                        <div className="relative z-10">
                          {app.customIcon || <AppIcon className="w-6 h-6 text-white drop-shadow-md" />}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-white">{app.name}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* 1 app: single column (1-1 pattern) */}
        {filteredApps.length === 1 && (() => {
          const app = filteredApps[0];
          const AppIcon = app.icon;
          return (
            <Link to={createPageUrl(app.id)} className="block group relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-all duration-200`} />
              <div className="relative h-36 rounded-2xl bg-gradient-to-br from-zinc-900/80 via-zinc-850/80 to-zinc-900/80 backdrop-blur-lg border border-zinc-700/40 p-4 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] group-active:scale-[0.98] transition-all duration-150">
                {(app.id === 'Pareto' || app.id === 'Habits' || app.id === 'Calendar') && (
                  <button onClick={(e) => handleQuickAddClick(e, app.id)} className="absolute top-2 right-2 p-1 rounded-lg bg-zinc-800/40 hover:bg-zinc-700/60 z-10">
                    <Plus className="w-3.5 h-3.5 text-zinc-500" />
                  </button>
                )}
                <div className="relative h-full flex flex-col justify-between">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${app.colors} flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/15" />
                    <div className="relative z-10">
                      {app.customIcon || <AppIcon className="w-6 h-6 text-white drop-shadow-md" />}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-white">{app.name}</div>
                </div>
              </div>
            </Link>
          );
        })()}
      </div>

      {/* CEO Mode - TERTIARY (Visually recessed) */}
      <Link to={createPageUrl('CEOMode')} className="block group relative">
        <div className={`absolute inset-0 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-all duration-300 ${
          isCEO ? 'bg-gradient-to-br from-yellow-600/20 to-amber-600/20' : 'bg-gradient-to-br from-zinc-700/3 to-zinc-800/3'
        }`} />
        <div className={`relative h-16 rounded-2xl backdrop-blur-md p-4 overflow-hidden group-active:scale-[0.995] transition-all duration-150 ${
          isCEO 
            ? 'bg-gradient-to-br from-yellow-950/30 via-amber-950/30 to-yellow-950/30 border border-yellow-900/30 shadow-[0_4px_16px_rgba(234,179,8,0.15),inset_0_1px_0_rgba(255,255,255,0.01)] group-hover:shadow-[0_6px_24px_rgba(234,179,8,0.25)] group-hover:border-yellow-800/40'
            : 'bg-gradient-to-br from-black/70 via-zinc-950/70 to-black/70 border border-zinc-850/40 shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.01)] group-hover:shadow-[0_6px_24px_rgba(0,0,0,0.6)] group-hover:border-zinc-800/50'
        }`}>
          <div className="relative flex items-center justify-between h-full">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.01)] border relative overflow-hidden ${
                isCEO 
                  ? 'bg-gradient-to-br from-yellow-900 via-yellow-900 to-amber-900 border-yellow-800/40'
                  : 'bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border-zinc-850/40'
              }`}>
                <Circle className={`w-3.5 h-3.5 relative z-10 ${isCEO ? 'text-yellow-600' : 'text-zinc-600'}`} />
              </div>
              <div>
                <div className={`text-sm font-bold ${isCEO ? 'text-yellow-400' : 'text-zinc-500'}`}>{t('ceoMode')}</div>
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-lg border shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] ${
              isCEO ? 'bg-yellow-950/30 border-yellow-900/40' : 'bg-zinc-900/40 border-zinc-850/40'
            }`}>
              <div className={`text-[9px] font-black uppercase tracking-wider ${isCEO ? 'text-yellow-600' : 'text-zinc-700'}`}>
                {t('maximumFocus')}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Slide-in Menu - Enhanced depth */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] animate-in fade-in duration-200"
            onClick={() => setShowMenu(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-gradient-to-b from-zinc-900/98 via-zinc-950/98 to-black/98 backdrop-blur-xl border-r border-zinc-700/40 shadow-[20px_0_80px_rgba(0,0,0,0.9)] z-[60] p-6 overflow-y-auto animate-in slide-in-from-left duration-300">
            <button
              onClick={() => setShowMenu(false)}
              className="absolute top-6 right-6 p-2 hover:bg-zinc-800/50 rounded-lg transition-all duration-150 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            {/* User Profile */}
            <div className="mb-8">
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-800 flex items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.05)] border-2 border-zinc-700/50 mb-4 mx-auto">
                <span className="text-3xl font-bold bg-gradient-to-br from-white to-zinc-300 bg-clip-text text-transparent">
                  {user?.full_name?.charAt(0) || '?'}
                </span>
              </div>
              <div className="text-xl font-bold text-center mb-1">{user?.full_name || 'User'}</div>
              <div className="text-sm text-zinc-500 text-center">{user?.email}</div>
            </div>

            {/* Quick Stats - Intelligent Visual State */}
            <div className="mb-6 grid grid-cols-3 gap-2">
              {/* Rank */}
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

              {/* Streak */}
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

              {/* Today's Habits */}
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
                className="group flex items-center gap-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-purple-500/30 hover:bg-zinc-900/70 active:scale-[0.98] transition-all duration-150 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-10 h-10 group-active:scale-[0.96] transition-transform duration-100 relative">
                  {/* Premium Container with Grain Texture */}
                  <div className="absolute inset-0 rounded-[11px] bg-gradient-to-br from-[#a855f7] to-[#7c3aed] shadow-[0_1.5px_3px_rgba(0,0,0,0.35),0_6px_18px_rgba(0,0,0,0.2)]" 
                       style={{
                         backgroundImage: `
                           linear-gradient(135deg, #a855f7 0%, #7c3aed 100%),
                           url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.12'/%3E%3C/svg%3E")
                         `,
                         backgroundBlendMode: 'overlay, normal'
                       }}>
                    {/* Top-left light */}
                    <div className="absolute inset-0 rounded-[11px] bg-gradient-to-br from-white/25 via-transparent to-transparent" />
                    {/* Bottom-right shadow */}
                    <div className="absolute inset-0 rounded-[11px] bg-gradient-to-tl from-black/20 via-transparent to-transparent" />
                  </div>

                  {/* Graphique de rapport futuriste */}
                  <div className="absolute inset-0 flex items-center justify-center"
                       style={{
                         transform: 'translateZ(4px)',
                         filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))'
                       }}>
                    <svg className="w-[54%] h-[54%]" viewBox="0 0 24 24" fill="none">
                      <g filter="url(#glow-report)">
                        {/* Cadre du rapport */}
                        <rect x="3" y="3" width="18" height="18" rx="2.5" 
                              stroke="rgba(255, 255, 255, 0.78)" strokeWidth="1.8"/>
                        {/* Graphiques internes avec glow */}
                        <rect x="6.5" y="13" width="2.5" height="7" rx="0.5"
                              fill="rgba(255, 255, 255, 0.8)"/>
                        <rect x="10.5" y="7" width="2.5" height="13" rx="0.5"
                              fill="rgba(255, 255, 255, 0.85)"/>
                        <rect x="14.5" y="10" width="2.5" height="10" rx="0.5"
                              fill="rgba(255, 255, 255, 0.78)"/>
                      </g>
                      <defs>
                        <filter id="glow-report" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{t('sixMonthReport')}</div>
                  <div className="text-xs text-zinc-500">{t('yourProgressOverview')}</div>
                </div>
              </Link>

              <div className="space-y-2">
                <div className="text-[10px] text-zinc-600 uppercase tracking-wider font-bold mb-3 px-1">{t('activeApps')}</div>
                {[
                  { id: 'Pareto', name: t('todo'), icon: ClipboardList, color: 'from-indigo-500 to-purple-600' },
                  { id: 'Habits', name: t('habits'), icon: CheckSquare, color: 'from-emerald-500 to-teal-600' },
                  { id: 'Calendar', name: t('schedule'), icon: Calendar, color: 'from-pink-500 to-rose-600' },
                  { id: 'ScreenTimeManager', name: t('screenTime'), icon: Shield, color: 'from-red-500 to-orange-600' }
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
                      className={`group w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 active:scale-[0.98] relative overflow-hidden ${
                        isActive
                          ? 'bg-zinc-900/60 border-zinc-700/50 hover:border-zinc-600/50'
                          : 'bg-zinc-950/30 border-zinc-800/30 opacity-40 hover:opacity-70'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.02] to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                      <div className={`w-8 h-8 ${!isActive && 'opacity-40'}`}>
                        {apps.find(a => a.id === app.id)?.customIcon || <Icon className="w-4 h-4 text-white" />}
                      </div>
                      <div className="text-left flex-1">
                        <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                          {app.name}
                        </div>
                      </div>
                      <div className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
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

              <Link
                to={createPageUrl('Settings')}
                onClick={() => setShowMenu(false)}
                className="group w-full flex items-center gap-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-blue-500/30 hover:bg-zinc-900/70 active:scale-[0.98] transition-all duration-150 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-10 h-10 group-active:scale-[0.96] transition-transform duration-100 relative">
                  {/* Premium Container with Grain Texture */}
                  <div className="absolute inset-0 rounded-[11px] bg-gradient-to-br from-[#3b82f6] to-[#2563eb] shadow-[0_1.5px_3px_rgba(0,0,0,0.35),0_6px_18px_rgba(0,0,0,0.2)]" 
                       style={{
                         backgroundImage: `
                           linear-gradient(135deg, #3b82f6 0%, #2563eb 100%),
                           url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulescence type='fractalNoise' baseFrequency='0.95' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.12'/%3E%3C/svg%3E")
                         `,
                         backgroundBlendMode: 'overlay, normal'
                       }}>
                    {/* Top-left light */}
                    <div className="absolute inset-0 rounded-[11px] bg-gradient-to-br from-white/25 via-transparent to-transparent" />
                    {/* Bottom-right shadow */}
                    <div className="absolute inset-0 rounded-[11px] bg-gradient-to-tl from-black/20 via-transparent to-transparent" />
                  </div>

                  {/* Engrenage paramètres futuriste */}
                  <div className="absolute inset-0 flex items-center justify-center"
                       style={{
                         transform: 'translateZ(4px)',
                         filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))'
                       }}>
                    <svg className="w-[56%] h-[56%]" viewBox="0 0 24 24" fill="none">
                      <g filter="url(#glow-settings)">
                        {/* Cercle central */}
                        <circle cx="12" cy="12" r="3.5" 
                                stroke="rgba(255, 255, 255, 0.82)" strokeWidth="2"/>
                        {/* Lignes radiales principales */}
                        <path d="M12 1v6m0 6v10M23 12h-6m-6 0H1" 
                              stroke="rgba(255, 255, 255, 0.75)" strokeWidth="1.8" 
                              strokeLinecap="round"/>
                        {/* Lignes diagonales */}
                        <path d="M4.5 4.5l4 4m7 7l4 4M19.5 4.5l-4 4m-7 7l-4 4" 
                              stroke="rgba(255, 255, 255, 0.65)" strokeWidth="1.6" 
                              strokeLinecap="round"/>
                      </g>
                      <defs>
                        <filter id="glow-settings" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold">{t('settingsAndLegal')}</div>
                  <div className="text-xs text-zinc-500">{t('termsAndConditions')}</div>
                </div>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800/50">
              <button
                onClick={() => base44.auth.logout()}
                className="w-full p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-950/40 hover:border-red-900/50 active:scale-[0.98] transition-all duration-150 font-medium"
              >
                {t('logout')}
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