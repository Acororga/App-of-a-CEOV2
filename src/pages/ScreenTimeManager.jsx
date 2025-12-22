import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { getTodayScreenTime, getAverageScreenTime, getOrCreateWinStreak } from '../functions/businessLogic';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Target, Flame, Trophy, Crown, Ban } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ScreenTimeManager() {
  const [activeTab, setActiveTab] = useState('overview');

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6">
      <div className="max-w-md mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Home</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Screen Time Manager
          </h1>
          <p className="text-sm text-zinc-500 font-medium">Block, Focus & Track</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl blur-lg" />
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 shadow-xl">
              <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">Today</div>
              <div className="text-2xl font-bold mb-1">{Math.round(todayScreenTime || 0)}m</div>
              <div className="text-[10px] text-zinc-600">Screen Time</div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-2xl blur-lg" />
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 shadow-xl">
              <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">7-Day Avg</div>
              <div className="text-2xl font-bold mb-1">{Math.round(avgScreenTime || 0)}m</div>
              <div className="text-[10px] text-zinc-600">Per Day</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link
            to={createPageUrl('FocusMode')}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
            <div className="relative p-5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 shadow-xl group-hover:border-zinc-600/50 transition-all group-active:scale-[0.97]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-3 shadow-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm font-bold mb-1">Focus Mode</div>
              <div className="text-[10px] text-zinc-500">Deep work session</div>
            </div>
          </Link>

          <Link
            to={createPageUrl('ScreenTime')}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-orange-600/20 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
            <div className="relative p-5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 shadow-xl group-hover:border-zinc-600/50 transition-all group-active:scale-[0.97]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mb-3 shadow-lg">
                <Ban className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm font-bold mb-1">Block Apps</div>
              <div className="text-[10px] text-zinc-500">{(blockedApps?.length || 0) + (blockedSites?.length || 0)} blocked</div>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="space-y-3 mb-6">
          <Link to={createPageUrl('WinStreak')} className="block group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-red-600/10 rounded-xl blur-lg group-hover:blur-xl transition-all" />
              <div className="relative flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700/50 shadow-lg group-hover:border-zinc-600/50 transition-all">
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="text-xs text-zinc-500 font-medium">Win Streak</div>
                    <div className="text-sm font-bold">{streak?.current_streak || 0} days</div>
                  </div>
                </div>
                <div className="text-xs text-zinc-600">→</div>
              </div>
            </div>
          </Link>

          <Link to={createPageUrl('Rank')} className="block group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 to-amber-600/10 rounded-xl blur-lg group-hover:blur-xl transition-all" />
              <div className="relative flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700/50 shadow-lg group-hover:border-zinc-600/50 transition-all">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <div>
                    <div className="text-xs text-zinc-500 font-medium">Current Rank</div>
                    <div className="text-sm font-bold">{rankData?.rank_name || 'Panda'}</div>
                  </div>
                </div>
                <div className="text-xs text-zinc-600">→</div>
              </div>
            </div>
          </Link>

          <Link to={createPageUrl('Leaderboard')} className="block group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-xl blur-lg group-hover:blur-xl transition-all" />
              <div className="relative flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700/50 shadow-lg group-hover:border-zinc-600/50 transition-all">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-cyan-500" />
                  <div>
                    <div className="text-xs text-zinc-500 font-medium">Leaderboard</div>
                    <div className="text-sm font-bold">Global Rankings</div>
                  </div>
                </div>
                <div className="text-xs text-zinc-600">→</div>
              </div>
            </div>
          </Link>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
          <div className="text-xs text-zinc-500 leading-relaxed">
            <span className="font-semibold text-zinc-400">Note:</span> Full app/website blocking requires native OS permissions. Use this as a tracking and awareness tool.
          </div>
        </div>
      </div>
    </div>
  );
}