import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const RankAmbientContext = createContext(null);

export function RankAmbientProvider({ children }) {
  const { data: rankData } = useQuery({
    queryKey: ['userRank'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const ranks = await base44.entities.UserRank.filter({ created_by: user.email });
      return ranks[0] || { rank_name: 'Bronze', rank_level: 1 };
    },
    staleTime: 60000,
    refetchInterval: 60000
  });

  const rankLevel = rankData?.rank_level || 1;
  const rankName = rankData?.rank_name || 'Bronze';

  const ambientStyles = useMemo(() => {
    const styles = {
      1: { // Bronze
        gradient: 'from-amber-900/[0.04] via-orange-900/[0.03] to-amber-900/[0.04]',
        accent: 'amber-600',
        accentRgb: '217, 119, 6'
      },
      2: { // Silver
        gradient: 'from-gray-500/[0.03] via-gray-400/[0.02] to-gray-500/[0.03]',
        accent: 'gray-400',
        accentRgb: '156, 163, 175'
      },
      3: { // Gold
        gradient: 'from-yellow-700/[0.05] via-yellow-600/[0.04] to-yellow-700/[0.05]',
        accent: 'yellow-600',
        accentRgb: '202, 138, 4'
      },
      4: { // Platinum
        gradient: 'from-cyan-900/[0.04] via-slate-800/[0.03] to-cyan-900/[0.04]',
        accent: 'cyan-500',
        accentRgb: '6, 182, 212'
      },
      5: { // Diamond
        gradient: 'from-blue-900/[0.05] via-cyan-900/[0.04] to-blue-900/[0.05]',
        accent: 'blue-400',
        accentRgb: '96, 165, 250'
      },
      6: { // Batman
        gradient: 'from-black/[0.06] via-zinc-950/[0.05] to-black/[0.06]',
        accent: 'zinc-700',
        accentRgb: '63, 63, 70'
      },
      7: { // CEO
        gradient: 'from-black via-black to-black', // No gradient
        accent: 'yellow-500',
        accentRgb: '234, 179, 8'
      }
    };

    return styles[rankLevel] || styles[1];
  }, [rankLevel]);

  const isCEO = rankLevel === 7;

  return (
    <RankAmbientContext.Provider value={{ 
      rankLevel, 
      rankName, 
      ambientStyles, 
      isCEO 
    }}>
      {children}
    </RankAmbientContext.Provider>
  );
}

export function useRankAmbient() {
  const context = useContext(RankAmbientContext);
  if (!context) {
    throw new Error('useRankAmbient must be used within RankAmbientProvider');
  }
  return context;
}