import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { RANK_TIERS, getAverageScreenTime, getOrCreateWinStreak, calculateRank } from '../functions/businessLogic';
import { ArrowLeft, Crown, TrendingUp } from 'lucide-react';

export default function Rank() {
  const { data: rankData } = useQuery({
    queryKey: ['userRank'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const ranks = await base44.entities.UserRank.filter({ created_by: user.email });
      return ranks[0];
    }
  });

  const { data: avgScreenTime } = useQuery({
    queryKey: ['avgScreenTime'],
    queryFn: () => getAverageScreenTime(7)
  });

  const { data: streak } = useQuery({
    queryKey: ['winStreak'],
    queryFn: getOrCreateWinStreak
  });

  const { data: calculated } = useQuery({
    queryKey: ['calculatedRank', avgScreenTime, streak?.current_streak],
    queryFn: () => calculateRank(avgScreenTime || 0, streak?.current_streak || 0),
    enabled: !!avgScreenTime && !!streak
  });

  const currentTier = RANK_TIERS?.find(t => t.level === (rankData?.rank_level || 1)) || RANK_TIERS?.[0];
  const nextTier = RANK_TIERS?.find(t => t.level === (rankData?.rank_level || 1) + 1);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-gray-400 mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Home</span>
        </Link>

        <div className="text-center mb-12">
          <div className="text-7xl mb-4">{currentTier?.icon || '🐼'}</div>
          <h1 className="text-4xl font-bold mb-2">{rankData?.rank_name || 'Panda'}</h1>
          <div className="text-sm text-gray-500">Level {rankData?.rank_level || 1} / 9</div>
        </div>

        {nextTier && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Progress to {nextTier.name}</span>
              <span className="text-sm text-gray-400">{calculated?.progressToNext || 0}%</span>
            </div>
            <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all"
                style={{ width: `${calculated?.progressToNext || 0}%` }}
              />
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">YOUR STATS</h2>
          <div className="space-y-3">
            <div className="flex justify-between p-4 rounded-lg bg-gray-900">
              <span className="text-sm text-gray-400">Avg Screen Time</span>
              <span className="text-sm font-semibold">
                {avgScreenTime ? `${Math.round(avgScreenTime)}m/day` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between p-4 rounded-lg bg-gray-900">
              <span className="text-sm text-gray-400">Win Streak Bonus</span>
              <span className="text-sm font-semibold text-orange-400">
                +{rankData?.win_streak_bonus || 0}
              </span>
            </div>
            <div className="flex justify-between p-4 rounded-lg bg-gray-900">
              <span className="text-sm text-gray-400">Days at Rank</span>
              <span className="text-sm font-semibold">{rankData?.days_at_current_rank || 0}</span>
            </div>
          </div>
        </div>

        {nextTier && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold text-gray-300">NEXT RANK</h2>
            </div>
            <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{nextTier.icon}</span>
                <div>
                  <div className="font-semibold">{nextTier.name}</div>
                  <div className="text-xs text-gray-500">Level {nextTier.level}</div>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                Requires: ≤{nextTier.minScreenTimeMinutes}m screen time/day
              </div>
              {avgScreenTime && avgScreenTime > nextTier.minScreenTimeMinutes && (
                <div className="text-sm text-green-400 mt-2">
                  Reduce by: {Math.round(avgScreenTime - nextTier.minScreenTimeMinutes)}m/day
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">RANK LADDER</h2>
        </div>

        <div className="space-y-2">
          {(RANK_TIERS ? [...RANK_TIERS] : []).reverse().map(tier => (
            <div
              key={tier.level}
              className={`p-4 rounded-lg border transition-all ${
                tier.level === (rankData?.rank_level || 1)
                  ? 'bg-gradient-to-r from-yellow-950 to-gray-900 border-yellow-900'
                  : tier.level < (rankData?.rank_level || 1)
                  ? 'bg-gray-900 border-gray-800 opacity-50'
                  : 'bg-gray-900 border-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tier.icon}</span>
                  <div>
                    <div className="font-semibold">{tier.name}</div>
                    <div className="text-xs text-gray-500">Level {tier.level}</div>
                  </div>
                </div>
                {tier.level === (rankData?.rank_level || 1) && (
                  <Crown className="w-5 h-5 text-yellow-500" />
                )}
                {tier.level < (rankData?.rank_level || 1) && (
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