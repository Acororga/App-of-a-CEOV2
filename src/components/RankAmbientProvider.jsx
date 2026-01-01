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
    // Générateur de barres de pouvoir rectangulaires (angles droits à 90°, usinées)
    const generatePowerBar = (position, material) => {
      const bars = {
        'top-right': 'top-0 right-0 w-[8vw] h-[2px]',
        'bottom-left': 'bottom-0 left-0 w-[8vw] h-[2px]',
        'top-left': 'top-0 left-0 w-[8vw] h-[2px]',
        'bottom-right': 'bottom-0 right-0 w-[8vw] h-[2px]'
      };

      const { bgColor, texture, shadow, finish } = material;

      return (
        <div 
          key={position}
          className={`absolute ${bars[position]} pointer-events-none z-10`}
          style={{
            background: bgColor,
            boxShadow: shadow,
            ...texture,
            ...finish
          }}
        />
      );
    };

    // Générateur de cadre rectangulaire usiné
    const generateFrame = (thickness, material) => {
      const { bgColor, texture, shadow, finish } = material;

      return (
        <div 
          className="fixed inset-0 pointer-events-none z-5"
          style={{
            border: `${thickness}px solid ${bgColor}`,
            boxShadow: shadow,
            ...texture,
            ...finish
          }}
        />
      );
    };

    // Matériaux par rang - usiné, contrôlé, statutaire
    const materials = {
      1: { // Bronze
        bgColor: '#8b6f47',
        texture: {
          backgroundImage: 'linear-gradient(135deg, rgba(160,130,109,0.1) 0%, rgba(139,111,71,0.1) 100%)',
        },
        shadow: '0 1px 2px rgba(0,0,0,0.3), inset 0 0.5px 0 rgba(255,255,255,0.05)',
        finish: { filter: 'brightness(0.95) saturate(0.8)' }
      },
      2: { // Silver
        bgColor: '#a8a8a8',
        texture: {
          backgroundImage: 'linear-gradient(135deg, rgba(192,192,192,0.15) 0%, rgba(168,168,168,0.15) 100%)',
        },
        shadow: '0 1px 2px rgba(0,0,0,0.25), inset 0 0.5px 0 rgba(255,255,255,0.1)',
        finish: { filter: 'brightness(1) saturate(0.7)' }
      },
      3: { // Gold
        bgColor: '#d4af37',
        texture: {
          backgroundImage: 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(212,175,55,0.2) 100%)',
        },
        shadow: '0 1px 3px rgba(0,0,0,0.3), inset 0 0.5px 0 rgba(255,255,255,0.15)',
        finish: { filter: 'brightness(1.05) saturate(0.9)' }
      },
      4: { // Platinum
        bgColor: '#c9c9c9',
        texture: {
          backgroundImage: 'linear-gradient(135deg, rgba(229,228,226,0.2) 0%, rgba(201,201,201,0.2) 100%)',
        },
        shadow: '0 1px 3px rgba(0,0,0,0.25), inset 0 0.5px 0 rgba(255,255,255,0.12)',
        finish: { filter: 'brightness(1.1) saturate(0.5)' }
      },
      5: { // Diamond
        bgColor: '#b0e0e6',
        texture: {
          backgroundImage: 'linear-gradient(135deg, rgba(185,242,255,0.25) 0%, rgba(176,224,230,0.25) 100%)',
        },
        shadow: '0 1px 4px rgba(0,0,0,0.2), inset 0 0.5px 0 rgba(255,255,255,0.2), 0 0 8px rgba(176,224,230,0.15)',
        finish: { filter: 'brightness(1.15) saturate(0.6)' }
      },
      6: { // Batman
        bgColor: '#0a0a0a',
        texture: {
          backgroundImage: 'none',
        },
        shadow: '0 1px 1px rgba(0,0,0,0.5), inset 0 0.5px 0 rgba(255,255,255,0.02)',
        finish: { filter: 'brightness(0.4) saturate(0)' }
      },
      7: { // CEO
        bgColor: '#d4af37',
        texture: {
          backgroundImage: 'linear-gradient(135deg, rgba(255,215,0,0.3) 0%, rgba(212,175,55,0.3) 100%)',
        },
        shadow: '0 2px 4px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 12px rgba(212,175,55,0.2)',
        finish: { filter: 'brightness(1.1) saturate(1)' }
      }
    };

    const accentRgbs = {
      1: '139, 111, 71',
      2: '168, 168, 168',
      3: '212, 175, 55',
      4: '201, 201, 201',
      5: '176, 224, 230',
      6: '10, 10, 10',
      7: '212, 175, 55'
    };

    // Épaisseur du cadre selon le rang
    const frameThickness = {
      1: 1,   // Bronze - très fin
      2: 1.5, // Silver - fin
      3: 2,   // Gold - moyen
      4: 2.5, // Platinum - épais
      5: 3,   // Diamond - épais
      6: 2,   // Batman - presque invisible
      7: 3    // CEO - double cadre (simulé par épaisseur)
    };

    const material = materials[rankLevel];
    const accentRgb = accentRgbs[rankLevel] || '139, 111, 71';
    const isCEO = rankLevel === 7;

    // Générer les barres (CEO = 4 coins, autres = 2 coins)
    const powerBars = (
      <>
        {generatePowerBar('top-right', material)}
        {generatePowerBar('bottom-left', material)}
        {isCEO && generatePowerBar('top-left', material)}
        {isCEO && generatePowerBar('bottom-right', material)}
      </>
    );

    const frame = generateFrame(frameThickness[rankLevel], material);

    return {
      powerBars,
      frame,
      accentRgb,
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