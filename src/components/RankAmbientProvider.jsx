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
    const frameConfigs = {
      1: { // Bronze
        thickness: 2,
        gradient: 'linear-gradient(180deg, #6d5a3c 0%, #a07e52 100%)',
        glow: 'none'
      },
      2: { // Silver
        thickness: 3,
        gradient: 'linear-gradient(180deg, #888888 0%, #c0c0c0 100%)',
        glow: '0 0 8px rgba(192, 192, 192, 0.3)'
      },
      3: { // Gold
        thickness: 4,
        gradient: 'linear-gradient(180deg, #b8860b 0%, #ffd700 100%)',
        glow: '0 0 12px rgba(255, 215, 0, 0.4)'
      },
      4: { // Platinum
        thickness: 5,
        gradient: 'linear-gradient(180deg, #a0a8b0 0%, #d8dce0 100%)',
        glow: '0 0 10px rgba(216, 220, 224, 0.3)'
      },
      5: { // Diamond
        thickness: 6,
        gradient: 'linear-gradient(180deg, #d0e8f0 0%, #e8f8ff 100%)',
        glow: '0 0 16px rgba(176, 224, 230, 0.5)'
      },
      6: { // Batman
        thickness: 4,
        gradient: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
        glow: 'none'
      },
      7: { // CEO - double frame
        thickness: 6,
        innerThickness: 2,
        gap: 2,
        gradient: 'linear-gradient(180deg, #b8860b 0%, #ffd700 100%)',
        glow: '0 0 20px rgba(255, 215, 0, 0.4)'
      }
    };

    const config = frameConfigs[rankLevel] || frameConfigs[1];
    const isCEO = rankLevel === 7;

    const frame = isCEO ? (
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 5 }}>
        <div 
          className="absolute inset-0"
          style={{
            border: `${config.thickness}px solid`,
            borderImage: config.gradient,
            borderImageSlice: 1,
            boxShadow: config.glow !== 'none' ? config.glow : undefined
          }}
        />
        <div 
          className="absolute"
          style={{
            top: `${config.thickness + config.gap}px`,
            left: `${config.thickness + config.gap}px`,
            right: `${config.thickness + config.gap}px`,
            bottom: `${config.thickness + config.gap}px`,
            border: `${config.innerThickness}px solid`,
            borderImage: config.gradient,
            borderImageSlice: 1
          }}
        />
      </div>
    ) : (
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 5,
          border: `${config.thickness}px solid`,
          borderImage: config.gradient,
          borderImageSlice: 1,
          boxShadow: config.glow !== 'none' ? config.glow : undefined
        }}
      />
    );

    return {
      frame,
      accentRgb: '255, 255, 255',
      rankLevel,
      rankName
    };
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