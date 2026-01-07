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
      <div className="w-20 h-20 relative">
        {/* Base noire avec relief profond */}
        <div className="absolute inset-0 rounded-[20px]"
             style={{
               background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
               boxShadow: `
                 0 8px 32px rgba(0, 0, 0, 0.8),
                 inset 0 1px 0 rgba(255, 255, 255, 0.03),
                 inset 0 -2px 4px rgba(0, 0, 0, 0.6)
               `
             }}
        />
        {/* Accent bronze subtil - bord fin */}
        <div className="absolute inset-[3px] rounded-[17px] border border-amber-900/20" />
        {/* Point d'accent bronze */}
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-800/40 shadow-[0_0_6px_rgba(217,119,6,0.3)]" />
      </div>
    )
  },
  { 
    level: 2, 
    name: 'Silver', 
    description: '15 days + 10 day streak',
    iconComponent: () => (
      <div className="w-20 h-20 relative">
        {/* Base noire avec relief profond */}
        <div className="absolute inset-0 rounded-[20px]"
             style={{
               background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
               boxShadow: `
                 0 8px 32px rgba(0, 0, 0, 0.8),
                 inset 0 1px 0 rgba(255, 255, 255, 0.03),
                 inset 0 -2px 4px rgba(0, 0, 0, 0.6)
               `
             }}
        />
        {/* Accent argent - ligne diagonale */}
        <div className="absolute inset-[3px] rounded-[17px]">
          <div className="absolute top-0 right-0 w-12 h-[1px] bg-gradient-to-r from-transparent via-gray-500/30 to-transparent transform rotate-45 origin-top-right" 
               style={{ transformOrigin: 'top right' }} />
        </div>
        {/* Points d'accent argent */}
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-gray-400/30 shadow-[0_0_6px_rgba(156,163,175,0.25)]" />
        <div className="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-gray-400/20" />
      </div>
    )
  },
  { 
    level: 3, 
    name: 'Gold', 
    description: '50 day streak',
    iconComponent: () => (
      <div className="w-20 h-20 relative">
        {/* Base noire avec relief profond */}
        <div className="absolute inset-0 rounded-[20px]"
             style={{
               background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
               boxShadow: `
                 0 8px 32px rgba(0, 0, 0, 0.8),
                 inset 0 1px 0 rgba(255, 255, 255, 0.03),
                 inset 0 -2px 4px rgba(0, 0, 0, 0.6)
               `
             }}
        />
        {/* Accent or - bordure partielle */}
        <div className="absolute inset-[3px] rounded-[17px] border-t border-r border-yellow-700/25" />
        {/* Points d'accent or */}
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-600/35 shadow-[0_0_8px_rgba(234,179,8,0.3)]" />
        <div className="absolute top-3.5 right-3.5 w-1 h-1 rounded-full bg-yellow-500/25" />
      </div>
    )
  },
  { 
    level: 4, 
    name: 'Platinum', 
    description: '90 day streak + 60h Focus',
    iconComponent: () => (
      <div className="w-20 h-20 relative">
        {/* Base noire avec relief profond */}
        <div className="absolute inset-0 rounded-[20px]"
             style={{
               background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
               boxShadow: `
                 0 8px 32px rgba(0, 0, 0, 0.8),
                 inset 0 1px 0 rgba(255, 255, 255, 0.03),
                 inset 0 -2px 4px rgba(0, 0, 0, 0.6)
               `
             }}
        />
        {/* Accent platine - croix subtile */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[1px] h-8 bg-gradient-to-b from-transparent via-slate-400/20 to-transparent" />
          <div className="absolute w-8 h-[1px] bg-gradient-to-r from-transparent via-slate-400/20 to-transparent" />
        </div>
        {/* Points d'accent platine */}
        <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-slate-300/25 shadow-[0_0_6px_rgba(148,163,184,0.2)]" />
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-slate-300/25 shadow-[0_0_6px_rgba(148,163,184,0.2)]" />
      </div>
    )
  },
  { 
    level: 5, 
    name: 'Diamond', 
    description: '180 day streak + 200h Focus',
    iconComponent: () => (
      <div className="w-20 h-20 relative">
        {/* Base noire avec relief profond */}
        <div className="absolute inset-0 rounded-[20px]"
             style={{
               background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
               boxShadow: `
                 0 8px 32px rgba(0, 0, 0, 0.8),
                 inset 0 1px 0 rgba(255, 255, 255, 0.03),
                 inset 0 -2px 4px rgba(0, 0, 0, 0.6)
               `
             }}
        />
        {/* Accent diamant - forme géométrique cristalline */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
            <path d="M20 4 L28 14 L24 32 L16 32 L12 14 Z" 
                  fill="none"
                  stroke="rgba(96,165,250,0.25)" 
                  strokeWidth="1.2" />
            <line x1="12" y1="14" x2="20" y2="20" stroke="rgba(147,197,253,0.15)" strokeWidth="0.8" />
            <line x1="28" y1="14" x2="20" y2="20" stroke="rgba(147,197,253,0.15)" strokeWidth="0.8" />
          </svg>
        </div>
        {/* Points lumineux diamant */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400/30 shadow-[0_0_8px_rgba(96,165,250,0.4)]" />
      </div>
    )
  },
  { 
    level: 6, 
    name: 'Batman', 
    description: '365 day streak + 200h Focus + 100h CEO',
    iconComponent: () => (
      <div className="w-20 h-20 relative">
        {/* Réplication exacte de l'image Batman - fond gris foncé arrondi */}
        <div className="absolute inset-0 rounded-[20px]"
             style={{
               background: 'linear-gradient(135deg, #52525b 0%, #3f3f46 50%, #27272a 100%)',
               boxShadow: `
                 0 10px 40px rgba(0, 0, 0, 0.9),
                 inset 0 2px 2px rgba(255, 255, 255, 0.05),
                 inset 0 -4px 8px rgba(0, 0, 0, 0.6)
               `
             }}
        />
        
        {/* Carré intérieur noir profond - réplication exacte */}
        <div className="absolute inset-[12px] rounded-[14px]"
             style={{
               background: 'linear-gradient(135deg, #27272a 0%, #18181b 50%, #09090b 100%)',
               boxShadow: `
                 inset 0 3px 8px rgba(0, 0, 0, 0.9),
                 inset 0 1px 0 rgba(255, 255, 255, 0.02),
                 0 1px 0 rgba(255, 255, 255, 0.03)
               `
             }}
        />
        
        {/* Coins coupés caractéristiques - haut gauche et bas droite */}
        <div className="absolute top-[12px] left-[12px] w-3 h-3 rounded-tl-[14px]"
             style={{
               background: 'linear-gradient(135deg, #52525b 0%, #3f3f46 100%)',
               clipPath: 'polygon(0 0, 100% 0, 0 100%)'
             }}
        />
        <div className="absolute bottom-[12px] right-[12px] w-3 h-3 rounded-br-[14px]"
             style={{
               background: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)',
               clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'
             }}
        />
        
        {/* Lignes de contour subtiles argentées */}
        <div className="absolute top-[11px] left-[15px] right-[15px] h-[1px] bg-gradient-to-r from-transparent via-zinc-400/15 to-transparent" />
        <div className="absolute bottom-[11px] left-[15px] right-[15px] h-[1px] bg-gradient-to-r from-transparent via-zinc-400/10 to-transparent" />
      </div>
    )
  },
  { 
    level: 7, 
    name: 'CEO', 
    description: '500 day streak + 250h Focus + 250h CEO',
    iconComponent: () => (
      <div className="w-20 h-20 relative">
        {/* Fond noir mat */}
        <div className="absolute inset-0 rounded-[20px]"
             style={{
               background: '#1a1a1a',
               boxShadow: `
                 0 10px 40px rgba(0, 0, 0, 0.9),
                 inset 0 1px 0 rgba(255, 255, 255, 0.02)
               `
             }}
        />
        
        {/* Cercle extérieur doré - texture métallique brossée */}
        <div className="absolute inset-[6px] rounded-full"
             style={{
               background: 'linear-gradient(135deg, #f5d97f 0%, #d4a843 25%, #c89b3c 50%, #b88a2f 75%, #9a7728 100%)',
               boxShadow: `
                 0 4px 16px rgba(234, 179, 8, 0.4),
                 inset 0 2px 2px rgba(255, 255, 255, 0.15),
                 inset 0 -2px 4px rgba(0, 0, 0, 0.4)
               `,
             }}
        />
        
        {/* Espace noir entre les cercles */}
        <div className="absolute inset-[10px] rounded-full bg-black shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]" />
        
        {/* Cercle intérieur doré - partie supérieure */}
        <div className="absolute inset-[14px] rounded-full overflow-hidden">
          {/* Partie dorée supérieure avec texture */}
          <div className="absolute inset-0"
               style={{
                 background: 'linear-gradient(180deg, #f5d97f 0%, #d4a843 30%, #c89b3c 60%, #b88a2f 100%)',
                 clipPath: 'ellipse(100% 60% at 50% 0%)'
               }}
          />
          
          {/* Partie argentée inférieure avec texture */}
          <div className="absolute inset-0"
               style={{
                 background: 'linear-gradient(0deg, #71717a 0%, #a1a1aa 30%, #d4d4d8 50%, #a1a1aa 70%, #71717a 100%)',
                 clipPath: 'ellipse(100% 50% at 50% 100%)'
               }}
          />
          
          {/* Ombre intérieure pour le relief */}
          <div className="absolute inset-0 rounded-full"
               style={{
                 boxShadow: 'inset 0 3px 6px rgba(0, 0, 0, 0.5), inset 0 -1px 2px rgba(255, 255, 255, 0.1)'
               }}
          />
        </div>
        
        {/* Centre noir profond */}
        <div className="absolute inset-[22px] rounded-full"
             style={{
               background: 'radial-gradient(circle, #0a0a0a 0%, #000000 100%)',
               boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.95)'
             }}
        />
        
        {/* Reflets lumineux sur l'or */}
        <div className="absolute top-[14px] left-[18px] w-6 h-1 rounded-full bg-gradient-to-r from-transparent via-yellow-200/20 to-transparent blur-[0.5px]" />
        <div className="absolute bottom-[18px] right-[20px] w-4 h-0.5 rounded-full bg-gradient-to-r from-transparent via-gray-300/15 to-transparent blur-[0.5px]" />
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
          <div className="flex justify-center mb-6">
            {currentTier?.iconComponent ? currentTier.iconComponent() : RANK_TIERS[0].iconComponent()}
          </div>
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
                  <div className="scale-50 origin-left">
                    {tier.iconComponent && tier.iconComponent()}
                  </div>
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