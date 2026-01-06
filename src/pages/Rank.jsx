import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { differenceInDays } from 'date-fns';
import { ArrowLeft, Crown, TrendingUp, Zap, Home } from 'lucide-react';
import { useLanguage } from '../components/LanguageProvider.jsx';

const RANK_TIERS = [
  { 
    level: 1, 
    name: 'Bronze', 
    description: 'Starting rank',
    iconComponent: () => (
      <div className="w-20 h-20 rounded-full relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-700 via-orange-600 to-amber-800 shadow-[0_8px_32px_rgba(217,119,6,0.5),inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-2px_8px_rgba(0,0,0,0.4)]" />
        <div className="absolute inset-2 rounded-full border-2 border-amber-500/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-black text-amber-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">3</span>
        </div>
      </div>
    )
  },
  { 
    level: 2, 
    name: 'Silver', 
    description: '15 days + 10 day streak',
    iconComponent: () => (
      <div className="w-20 h-20 rounded-full relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-400 via-gray-500 to-gray-400 shadow-[0_8px_32px_rgba(156,163,175,0.5),inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_8px_rgba(0,0,0,0.4)]" />
        <div className="absolute inset-2 rounded-full border-2 border-gray-300/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-black text-gray-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">2</span>
        </div>
      </div>
    )
  },
  { 
    level: 3, 
    name: 'Gold', 
    description: '50 day streak',
    iconComponent: () => (
      <div className="w-20 h-20 rounded-full relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-400 shadow-[0_8px_32px_rgba(234,179,8,0.6),inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_8px_rgba(0,0,0,0.4)]" />
        <div className="absolute inset-2 rounded-full border-2 border-yellow-300/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-black text-yellow-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">1</span>
        </div>
      </div>
    )
  },
  { 
    level: 4, 
    name: 'Platinum', 
    description: '90 day streak + 60h Focus',
    iconComponent: () => (
      <div className="w-20 h-20 rounded-full relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-300 via-slate-400 to-cyan-300 shadow-[0_8px_32px_rgba(103,232,249,0.5),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_8px_rgba(0,0,0,0.3)]" />
        <div className="absolute inset-2 rounded-full border-2 border-cyan-200/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                  fill="url(#platGrad)" stroke="rgba(103,232,249,0.8)" strokeWidth="1.5" />
            <defs>
              <linearGradient id="platGrad" x1="12" y1="2" x2="12" y2="21">
                <stop offset="0%" stopColor="rgba(165,243,252,1)" />
                <stop offset="100%" stopColor="rgba(103,232,249,0.6)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    )
  },
  { 
    level: 5, 
    name: 'Diamond', 
    description: '180 day streak + 200h Focus',
    iconComponent: () => (
      <div className="w-20 h-20 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id="diamondGrad" x1="50" y1="10" x2="50" y2="90">
                <stop offset="0%" stopColor="rgba(147,197,253,1)" />
                <stop offset="50%" stopColor="rgba(96,165,250,1)" />
                <stop offset="100%" stopColor="rgba(59,130,246,0.8)" />
              </linearGradient>
              <filter id="diamondGlow">
                <feGaussianBlur stdDeviation="2" />
              </filter>
            </defs>
            <path d="M50 10 L70 35 L60 80 L40 80 L30 35 Z" 
                  fill="url(#diamondGrad)" 
                  stroke="rgba(147,197,253,0.9)" 
                  strokeWidth="2"
                  filter="drop-shadow(0 4px 16px rgba(59,130,246,0.5))" />
            <path d="M30 35 L50 50 L70 35" stroke="rgba(191,219,254,0.6)" strokeWidth="1.5" />
            <path d="M50 50 L40 80" stroke="rgba(191,219,254,0.4)" strokeWidth="1.5" />
            <path d="M50 50 L60 80" stroke="rgba(191,219,254,0.4)" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    )
  },
  { 
    level: 6, 
    name: 'Batman', 
    description: '365 day streak + 200h Focus + 100h CEO',
    iconComponent: () => (
      <div className="w-20 h-20 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id="batGrad" x1="50" y1="20" x2="50" y2="80">
                <stop offset="0%" stopColor="rgba(24,24,27,1)" />
                <stop offset="100%" stopColor="rgba(0,0,0,1)" />
              </linearGradient>
            </defs>
            <path d="M50 35 Q30 25, 20 30 Q15 35, 18 45 Q20 50, 30 48 Q40 46, 50 55 Q60 46, 70 48 Q80 50, 82 45 Q85 35, 80 30 Q70 25, 50 35 Z" 
                  fill="url(#batGrad)" 
                  stroke="rgba(113,113,122,0.8)" 
                  strokeWidth="1.5"
                  filter="drop-shadow(0 4px 16px rgba(0,0,0,0.8))" />
            <circle cx="40" cy="42" r="3" fill="rgba(239,68,68,0.9)" />
            <circle cx="60" cy="42" r="3" fill="rgba(239,68,68,0.9)" />
            <path d="M25 55 Q30 65, 50 70 Q70 65, 75 55" 
                  stroke="rgba(24,24,27,1)" 
                  strokeWidth="8" 
                  strokeLinecap="round"
                  fill="none" />
          </svg>
        </div>
      </div>
    )
  },
  { 
    level: 7, 
    name: 'CEO', 
    description: '500 day streak + 250h Focus + 250h CEO',
    iconComponent: () => (
      <div className="w-20 h-20 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id="crownGrad" x1="50" y1="25" x2="50" y2="75">
                <stop offset="0%" stopColor="rgba(250,204,21,1)" />
                <stop offset="50%" stopColor="rgba(234,179,8,1)" />
                <stop offset="100%" stopColor="rgba(202,138,4,1)" />
              </linearGradient>
              <filter id="crownGlow">
                <feGaussianBlur stdDeviation="3" />
                <feColorMatrix type="saturate" values="2"/>
              </filter>
            </defs>
            <path d="M25 70 L25 50 L35 55 L50 35 L65 55 L75 50 L75 70 Z" 
                  fill="url(#crownGrad)" 
                  stroke="rgba(250,204,21,0.9)" 
                  strokeWidth="2"
                  filter="drop-shadow(0 4px 20px rgba(234,179,8,0.7))" />
            <circle cx="25" cy="50" r="4" fill="rgba(239,68,68,0.9)" />
            <circle cx="50" cy="35" r="4" fill="rgba(239,68,68,0.9)" />
            <circle cx="75" cy="50" r="4" fill="rgba(239,68,68,0.9)" />
            <rect x="30" y="60" width="40" height="8" rx="1" fill="rgba(202,138,4,1)" />
          </svg>
        </div>
      </div>
    )
  }
];

async function calculateUserRank() {
  const user = await base44.auth.me();
  const daysInApp = differenceInDays(new Date(), new Date(user.created_date));
  
  const streaks = await base44.entities.WinStreak.filter({ created_by: user.email });
  const streak = streaks[0];
  const currentStreak = streak?.current_streak || 0;
  
  const focusSessions = await base44.entities.FocusSession.filter({ 
    created_by: user.email,
    completed: true
  });
  const totalFocusHours = focusSessions.reduce((sum, s) => sum + (s.duration_minutes / 60), 0);
  
  const ceoSessions = await base44.entities.CEOModeSession.filter({ 
    created_by: user.email
  });
  const completedCEO = ceoSessions.filter(s => s.end_time && !s.early_exit);
  const totalCEOHours = completedCEO.reduce((sum, s) => sum + (s.duration_minutes / 60), 0);
  
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
  
  return { 
    rankLevel, 
    rankName, 
    currentStreak, 
    totalFocusHours: Math.round(totalFocusHours), 
    totalCEOHours: Math.round(totalCEOHours), 
    daysInApp 
  };
}

function getNextRankRequirements(currentRankLevel, currentStats) {
  const { currentStreak, totalFocusHours, totalCEOHours, daysInApp } = currentStats;
  
  const requirements = {
    1: {
      name: 'Silver',
      needs: [
        daysInApp < 15 ? `${15 - daysInApp} more days in app` : null,
        currentStreak < 10 ? `${10 - currentStreak} day win streak` : null
      ].filter(Boolean)
    },
    2: {
      name: 'Gold',
      needs: [
        currentStreak < 50 ? `${50 - currentStreak} day win streak` : null
      ].filter(Boolean)
    },
    3: {
      name: 'Platinum',
      needs: [
        currentStreak < 90 ? `${90 - currentStreak} day win streak` : null,
        totalFocusHours < 60 ? `${Math.round(60 - totalFocusHours)} more Focus hours` : null
      ].filter(Boolean)
    },
    4: {
      name: 'Diamond',
      needs: [
        currentStreak < 180 ? `${180 - currentStreak} day win streak` : null,
        totalFocusHours < 200 ? `${Math.round(200 - totalFocusHours)} more Focus hours` : null
      ].filter(Boolean)
    },
    5: {
      name: 'Batman',
      needs: [
        currentStreak < 365 ? `${365 - currentStreak} day win streak` : null,
        totalCEOHours < 100 ? `${Math.round(100 - totalCEOHours)} more CEO Mode hours` : null
      ].filter(Boolean)
    },
    6: {
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

export default function Rank() {
  const { t } = useLanguage();
  const { data: rankData, refetch } = useQuery({
    queryKey: ['userRank'],
    queryFn: calculateUserRank
  });

  useEffect(() => {
    refetch();
  }, []);

  const currentTier = RANK_TIERS.find(t => t.level === (rankData?.rankLevel || 1)) || RANK_TIERS[0];
  const nextTier = RANK_TIERS.find(t => t.level === (rankData?.rankLevel || 1) + 1);
  
  const nextRequirements = rankData ? getNextRankRequirements(rankData.rankLevel, {
    currentStreak: rankData.currentStreak,
    totalFocusHours: rankData.totalFocusHours,
    totalCEOHours: rankData.totalCEOHours,
    daysInApp: rankData.daysInApp
  }) : null;

  // Define rank background styles
  const getRankBackground = () => {
    const rankLevel = rankData?.rankLevel || 1;
    
    const backgrounds = {
      1: { // Bronze
        branches: 'from-amber-700/20 via-orange-600/20 to-amber-800/20',
        glow: 'from-amber-600/10 to-orange-600/10'
      },
      2: { // Silver
        branches: 'from-gray-400/20 via-gray-500/20 to-gray-400/20',
        glow: 'from-gray-400/10 to-gray-500/10'
      },
      3: { // Gold
        branches: 'from-yellow-500/20 via-yellow-600/20 to-yellow-400/20',
        glow: 'from-yellow-500/10 to-yellow-600/10'
      },
      4: { // Platinum
        branches: 'from-cyan-300/20 via-slate-400/20 to-cyan-300/20',
        glow: 'from-cyan-300/10 to-slate-400/10'
      },
      5: { // Diamond
        branches: 'from-blue-300/20 via-cyan-400/20 to-blue-300/20',
        glow: 'from-blue-300/10 to-cyan-400/10'
      },
      6: { // Batman
        branches: 'from-zinc-900/30 via-black/30 to-zinc-900/30',
        glow: 'from-zinc-900/10 to-black/10'
      },
      7: { // CEO - No branches, gold border
        branches: 'from-yellow-500/30 via-yellow-600/30 to-yellow-500/30',
        glow: 'from-yellow-500/20 to-yellow-600/20',
        ceoMode: true
      }
    };
    
    return backgrounds[rankLevel] || backgrounds[1];
  };

  const bgStyle = getRankBackground();

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-20 relative overflow-hidden">
      <div className="max-w-md mx-auto mb-8">
        <div className="flex items-center justify-between">
          <Link to={createPageUrl('ScreenTimeManager')} className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Screen Time</span>
          </Link>
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-300 transition-colors">
            <Crown className="w-4 h-4" />
            <span className="text-sm font-medium">Home</span>
          </Link>
        </div>
      </div>

      {/* Rank Background Branches */}
      {!bgStyle.ceoMode ? (
        <>
          {/* Top Right Branch */}
          <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl ${bgStyle.branches} rounded-full blur-3xl opacity-30`} />
          {/* Bottom Left Branch */}
          <div className={`absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr ${bgStyle.branches} rounded-full blur-3xl opacity-30`} />
        </>
      ) : (
        /* CEO Mode - Gold surrounding */
        <>
          <div className={`absolute inset-0 bg-gradient-to-br ${bgStyle.glow} opacity-20`} />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
          <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-transparent via-yellow-500/50 to-transparent" />
          <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-transparent via-yellow-500/50 to-transparent" />
        </>
      )}

      <div className="max-w-md mx-auto relative z-10">

        <div className="text-center mb-12">
          <div className="text-7xl mb-4">{currentTier?.icon || '🥉'}</div>
          <h1 className="text-4xl font-bold">{rankData?.rankName || 'Bronze'}</h1>
        </div>

        {nextRequirements && nextRequirements.needs && nextRequirements.needs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold">Path to {nextRequirements.name}</h2>
            </div>
            <div className="space-y-2">
              {nextRequirements.needs.map((need, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-gray-900 border border-gray-800 flex items-center gap-3">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-300">{need}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">YOUR STATS</h2>
          <div className="space-y-3">
            <div className="flex justify-between p-4 rounded-lg bg-gray-900">
              <span className="text-sm text-gray-400">Days in App</span>
              <span className="text-sm font-semibold">{rankData?.daysInApp || 0}</span>
            </div>
            <div className="flex justify-between p-4 rounded-lg bg-gray-900">
              <span className="text-sm text-gray-400">Win Streak</span>
              <span className="text-sm font-semibold text-orange-400">
                {rankData?.currentStreak || 0} days
              </span>
            </div>
            <div className="flex justify-between p-4 rounded-lg bg-gray-900">
              <span className="text-sm text-gray-400">Focus Mode</span>
              <span className="text-sm font-semibold">{rankData?.totalFocusHours || 0}h</span>
            </div>
            <div className="flex justify-between p-4 rounded-lg bg-gray-900">
              <span className="text-sm text-gray-400">CEO Mode</span>
              <span className="text-sm font-semibold">{rankData?.totalCEOHours || 0}h</span>
            </div>
          </div>
        </div>



        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">RANK LADDER</h2>
        </div>

        <div className="space-y-2">
          {[...RANK_TIERS].reverse().map(tier => (
            <div
              key={tier.level}
              className={`p-4 rounded-lg border transition-all ${
                tier.level === (rankData?.rankLevel || 1)
                  ? 'bg-gradient-to-r from-yellow-950 to-gray-900 border-yellow-900'
                  : tier.level < (rankData?.rankLevel || 1)
                  ? 'bg-gray-900 border-gray-800 opacity-50'
                  : 'bg-gray-900 border-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tier.icon}</span>
                  <div>
                    <div className="font-semibold">{tier.name}</div>
                    <div className="text-xs text-gray-500">{tier.description}</div>
                  </div>
                </div>
                {tier.level === (rankData?.rankLevel || 1) && (
                  <Crown className="w-5 h-5 text-yellow-500" />
                )}
                {tier.level < (rankData?.rankLevel || 1) && (
                  <span className="text-green-500 text-sm">✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}