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
    // Fonction pour générer les craquelures sismiques
    const generateCracks = (color, position) => {
      // Dimensions: 1/8 de l'écran (12.5% en largeur et hauteur)
      const size = 'w-[12.5vw] h-[12.5vh]';
      
      // Craquelures organiques qui partent du coin et se ramifient
      const crackPattern = `
        <path d="M 0 0 L 15 8 L 28 5 L 35 15 L 45 12 L 52 20 L 60 18 L 68 25" 
              stroke="${color}" stroke-width="1.5" fill="none" opacity="0.7" stroke-linecap="round"/>
        <path d="M 0 0 L 10 12 L 18 18 L 25 28 L 30 35 L 35 45" 
              stroke="${color}" stroke-width="1.2" fill="none" opacity="0.6" stroke-linecap="round"/>
        <path d="M 0 0 L 8 6 L 12 14 L 20 22 L 28 30 L 35 40 L 42 48" 
              stroke="${color}" stroke-width="1" fill="none" opacity="0.5" stroke-linecap="round"/>
        <path d="M 15 8 L 22 15 L 28 22 L 35 28" 
              stroke="${color}" stroke-width="0.8" fill="none" opacity="0.45" stroke-linecap="round"/>
        <path d="M 28 5 L 32 12 L 38 18 L 44 24" 
              stroke="${color}" stroke-width="0.8" fill="none" opacity="0.4" stroke-linecap="round"/>
        <path d="M 10 12 L 15 18 L 18 25 L 22 32" 
              stroke="${color}" stroke-width="0.7" fill="none" opacity="0.35" stroke-linecap="round"/>
        <path d="M 35 15 L 40 22 L 45 28 L 50 35 L 55 42" 
              stroke="${color}" stroke-width="0.9" fill="none" opacity="0.5" stroke-linecap="round"/>
        <path d="M 25 28 L 30 35 L 35 42 L 40 48 L 45 55" 
              stroke="${color}" stroke-width="0.7" fill="none" opacity="0.4" stroke-linecap="round"/>
        <path d="M 52 20 L 58 28 L 62 35 L 68 42" 
              stroke="${color}" stroke-width="0.6" fill="none" opacity="0.35" stroke-linecap="round"/>
        <path d="M 20 22 L 24 28 L 28 35" 
              stroke="${color}" stroke-width="0.6" fill="none" opacity="0.3" stroke-linecap="round"/>
      `;

      const positions = {
        'top-right': 'top-0 right-0',
        'bottom-left': 'bottom-0 left-0',
        'top-left': 'top-0 left-0',
        'bottom-right': 'bottom-0 right-0'
      };

      const transforms = {
        'top-right': '',
        'bottom-left': 'scale(-1, -1)',
        'top-left': 'scale(-1, 1)',
        'bottom-right': 'scale(1, -1)'
      };

      return (
        <svg className={`absolute ${positions[position]} ${size} pointer-events-none z-10`} 
             viewBox="0 0 100 100" 
             preserveAspectRatio="xMinYMin meet"
             style={{ transform: transforms[position], transformOrigin: 'center' }}>
          <g dangerouslySetInnerHTML={{ __html: crackPattern }} />
        </svg>
      );
    };

    const styles = {
      1: { // Bronze
        accent: 'amber-600',
        accentRgb: '217, 119, 6',
        topRightOrnament: generateCracks('#cd7f32', 'top-right'),
        bottomLeftOrnament: generateCracks('#cd7f32', 'bottom-left')
      },
      2: { // Silver
        accent: 'gray-400',
        accentRgb: '156, 163, 175',
        topRightOrnament: generateCracks('#c0c0c0', 'top-right'),
        bottomLeftOrnament: generateCracks('#c0c0c0', 'bottom-left')
      },
      3: { // Gold
        accent: 'yellow-600',
        accentRgb: '202, 138, 4',
        topRightOrnament: generateCracks('#ffd700', 'top-right'),
        bottomLeftOrnament: generateCracks('#ffd700', 'bottom-left')
      },
      4: { // Platinum
        accent: 'cyan-500',
        accentRgb: '6, 182, 212',
        topRightOrnament: (
          <>
            {generateCracks('#e5e4e2', 'top-right')}
            <svg className="absolute top-0 right-0 w-[12.5vw] h-[12.5vh] pointer-events-none z-10" 
                 viewBox="0 0 100 100">
              <defs>
                <linearGradient id="platinum-shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e5e4e2" stopOpacity="0.3"/>
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.15"/>
                  <stop offset="100%" stopColor="#e5e4e2" stopOpacity="0.3"/>
                </linearGradient>
              </defs>
              <path d="M 10 5 L 15 8" stroke="url(#platinum-shimmer)" strokeWidth="2" opacity="0.4"/>
              <path d="M 25 12 L 30 15" stroke="url(#platinum-shimmer)" strokeWidth="2" opacity="0.3"/>
              <path d="M 40 20 L 45 23" stroke="url(#platinum-shimmer)" strokeWidth="2" opacity="0.35"/>
            </svg>
          </>
        ),
        bottomLeftOrnament: (
          <>
            {generateCracks('#e5e4e2', 'bottom-left')}
            <svg className="absolute bottom-0 left-0 w-[12.5vw] h-[12.5vh] pointer-events-none z-10" 
                 viewBox="0 0 100 100"
                 style={{ transform: 'scale(-1, -1)', transformOrigin: 'center' }}>
              <path d="M 10 5 L 15 8" stroke="url(#platinum-shimmer)" strokeWidth="2" opacity="0.4"/>
              <path d="M 25 12 L 30 15" stroke="url(#platinum-shimmer)" strokeWidth="2" opacity="0.3"/>
              <path d="M 40 20 L 45 23" stroke="url(#platinum-shimmer)" strokeWidth="2" opacity="0.35"/>
            </svg>
          </>
        )
      },
      5: { // Diamond
        accent: 'blue-400',
        accentRgb: '96, 165, 250',
        topRightOrnament: (
          <>
            {generateCracks('#b9f2ff', 'top-right')}
            <svg className="absolute top-0 right-0 w-[12.5vw] h-[12.5vh] pointer-events-none z-10" 
                 viewBox="0 0 100 100">
              <defs>
                <filter id="diamond-sparkle">
                  <feGaussianBlur stdDeviation="1.5" result="blur"/>
                  <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                </filter>
              </defs>
              <circle cx="20" cy="15" r="1.5" fill="#b9f2ff" opacity="0.9" filter="url(#diamond-sparkle)"/>
              <circle cx="35" cy="25" r="1" fill="#b9f2ff" opacity="0.7" filter="url(#diamond-sparkle)"/>
              <circle cx="45" cy="35" r="1.2" fill="#b9f2ff" opacity="0.8" filter="url(#diamond-sparkle)"/>
              <circle cx="28" cy="20" r="0.8" fill="#b9f2ff" opacity="0.6" filter="url(#diamond-sparkle)"/>
              <circle cx="50" cy="28" r="1" fill="#b9f2ff" opacity="0.75" filter="url(#diamond-sparkle)"/>
            </svg>
          </>
        ),
        bottomLeftOrnament: (
          <>
            {generateCracks('#b9f2ff', 'bottom-left')}
            <svg className="absolute bottom-0 left-0 w-[12.5vw] h-[12.5vh] pointer-events-none z-10" 
                 viewBox="0 0 100 100"
                 style={{ transform: 'scale(-1, -1)', transformOrigin: 'center' }}>
              <circle cx="20" cy="15" r="1.5" fill="#b9f2ff" opacity="0.9" filter="url(#diamond-sparkle)"/>
              <circle cx="35" cy="25" r="1" fill="#b9f2ff" opacity="0.7" filter="url(#diamond-sparkle)"/>
              <circle cx="45" cy="35" r="1.2" fill="#b9f2ff" opacity="0.8" filter="url(#diamond-sparkle)"/>
              <circle cx="28" cy="20" r="0.8" fill="#b9f2ff" opacity="0.6" filter="url(#diamond-sparkle)"/>
              <circle cx="50" cy="28" r="1" fill="#b9f2ff" opacity="0.75" filter="url(#diamond-sparkle)"/>
            </svg>
          </>
        )
      },
      6: { // Batman
        accent: 'zinc-700',
        accentRgb: '63, 63, 70',
        topRightOrnament: generateCracks('#1a1a1a', 'top-right'),
        bottomLeftOrnament: generateCracks('#1a1a1a', 'bottom-left')
      },
      7: { // CEO
        accent: 'yellow-500',
        accentRgb: '234, 179, 8',
        topRightOrnament: generateCracks('#ffd700', 'top-right'),
        bottomLeftOrnament: generateCracks('#ffd700', 'bottom-left'),
        topLeftOrnament: generateCracks('#ffd700', 'top-left'),
        bottomRightOrnament: generateCracks('#ffd700', 'bottom-right'),
        ceoGlow: true
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