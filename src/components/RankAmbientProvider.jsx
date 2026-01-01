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
    // Fonction pour générer les craquelures sismiques complexes partant du coin exact
    const generateCracks = (color, position) => {
      // Dimensions: 1/8 de l'écran (12.5% en largeur et hauteur)
      const size = 'w-[12.5vw] h-[12.5vh]';
      
      // Craquelures organiques complexes partant du coin (0,0)
      // Structure: plusieurs branches principales avec de nombreuses ramifications
      
      // BRANCHE PRINCIPALE 1 - Vers le bas (verticale)
      const branch1Main = `
        <path d="M 0 0 L 3 12 L 5 25 L 7 38 L 8 52 L 10 65 L 11 78 L 12 92" 
              stroke="${color}" stroke-width="2.2" fill="none" opacity="0.8" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      const branch1Subs = `
        <path d="M 3 12 L 8 18 L 12 24 L 15 30" stroke="${color}" stroke-width="1.3" fill="none" opacity="0.6" stroke-linecap="round"/>
        <path d="M 5 25 L 10 32 L 14 38 L 18 45" stroke="${color}" stroke-width="1.2" fill="none" opacity="0.55" stroke-linecap="round"/>
        <path d="M 8 18 L 12 22 L 16 28" stroke="${color}" stroke-width="0.9" fill="none" opacity="0.45" stroke-linecap="round"/>
        <path d="M 7 38 L 12 45 L 16 52 L 19 58" stroke="${color}" stroke-width="1.1" fill="none" opacity="0.52" stroke-linecap="round"/>
        <path d="M 10 32 L 14 38 L 17 44" stroke="${color}" stroke-width="0.8" fill="none" opacity="0.4" stroke-linecap="round"/>
        <path d="M 10 65 L 15 72 L 18 78 L 22 85" stroke="${color}" stroke-width="1.0" fill="none" opacity="0.48" stroke-linecap="round"/>
        <path d="M 12 45 L 16 50 L 20 56" stroke="${color}" stroke-width="0.75" fill="none" opacity="0.38" stroke-linecap="round"/>
        <path d="M 15 72 L 19 78 L 23 84" stroke="${color}" stroke-width="0.7" fill="none" opacity="0.35" stroke-linecap="round"/>
      `;
      
      // BRANCHE PRINCIPALE 2 - Diagonale moyenne (45 degrés)
      const branch2Main = `
        <path d="M 0 0 L 10 10 L 22 22 L 35 35 L 48 48 L 62 62 L 75 75 L 88 88" 
              stroke="${color}" stroke-width="2.0" fill="none" opacity="0.75" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      const branch2Subs = `
        <path d="M 10 10 L 15 18 L 20 26 L 24 34" stroke="${color}" stroke-width="1.2" fill="none" opacity="0.58" stroke-linecap="round"/>
        <path d="M 22 22 L 28 30 L 33 38 L 38 46" stroke="${color}" stroke-width="1.15" fill="none" opacity="0.55" stroke-linecap="round"/>
        <path d="M 15 18 L 18 24 L 22 30" stroke="${color}" stroke-width="0.85" fill="none" opacity="0.42" stroke-linecap="round"/>
        <path d="M 35 35 L 42 43 L 48 51 L 54 58" stroke="${color}" stroke-width="1.1" fill="none" opacity="0.5" stroke-linecap="round"/>
        <path d="M 28 30 L 32 36 L 36 42" stroke="${color}" stroke-width="0.8" fill="none" opacity="0.4" stroke-linecap="round"/>
        <path d="M 48 48 L 55 56 L 62 64 L 68 72" stroke="${color}" stroke-width="1.0" fill="none" opacity="0.48" stroke-linecap="round"/>
        <path d="M 42 43 L 46 49 L 50 55" stroke="${color}" stroke-width="0.75" fill="none" opacity="0.36" stroke-linecap="round"/>
        <path d="M 62 62 L 68 70 L 74 78 L 80 86" stroke="${color}" stroke-width="0.95" fill="none" opacity="0.45" stroke-linecap="round"/>
        <path d="M 55 56 L 60 62 L 65 68" stroke="${color}" stroke-width="0.7" fill="none" opacity="0.33" stroke-linecap="round"/>
      `;
      
      // BRANCHE PRINCIPALE 3 - Vers la droite (horizontale)
      const branch3Main = `
        <path d="M 0 0 L 13 3 L 27 6 L 42 8 L 57 11 L 72 13 L 87 15" 
              stroke="${color}" stroke-width="1.9" fill="none" opacity="0.72" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      const branch3Subs = `
        <path d="M 13 3 L 18 9 L 23 16 L 28 23" stroke="${color}" stroke-width="1.15" fill="none" opacity="0.56" stroke-linecap="round"/>
        <path d="M 27 6 L 32 13 L 37 20 L 42 28" stroke="${color}" stroke-width="1.1" fill="none" opacity="0.53" stroke-linecap="round"/>
        <path d="M 18 9 L 22 14 L 26 20" stroke="${color}" stroke-width="0.8" fill="none" opacity="0.4" stroke-linecap="round"/>
        <path d="M 42 8 L 48 15 L 54 23 L 60 31" stroke="${color}" stroke-width="1.05" fill="none" opacity="0.5" stroke-linecap="round"/>
        <path d="M 32 13 L 36 19 L 40 25" stroke="${color}" stroke-width="0.75" fill="none" opacity="0.37" stroke-linecap="round"/>
        <path d="M 57 11 L 63 18 L 69 26 L 75 34" stroke="${color}" stroke-width="1.0" fill="none" opacity="0.47" stroke-linecap="round"/>
        <path d="M 48 15 L 52 21 L 56 28" stroke="${color}" stroke-width="0.7" fill="none" opacity="0.34" stroke-linecap="round"/>
        <path d="M 72 13 L 78 20 L 84 28 L 90 36" stroke="${color}" stroke-width="0.95" fill="none" opacity="0.44" stroke-linecap="round"/>
        <path d="M 63 18 L 68 24 L 73 30" stroke="${color}" stroke-width="0.65" fill="none" opacity="0.31" stroke-linecap="round"/>
      `;
      
      // BRANCHE PRINCIPALE 4 - Légèrement vers le bas-droite (20-25 degrés)
      const branch4Main = `
        <path d="M 0 0 L 14 5 L 28 11 L 43 16 L 58 22 L 73 27 L 88 33" 
              stroke="${color}" stroke-width="1.8" fill="none" opacity="0.7" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      const branch4Subs = `
        <path d="M 14 5 L 19 12 L 24 19 L 29 27" stroke="${color}" stroke-width="1.1" fill="none" opacity="0.54" stroke-linecap="round"/>
        <path d="M 28 11 L 34 18 L 40 26 L 45 34" stroke="${color}" stroke-width="1.05" fill="none" opacity="0.51" stroke-linecap="round"/>
        <path d="M 19 12 L 23 18 L 28 24" stroke="${color}" stroke-width="0.78" fill="none" opacity="0.39" stroke-linecap="round"/>
        <path d="M 43 16 L 49 24 L 55 32 L 61 40" stroke="${color}" stroke-width="1.0" fill="none" opacity="0.48" stroke-linecap="round"/>
        <path d="M 34 18 L 38 24 L 43 31" stroke="${color}" stroke-width="0.72" fill="none" opacity="0.36" stroke-linecap="round"/>
        <path d="M 58 22 L 64 30 L 70 38 L 76 46" stroke="${color}" stroke-width="0.95" fill="none" opacity="0.45" stroke-linecap="round"/>
        <path d="M 49 24 L 54 30 L 59 37" stroke="${color}" stroke-width="0.68" fill="none" opacity="0.32" stroke-linecap="round"/>
        <path d="M 73 27 L 79 35 L 85 43 L 91 51" stroke="${color}" stroke-width="0.9" fill="none" opacity="0.42" stroke-linecap="round"/>
      `;
      
      // BRANCHE PRINCIPALE 5 - Presque verticale vers le bas (10-15 degrés)
      const branch5Main = `
        <path d="M 0 0 L 5 14 L 9 29 L 12 45 L 15 61 L 18 77 L 20 93" 
              stroke="${color}" stroke-width="1.7" fill="none" opacity="0.68" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      const branch5Subs = `
        <path d="M 5 14 L 10 21 L 15 29 L 20 37" stroke="${color}" stroke-width="1.05" fill="none" opacity="0.52" stroke-linecap="round"/>
        <path d="M 9 29 L 14 36 L 19 44 L 24 52" stroke="${color}" stroke-width="1.0" fill="none" opacity="0.49" stroke-linecap="round"/>
        <path d="M 10 21 L 14 27 L 18 34" stroke="${color}" stroke-width="0.75" fill="none" opacity="0.38" stroke-linecap="round"/>
        <path d="M 12 45 L 17 52 L 22 60 L 26 68" stroke="${color}" stroke-width="0.95" fill="none" opacity="0.46" stroke-linecap="round"/>
        <path d="M 14 36 L 18 42 L 22 49" stroke="${color}" stroke-width="0.7" fill="none" opacity="0.35" stroke-linecap="round"/>
        <path d="M 15 61 L 20 69 L 24 77 L 28 85" stroke="${color}" stroke-width="0.88" fill="none" opacity="0.43" stroke-linecap="round"/>
        <path d="M 17 52 L 21 58 L 25 65" stroke="${color}" stroke-width="0.65" fill="none" opacity="0.31" stroke-linecap="round"/>
      `;
      
      // BRANCHE PRINCIPALE 6 - Presque horizontale vers la droite (75-80 degrés)
      const branch6Main = `
        <path d="M 0 0 L 15 2 L 31 5 L 47 7 L 63 10 L 79 12 L 95 14" 
              stroke="${color}" stroke-width="1.65" fill="none" opacity="0.66" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      const branch6Subs = `
        <path d="M 15 2 L 20 8 L 25 15 L 30 22" stroke="${color}" stroke-width="1.0" fill="none" opacity="0.5" stroke-linecap="round"/>
        <path d="M 31 5 L 36 12 L 41 19 L 46 27" stroke="${color}" stroke-width="0.98" fill="none" opacity="0.48" stroke-linecap="round"/>
        <path d="M 20 8 L 24 14 L 28 20" stroke="${color}" stroke-width="0.72" fill="none" opacity="0.37" stroke-linecap="round"/>
        <path d="M 47 7 L 53 14 L 59 22 L 65 30" stroke="${color}" stroke-width="0.93" fill="none" opacity="0.45" stroke-linecap="round"/>
        <path d="M 36 12 L 40 18 L 44 25" stroke="${color}" stroke-width="0.68" fill="none" opacity="0.34" stroke-linecap="round"/>
        <path d="M 63 10 L 69 17 L 75 25 L 81 33" stroke="${color}" stroke-width="0.88" fill="none" opacity="0.42" stroke-linecap="round"/>
        <path d="M 53 14 L 58 20 L 63 27" stroke="${color}" stroke-width="0.63" fill="none" opacity="0.3" stroke-linecap="round"/>
        <path d="M 79 12 L 85 19 L 91 27 L 97 35" stroke="${color}" stroke-width="0.85" fill="none" opacity="0.4" stroke-linecap="round"/>
      `;
      
      // RAMIFICATIONS TERTIAIRES (plus fines, plus loin du centre)
      const tertiaryBranches = `
        <path d="M 12 24 L 15 29 L 18 35" stroke="${color}" stroke-width="0.6" fill="none" opacity="0.28" stroke-linecap="round"/>
        <path d="M 24 20 L 28 25 L 32 31" stroke="${color}" stroke-width="0.58" fill="none" opacity="0.27" stroke-linecap="round"/>
        <path d="M 18 34 L 21 40 L 24 46" stroke="${color}" stroke-width="0.55" fill="none" opacity="0.25" stroke-linecap="round"/>
        <path d="M 40 25 L 44 31 L 48 38" stroke="${color}" stroke-width="0.6" fill="none" opacity="0.28" stroke-linecap="round"/>
        <path d="M 28 44 L 32 50 L 36 57" stroke="${color}" stroke-width="0.57" fill="none" opacity="0.26" stroke-linecap="round"/>
        <path d="M 50 55 L 54 62 L 58 69" stroke="${color}" stroke-width="0.6" fill="none" opacity="0.28" stroke-linecap="round"/>
        <path d="M 68 24 L 72 30 L 76 37" stroke="${color}" stroke-width="0.58" fill="none" opacity="0.27" stroke-linecap="round"/>
        <path d="M 21 58 L 25 64 L 29 71" stroke="${color}" stroke-width="0.55" fill="none" opacity="0.25" stroke-linecap="round"/>
        <path d="M 85 19 L 89 25 L 93 32" stroke="${color}" stroke-width="0.6" fill="none" opacity="0.28" stroke-linecap="round"/>
      `;

      const crackPattern = branch1Main + branch1Subs + branch2Main + branch2Subs + 
                          branch3Main + branch3Subs + branch4Main + branch4Subs + 
                          branch5Main + branch5Subs + branch6Main + branch6Subs + 
                          tertiaryBranches;

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
             preserveAspectRatio="none"
             style={{ transform: transforms[position] }}>
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