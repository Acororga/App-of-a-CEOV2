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
    // Fonction pour générer les craquelures sismiques partant du coin
    const generateCracks = (color, position) => {
      // Dimensions: 1/8 de l'écran (12.5% en largeur et hauteur)
      const size = 'w-[12.5vw] h-[12.5vh]';
      
      // Craquelures qui partent du coin (0,0) et se ramifient comme une rivière
      // Branche principale 1 - vers le bas-droite
      const mainBranch1 = `
        <path d="M 0 0 L 8 10 L 15 22 L 22 35 L 28 48 L 32 60" 
              stroke="${color}" stroke-width="1.8" fill="none" opacity="0.75" stroke-linecap="round"/>
      `;
      
      // Ramifications de la branche 1
      const ramifications1 = `
        <path d="M 8 10 L 12 18 L 18 28 L 22 38" 
              stroke="${color}" stroke-width="1.2" fill="none" opacity="0.6" stroke-linecap="round"/>
        <path d="M 15 22 L 20 30 L 25 40" 
              stroke="${color}" stroke-width="1.0" fill="none" opacity="0.5" stroke-linecap="round"/>
        <path d="M 22 35 L 28 42 L 32 50" 
              stroke="${color}" stroke-width="0.9" fill="none" opacity="0.45" stroke-linecap="round"/>
        <path d="M 12 18 L 15 25 L 18 32" 
              stroke="${color}" stroke-width="0.8" fill="none" opacity="0.4" stroke-linecap="round"/>
        <path d="M 20 30 L 24 36 L 28 44" 
              stroke="${color}" stroke-width="0.7" fill="none" opacity="0.35" stroke-linecap="round"/>
      `;
      
      // Branche principale 2 - vers la droite-bas
      const mainBranch2 = `
        <path d="M 0 0 L 12 6 L 25 12 L 38 18 L 52 22 L 65 28" 
              stroke="${color}" stroke-width="1.6" fill="none" opacity="0.7" stroke-linecap="round"/>
      `;
      
      // Ramifications de la branche 2
      const ramifications2 = `
        <path d="M 12 6 L 18 12 L 25 20 L 30 28" 
              stroke="${color}" stroke-width="1.1" fill="none" opacity="0.55" stroke-linecap="round"/>
        <path d="M 25 12 L 30 18 L 36 26" 
              stroke="${color}" stroke-width="0.95" fill="none" opacity="0.48" stroke-linecap="round"/>
        <path d="M 38 18 L 42 24 L 48 32 L 52 40" 
              stroke="${color}" stroke-width="0.85" fill="none" opacity="0.42" stroke-linecap="round"/>
        <path d="M 18 12 L 22 18 L 26 24" 
              stroke="${color}" stroke-width="0.75" fill="none" opacity="0.38" stroke-linecap="round"/>
        <path d="M 30 18 L 35 24 L 40 30" 
              stroke="${color}" stroke-width="0.7" fill="none" opacity="0.33" stroke-linecap="round"/>
      `;
      
      // Branche principale 3 - diagonale équilibrée
      const mainBranch3 = `
        <path d="M 0 0 L 10 8 L 20 18 L 32 28 L 45 40 L 58 52" 
              stroke="${color}" stroke-width="1.5" fill="none" opacity="0.68" stroke-linecap="round"/>
      `;
      
      // Ramifications de la branche 3
      const ramifications3 = `
        <path d="M 10 8 L 14 15 L 18 22" 
              stroke="${color}" stroke-width="0.9" fill="none" opacity="0.45" stroke-linecap="round"/>
        <path d="M 20 18 L 24 25 L 28 32 L 32 40" 
              stroke="${color}" stroke-width="0.85" fill="none" opacity="0.4" stroke-linecap="round"/>
        <path d="M 32 28 L 38 35 L 44 42" 
              stroke="${color}" stroke-width="0.8" fill="none" opacity="0.38" stroke-linecap="round"/>
        <path d="M 14 15 L 17 20 L 20 26" 
              stroke="${color}" stroke-width="0.65" fill="none" opacity="0.32" stroke-linecap="round"/>
        <path d="M 45 40 L 50 46 L 55 53" 
              stroke="${color}" stroke-width="0.75" fill="none" opacity="0.35" stroke-linecap="round"/>
      `;

      const crackPattern = mainBranch1 + ramifications1 + mainBranch2 + ramifications2 + mainBranch3 + ramifications3;

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
             style={{ transform: transforms[position], transformOrigin: position.includes('top') ? 'top' : 'bottom' }}>
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