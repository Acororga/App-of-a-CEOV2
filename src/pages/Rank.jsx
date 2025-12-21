import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { calculateUserRank, getNextRankRequirements } from '../functions/calculateRankLogic';
import { ArrowLeft, Crown, TrendingUp, Zap } from 'lucide-react';

const RANK_TIERS = [
  { level: 1, name: 'Bronze', icon: '🥉', description: 'Starting rank' },
  { level: 2, name: 'Silver', icon: '🥈', description: '15 days + 10 day streak' },
  { level: 3, name: 'Gold', icon: '🥇', description: '50 day streak' },
  { level: 4, name: 'Platinum', icon: '💎', description: '90 day streak + 60h Focus' },
  { level: 5, name: 'Diamond', icon: '💠', description: '180 day streak + 200h Focus' },
  { level: 6, name: 'Batman', icon: '🦇', description: '365 day streak + 200h Focus + 100h CEO' },
  { level: 7, name: 'CEO', icon: '👑', description: '500 day streak + 250h Focus + 250h CEO' }
];

export default function Rank() {
  const { data: rankData, refetch } = useQuery({
    queryKey: ['userRank'],
    queryFn: calculateUserRank
  });

  useEffect(() => {
    // Recalculate rank on mount
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

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-gray-400 mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Home</span>
        </Link>

        <div className="text-center mb-12">
          <div className="text-7xl mb-4">{currentTier?.icon || '🥉'}</div>
          <h1 className="text-4xl font-bold mb-2">{rankData?.rankName || 'Bronze'}</h1>
          <div className="text-sm text-gray-500">Level {rankData?.rankLevel || 1} / 7</div>
        </div>

        {nextRequirements && nextRequirements.needs.length > 0 && (
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