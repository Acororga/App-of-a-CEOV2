import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { getTodayScreenTime, getAverageScreenTime, getOrCreateWinStreak } from '../functions/businessLogic';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Target, Flame, Trophy, Crown, Ban, Zap } from 'lucide-react';

export default function ScreenTimeManager() {
  const { data: todayScreenTime } = useQuery({
    queryKey: ['todayScreenTime'],
    queryFn: getTodayScreenTime
  });

  const { data: avgScreenTime } = useQuery({
    queryKey: ['avgScreenTime'],
    queryFn: () => getAverageScreenTime(7)
  });

  const { data: streak } = useQuery({
    queryKey: ['winStreak'],
    queryFn: getOrCreateWinStreak
  });

  const { data: rankData } = useQuery({
    queryKey: ['userRank'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const ranks = await base44.entities.UserRank.filter({ created_by: user.email });
      return ranks[0];
    }
  });

  const { data: blockedApps } = useQuery({
    queryKey: ['blockedApps'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.BlockedApp.filter({ created_by: user.email });
    }
  });

  const { data: blockedSites } = useQuery({
    queryKey: ['blockedWebsites'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.BlockedWebsite.filter({ created_by: user.email });
    }
  });

  const isGoodUsage = (todayScreenTime || 0) <= 120;
  const isModerateUsage = (todayScreenTime || 0) > 120 && (todayScreenTime || 0) <= 240;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6 pt-20 relative overflow-hidden">
      {/* Noise texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px'
      }} />

      <div className="max-w-2xl mx-auto relative">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-300 mb-6 transition-colors duration-150 active:scale-95">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Home</span>
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent tracking-tight">
            Control Interface
          </h1>
          <div className="text-xs text-zinc-700 font-semibold uppercase tracking-widest">Screen Time & Focus</div>
        </div>

        {/* FOCUS MODE - PRIMARY ACTION */}
        <div className="mb-12 relative animate-in fade-in zoom-in-95 duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/40 to-red-500/40 rounded-[32px] blur-3xl opacity-80" />
          <Link
            to={createPageUrl('FocusMode')}
            className="relative block group"
          >
            <div className="p-10 rounded-[32px] bg-gradient-to-br from-orange-950/95 via-red-950/95 to-orange-950/95 backdrop-blur-xl border-2 border-orange-500/60 shadow-[0_24px_96px_rgba(249,115,22,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] hover:shadow-[0_28px_112px_rgba(249,115,22,0.7)] active:scale-[0.98] transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-orange-400/60 font-black mb-3 uppercase tracking-widest">Start Session</div>
                  <div className="text-3xl font-black mb-2 text-orange-100 tracking-tight">Focus Mode</div>
                  <div className="text-xs text-orange-400/60 font-medium">Deep work environment</div>
                </div>
                <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_16px_48px_rgba(249,115,22,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/30" />
                  <Zap className="w-10 h-10 text-white relative z-10 drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* STATS CLUSTER - Grouped visual unit */}
        <div className="mb-10 relative animate-in fade-in zoom-in-95 duration-300 delay-75">
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-700/10 to-zinc-600/10 rounded-[28px] blur-2xl" />
          <div className="relative p-6 rounded-[28px] bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/50 shadow-[0_16px_64px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.02)]">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Today's Usage - Adaptive */}
              <div className="relative">
                <div className={`absolute inset-0 rounded-2xl blur-xl transition-all ${
                  isGoodUsage ? 'bg-emerald-500/20 opacity-70' :
                  isModerateUsage ? 'bg-yellow-500/20 opacity-60' :
                  'bg-red-500/25 opacity-65'
                }`} />
                <div className={`relative p-5 rounded-2xl border-2 transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] ${
                  isGoodUsage ? 'bg-emerald-950/50 border-emerald-700/50' :
                  isModerateUsage ? 'bg-yellow-950/50 border-yellow-700/50' :
                  'bg-red-950/50 border-red-700/50'
                }`}>
                  <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-2">Today</div>
                  <div className={`text-4xl font-black mb-1 ${
                    isGoodUsage ? 'text-emerald-300' :
                    isModerateUsage ? 'text-yellow-300' :
                    'text-red-300'
                  }`}>
                    {Math.round(todayScreenTime || 0)}
                  </div>
                  <div className="text-[10px] text-zinc-700 font-medium">minutes</div>
                </div>
              </div>

              {/* 7-Day Average */}
              <div className="relative">
                <div className="absolute inset-0 bg-zinc-600/15 rounded-2xl blur-xl opacity-50" />
                <div className="relative p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]">
                  <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-2">7-Day Avg</div>
                  <div className="text-4xl font-black text-zinc-400 mb-1">
                    {Math.round(avgScreenTime || 0)}
                  </div>
                  <div className="text-[10px] text-zinc-700 font-medium">minutes</div>
                </div>
              </div>
            </div>

            {/* Rank & Streak - Inline */}
            <div className="grid grid-cols-2 gap-4">
              <Link to={createPageUrl('Rank')} className="group relative active:scale-[0.97] transition-all duration-150">
                <div className="absolute inset-0 bg-yellow-500/10 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 group-hover:border-zinc-700/60 transition-all">
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5 text-yellow-500/80" />
                    <div>
                      <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Rank</div>
                      <div className="text-sm font-bold text-yellow-400">{rankData?.rank_name || 'Panda'}</div>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to={createPageUrl('WinStreak')} className="group relative active:scale-[0.97] transition-all duration-150">
                <div className="absolute inset-0 bg-orange-500/10 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 group-hover:border-zinc-700/60 transition-all">
                  <div className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-orange-500/80" />
                    <div>
                      <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Streak</div>
                      <div className="text-sm font-bold text-orange-400">{streak?.current_streak || 0} days</div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* SECONDARY ACTIONS - Recessed */}
        <div className="space-y-3 mb-10">
          <Link
            to={createPageUrl('ScreenTime')}
            className="group relative block"
          >
            <div className="absolute inset-0 bg-red-500/10 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-200" />
            <div className="relative flex items-center justify-between p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 group-hover:border-zinc-700/60 group-hover:bg-zinc-900/70 active:scale-[0.98] transition-all duration-150">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/10" />
                  <Ban className="w-6 h-6 text-white relative z-10" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white mb-0.5">Block Apps</div>
                  <div className="text-xs text-zinc-600 font-medium">{(blockedApps?.length || 0) + (blockedSites?.length || 0)} blocked</div>
                </div>
              </div>
              <div className="text-xs text-zinc-700">→</div>
            </div>
          </Link>

          <Link to={createPageUrl('Leaderboard')} className="group relative block">
            <div className="absolute inset-0 bg-cyan-500/10 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-200" />
            <div className="relative flex items-center justify-between p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 group-hover:border-zinc-700/60 group-hover:bg-zinc-900/70 active:scale-[0.98] transition-all duration-150">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/10" />
                  <Trophy className="w-6 h-6 text-white relative z-10" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white mb-0.5">Leaderboard</div>
                  <div className="text-xs text-zinc-600 font-medium">Global rankings</div>
                </div>
              </div>
              <div className="text-xs text-zinc-700">→</div>
            </div>
          </Link>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
          <div className="text-[10px] text-zinc-700 leading-relaxed font-medium">
            <span className="font-black text-zinc-600">Note:</span> Full blocking requires OS permissions. Use as tracking tool.
          </div>
        </div>
      </div>
    </div>
  );
}