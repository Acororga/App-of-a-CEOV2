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