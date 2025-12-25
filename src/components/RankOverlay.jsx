import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function RankOverlay() {
  const { data: rankData } = useQuery({
    queryKey: ['userRank'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const ranks = await base44.entities.UserRank.filter({ created_by: user.email });
      return ranks[0] || { rank_name: 'Bronze', rank_level: 1 };
    },
    refetchInterval: 30000
  });

  const rankLevel = rankData?.rank_level || 1;

  // CEO rank: gold outline only
  if (rankLevel === 7) {
    return (
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <div className="absolute inset-0 border-2 border-yellow-500/20 rounded-3xl m-4" />
      </div>
    );
  }

  // Branch configurations per rank
  const branchConfigs = {
    1: { color: 'from-amber-700/15 via-orange-600/15 to-amber-800/15' }, // Bronze
    2: { color: 'from-gray-400/15 via-gray-500/15 to-gray-400/15' }, // Silver
    3: { color: 'from-yellow-500/20 via-yellow-600/20 to-yellow-400/20' }, // Gold
    4: { color: 'from-cyan-300/15 via-slate-400/15 to-cyan-300/15' }, // Platinum
    5: { color: 'from-blue-300/20 via-cyan-400/20 to-blue-300/20' }, // Diamond
    6: { color: 'from-zinc-900/25 via-black/25 to-zinc-900/25' } // Batman
  };

  const config = branchConfigs[rankLevel] || branchConfigs[1];

  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      {/* Top-right branch */}
      <div className="absolute top-0 right-0 w-64 h-64 overflow-hidden">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full opacity-80"
          style={{ transform: 'rotate(0deg)' }}
        >
          <defs>
            <linearGradient id={`branchGradient-tr-${rankLevel}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className={`bg-gradient-to-br ${config.color}`} style={{ stopColor: 'currentColor', stopOpacity: 0.15 }} />
              <stop offset="50%" className={`bg-gradient-to-br ${config.color}`} style={{ stopColor: 'currentColor', stopOpacity: 0.25 }} />
              <stop offset="100%" className={`bg-gradient-to-br ${config.color}`} style={{ stopColor: 'currentColor', stopOpacity: 0.15 }} />
            </linearGradient>
          </defs>
          
          {/* Main branch */}
          <path
            d="M 200 0 Q 180 20, 160 40 Q 140 60, 120 80 Q 100 100, 80 120"
            stroke={`url(#branchGradient-tr-${rankLevel})`}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Sub-branches */}
          <path
            d="M 180 20 Q 175 30, 170 40"
            stroke={`url(#branchGradient-tr-${rankLevel})`}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M 140 60 Q 135 70, 130 80"
            stroke={`url(#branchGradient-tr-${rankLevel})`}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Bottom-left branch */}
      <div className="absolute bottom-0 left-0 w-64 h-64 overflow-hidden">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full opacity-80"
          style={{ transform: 'rotate(0deg)' }}
        >
          <defs>
            <linearGradient id={`branchGradient-bl-${rankLevel}`} x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" className={`bg-gradient-to-br ${config.color}`} style={{ stopColor: 'currentColor', stopOpacity: 0.15 }} />
              <stop offset="50%" className={`bg-gradient-to-br ${config.color}`} style={{ stopColor: 'currentColor', stopOpacity: 0.25 }} />
              <stop offset="100%" className={`bg-gradient-to-br ${config.color}`} style={{ stopColor: 'currentColor', stopOpacity: 0.15 }} />
            </linearGradient>
          </defs>
          
          {/* Main branch */}
          <path
            d="M 0 200 Q 20 180, 40 160 Q 60 140, 80 120 Q 100 100, 120 80"
            stroke={`url(#branchGradient-bl-${rankLevel})`}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Sub-branches */}
          <path
            d="M 20 180 Q 25 170, 30 160"
            stroke={`url(#branchGradient-bl-${rankLevel})`}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M 60 140 Q 65 130, 70 120"
            stroke={`url(#branchGradient-bl-${rankLevel})`}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      </div>
    </div>
  );
}