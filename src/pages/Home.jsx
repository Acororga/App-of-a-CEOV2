import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { getOrCreateWinStreak } from '../functions/businessLogic';
import { base44 } from '@/api/base44Client';
import { 
  BarChart3, Ban, Target, Flame, Gift, Crown, 
  Trophy, CheckSquare, ListChecks, Calendar, Circle 
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
      const ranks = await base44.entities.UserRank.filter({ created_by: (await base44.auth.me()).email });
      return ranks[0] || { rank_name: 'Panda', rank_level: 1 };
    }
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const modules = [
    { name: 'Dashboard', page: 'Dashboard', icon: BarChart3, color: 'text-blue-400' },
    { name: 'Block', page: 'ScreenTime', icon: Ban, color: 'text-red-400' },
    { name: 'Focus', page: 'FocusMode', icon: Target, color: 'text-purple-400' },
    { name: 'Streak', page: 'WinStreak', icon: Flame, color: 'text-orange-400' },
    { name: 'Award', page: 'Rewards', icon: Gift, color: 'text-green-400' },
    { name: 'Rank', page: 'Rank', icon: Crown, color: 'text-yellow-400' },
    { name: 'Board', page: 'Leaderboard', icon: Trophy, color: 'text-cyan-400' },
    { name: 'Habit', page: 'Habits', icon: CheckSquare, color: 'text-emerald-400' },
    { name: 'Pareto', page: 'Pareto', icon: ListChecks, color: 'text-indigo-400' },
    { name: 'Cal', page: 'Calendar', icon: Calendar, color: 'text-pink-400' },
    { name: 'CEO', page: 'CEOMode', icon: Circle, color: 'text-white' }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <span className="text-sm font-bold">{user?.full_name?.charAt(0) || '?'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-gray-500">RANK</div>
            <div className="text-sm font-bold">{rankData?.rank_name || 'Panda'}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">STREAK</div>
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold">{streakData?.current_streak || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Icon Grid */}
      <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.page}
              to={createPageUrl(module.page)}
              className="group"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 flex items-center justify-center group-hover:border-gray-500 transition-all group-active:scale-95">
                  <Icon className={`w-8 h-8 ${module.color}`} />
                </div>
                <span className="text-xs text-gray-400 font-medium">{module.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}