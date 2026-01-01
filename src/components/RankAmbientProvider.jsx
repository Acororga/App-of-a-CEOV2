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
      
      // Craquelures organiques COURBES complexes partant du coin (0,0)
      // Utilisation de courbes de Bézier cubiques (C) pour des formes arrondies naturelles
      
      // BRANCHE PRINCIPALE 1 - Courbe douce vers le bas
      const branch1Main = `
        <path d="M 0 0 C 1 6, 2 10, 3 15 S 4 22, 5 28 S 6 36, 7 44 S 8 54, 9 64 S 10 75, 11 86 S 11.5 92, 12 98" 
              stroke="${color}" stroke-width="2.4" fill="none" opacity="0.82" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      const branch1Subs = `
        <path d="M 3 15 C 5 18, 7 20, 9 23 S 12 26, 15 30 S 18 34, 21 38" 
              stroke="${color}" stroke-width="1.35" fill="none" opacity="0.62" stroke-linecap="round"/>
        <path d="M 5 28 C 7 32, 9 35, 11 39 S 14 44, 17 49 S 20 54, 23 59" 
              stroke="${color}" stroke-width="1.25" fill="none" opacity="0.58" stroke-linecap="round"/>
        <path d="M 9 23 C 11 26, 12 28, 14 31 S 16 35, 18 39" 
              stroke="${color}" stroke-width="0.95" fill="none" opacity="0.47" stroke-linecap="round"/>
        <path d="M 7 44 C 9 48, 11 51, 13 55 S 16 60, 19 65 S 22 70, 25 75" 
              stroke="${color}" stroke-width="1.15" fill="none" opacity="0.54" stroke-linecap="round"/>
        <path d="M 11 39 C 13 42, 14 45, 16 48 S 18 52, 20 56" 
              stroke="${color}" stroke-width="0.85" fill="none" opacity="0.42" stroke-linecap="round"/>
        <path d="M 9 64 C 11 68, 13 72, 15 76 S 18 81, 21 86 S 24 91, 27 96" 
              stroke="${color}" stroke-width="1.05" fill="none" opacity="0.5" stroke-linecap="round"/>
        <path d="M 13 55 C 15 59, 17 62, 19 66 S 21 70, 23 74" 
              stroke="${color}" stroke-width="0.78" fill="none" opacity="0.39" stroke-linecap="round"/>
        <path d="M 15 76 C 17 80, 19 84, 21 88 S 23 92, 25 96" 
              stroke="${color}" stroke-width="0.72" fill="none" opacity="0.36" stroke-linecap="round"/>
        <path d="M 17 49 C 19 52, 20 55, 22 58 S 24 62, 26 66" 
              stroke="${color}" stroke-width="0.68" fill="none" opacity="0.34" stroke-linecap="round"/>
      `;
      
      // BRANCHE PRINCIPALE 2 - Courbe diagonale douce (environ 45°)
      const branch2Main = `
        <path d="M 0 0 C 4 4, 7 7, 11 11 S 17 17, 24 24 S 32 32, 41 41 S 51 51, 62 62 S 73 73, 85 85 S 92 92, 98 98" 
              stroke="${color}" stroke-width="2.1" fill="none" opacity="0.78" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      const branch2Subs = `
        <path d="M 11 11 C 13 15, 15 18, 17 22 S 20 27, 23 32 S 26 37, 29 42" 
              stroke="${color}" stroke-width="1.25" fill="none" opacity="0.6" stroke-linecap="round"/>
        <path d="M 24 24 C 27 28, 30 32, 33 36 S 37 42, 41 47 S 45 53, 49 59" 
              stroke="${color}" stroke-width="1.2" fill="none" opacity="0.57" stroke-linecap="round"/>
        <path d="M 17 22 C 19 25, 21 28, 23 31 S 25 35, 27 39" 
              stroke="${color}" stroke-width="0.88" fill="none" opacity="0.44" stroke-linecap="round"/>
        <path d="M 41 41 C 45 45, 48 49, 52 53 S 57 59, 62 65 S 67 71, 72 77" 
              stroke="${color}" stroke-width="1.15" fill="none" opacity="0.52" stroke-linecap="round"/>
        <path d="M 33 36 C 36 40, 38 43, 41 47 S 44 52, 47 57" 
              stroke="${color}" stroke-width="0.82" fill="none" opacity="0.41" stroke-linecap="round"/>
        <path d="M 62 62 C 66 67, 70 72, 74 77 S 79 83, 84 89 S 89 94, 94 99" 
              stroke="${color}" stroke-width="1.0" fill="none" opacity="0.48" stroke-linecap="round"/>
        <path d="M 52 53 C 55 57, 58 61, 61 65 S 64 70, 67 75" 
              stroke="${color}" stroke-width="0.77" fill="none" opacity="0.38" stroke-linecap="round"/>
        <path d="M 74 77 C 77 81, 80 85, 83 89 S 87 94, 91 99" 
              stroke="${color}" stroke-width="0.97" fill="none" opacity="0.46" stroke-linecap="round"/>
        <path d="M 45 47 C 48 51, 51 54, 54 58 S 57 63, 60 68" 
              stroke="${color}" stroke-width="0.72" fill="none" opacity="0.35" stroke-linecap="round"/>
        <path d="M 67 65 C 70 69, 73 73, 76 77 S 79 82, 82 87" 
              stroke="${color}" stroke-width="0.68" fill="none" opacity="0.33" stroke-linecap="round"/>
      `;
      
      // BRANCHE PRINCIPALE 3 - Courbe presque horizontale vers la droite
      const branch3Main = `
        <path d="M 0 0 C 6 1, 11 2, 17 3 S 27 5, 38 7 S 51 9, 65 11 S 80 13, 94 15" 
              stroke="${color}" stroke-width="1.95" fill="none" opacity="0.74" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      const branch3Subs = `
        <path d="M 17 3 C 20 7, 22 11, 25 16 S 28 22, 31 28 S 34 35, 37 41" 
              stroke="${color}" stroke-width="1.18" fill="none" opacity="0.58" stroke-linecap="round"/>
        <path d="M 38 7 C 41 12, 44 17, 47 23 S 51 30, 55 37 S 59 44, 63 51" 
              stroke="${color}" stroke-width="1.12" fill="none" opacity="0.55" stroke-linecap="round"/>
        <path d="M 25 16 C 27 20, 29 24, 31 28 S 34 33, 36 38" 
              stroke="${color}" stroke-width="0.82" fill="none" opacity="0.41" stroke-linecap="round"/>
        <path d="M 65 11 C 69 17, 72 23, 76 30 S 80 38, 84 46 S 88 54, 92 62" 
              stroke="${color}" stroke-width="1.08" fill="none" opacity="0.51" stroke-linecap="round"/>
        <path d="M 47 23 C 50 28, 52 32, 55 37 S 58 43, 61 49" 
              stroke="${color}" stroke-width="0.76" fill="none" opacity="0.38" stroke-linecap="round"/>
        <path d="M 80 13 C 84 19, 87 26, 91 33 S 95 41, 99 49" 
              stroke="${color}" stroke-width="1.02" fill="none" opacity="0.48" stroke-linecap="round"/>
        <path d="M 69 17 C 72 22, 75 27, 78 32 S 81 38, 84 44" 
              stroke="${color}" stroke-width="0.71" fill="none" opacity="0.35" stroke-linecap="round"/>
        <path d="M 91 33 C 94 38, 96 43, 98 48" 
              stroke="${color}" stroke-width="0.66" fill="none" opacity="0.32" stroke-linecap="round"/>
      `;
      
      // BRANCHE PRINCIPALE 4 - Courbe intermédiaire (environ 25°)
      const branch4Main = `
        <path d="M 0 0 C 6 2, 11 4, 17 7 S 26 11, 37 16 S 50 22, 64 28 S 79 35, 94 42" 
              stroke="${color}" stroke-width="1.85" fill="none" opacity="0.72" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      const branch4Subs = `
        <path d="M 17 7 C 20 11, 23 16, 26 21 S 30 27, 34 33 S 38 40, 42 47" 
              stroke="${color}" stroke-width="1.12" fill="none" opacity="0.56" stroke-linecap="round"/>
        <path d="M 37 16 C 41 21, 44 26, 48 32 S 53 39, 58 46 S 63 53, 68 60" 
              stroke="${color}" stroke-width="1.08" fill="none" opacity="0.53" stroke-linecap="round"/>
        <path d="M 26 21 C 29 25, 31 29, 34 34 S 37 40, 40 46" 
              stroke="${color}" stroke-width="0.79" fill="none" opacity="0.4" stroke-linecap="round"/>
        <path d="M 64 28 C 68 34, 72 41, 76 48 S 81 56, 86 64 S 91 72, 96 80" 
              stroke="${color}" stroke-width="1.03" fill="none" opacity="0.5" stroke-linecap="round"/>
        <path d="M 48 32 C 51 37, 54 42, 57 48 S 61 55, 65 62" 
              stroke="${color}" stroke-width="0.73" fill="none" opacity="0.37" stroke-linecap="round"/>
        <path d="M 79 35 C 83 42, 87 49, 91 57 S 95 66, 99 75" 
              stroke="${color}" stroke-width="0.92" fill="none" opacity="0.44" stroke-linecap="round"/>
        <path d="M 68 41 C 72 47, 75 53, 79 60 S 83 68, 87 76" 
              stroke="${color}" stroke-width="0.69" fill="none" opacity="0.34" stroke-linecap="round"/>
      `;
      
      // BRANCHE PRINCIPALE 5 - Courbe presque verticale (environ 10°)
      const branch5Main = `
        <path d="M 0 0 C 2 7, 3 13, 5 20 S 7 31, 9 43 S 11 57, 13 72 S 15 87, 17 100" 
              stroke="${color}" stroke-width="1.75" fill="none" opacity="0.7" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      const branch5Subs = `
        <path d="M 5 20 C 8 25, 11 30, 14 36 S 18 43, 22 50 S 26 57, 30 64" 
              stroke="${color}" stroke-width="1.08" fill="none" opacity="0.54" stroke-linecap="round"/>
        <path d="M 9 43 C 12 49, 15 55, 18 62 S 22 70, 26 78 S 30 86, 34 94" 
              stroke="${color}" stroke-width="1.02" fill="none" opacity="0.51" stroke-linecap="round"/>
        <path d="M 14 36 C 17 41, 19 45, 22 50 S 25 56, 28 62" 
              stroke="${color}" stroke-width="0.76" fill="none" opacity="0.38" stroke-linecap="round"/>
        <path d="M 13 72 C 16 78, 19 84, 22 91 S 26 98, 30 105" 
              stroke="${color}" stroke-width="0.97" fill="none" opacity="0.47" stroke-linecap="round"/>
        <path d="M 18 62 C 21 67, 23 72, 26 78 S 29 85, 32 92" 
              stroke="${color}" stroke-width="0.71" fill="none" opacity="0.36" stroke-linecap="round"/>
        <path d="M 22 50 C 25 55, 27 60, 30 66 S 33 73, 36 80" 
              stroke="${color}" stroke-width="0.89" fill="none" opacity="0.43" stroke-linecap="round"/>
        <path d="M 26 78 C 29 83, 31 88, 34 94 S 37 100, 40 106" 
              stroke="${color}" stroke-width="0.66" fill="none" opacity="0.32" stroke-linecap="round"/>
      `;
      
      // BRANCHE PRINCIPALE 6 - Courbe très horizontale (environ 80°)
      const branch6Main = `
        <path d="M 0 0 C 8 1, 14 2, 22 3 S 35 5, 50 7 S 68 9, 86 11 S 98 12, 110 13" 
              stroke="${color}" stroke-width="1.68" fill="none" opacity="0.68" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      const branch6Subs = `
        <path d="M 22 3 C 25 8, 28 13, 31 19 S 35 26, 39 33 S 43 41, 47 49" 
              stroke="${color}" stroke-width="1.02" fill="none" opacity="0.52" stroke-linecap="round"/>
        <path d="M 50 7 C 54 13, 57 19, 61 26 S 66 34, 71 42 S 76 51, 81 60" 
              stroke="${color}" stroke-width="0.99" fill="none" opacity="0.49" stroke-linecap="round"/>
        <path d="M 31 19 C 34 24, 36 28, 39 33 S 42 39, 45 45" 
              stroke="${color}" stroke-width="0.73" fill="none" opacity="0.37" stroke-linecap="round"/>
        <path d="M 86 11 C 90 17, 94 24, 98 31 S 103 40, 108 49" 
              stroke="${color}" stroke-width="0.94" fill="none" opacity="0.46" stroke-linecap="round"/>
        <path d="M 61 26 C 64 31, 67 37, 70 43 S 74 50, 78 57" 
              stroke="${color}" stroke-width="0.68" fill="none" opacity="0.34" stroke-linecap="round"/>
        <path d="M 90 17 C 94 23, 97 29, 101 36 S 105 44, 109 52" 
              stroke="${color}" stroke-width="0.86" fill="none" opacity="0.42" stroke-linecap="round"/>
        <path d="M 71 42 C 74 47, 77 53, 80 59 S 84 66, 88 73" 
              stroke="${color}" stroke-width="0.63" fill="none" opacity="0.31" stroke-linecap="round"/>
      `;
      
      // RAMIFICATIONS TERTIAIRES avec courbes
      const tertiaryBranches = `
        <path d="M 15 30 C 17 34, 19 38, 21 43 S 24 49, 27 55" stroke="${color}" stroke-width="0.62" fill="none" opacity="0.29" stroke-linecap="round"/>
        <path d="M 29 28 C 32 32, 34 36, 37 41 S 40 47, 43 53" stroke="${color}" stroke-width="0.6" fill="none" opacity="0.28" stroke-linecap="round"/>
        <path d="M 23 42 C 25 47, 27 51, 30 56 S 33 62, 36 68" stroke="${color}" stroke-width="0.57" fill="none" opacity="0.26" stroke-linecap="round"/>
        <path d="M 47 37 C 50 42, 53 47, 56 53 S 60 60, 64 67" stroke="${color}" stroke-width="0.62" fill="none" opacity="0.29" stroke-linecap="round"/>
        <path d="M 36 56 C 39 61, 41 66, 44 72 S 48 79, 52 86" stroke="${color}" stroke-width="0.59" fill="none" opacity="0.27" stroke-linecap="round"/>
        <path d="M 60 68 C 63 74, 66 80, 69 87 S 73 95, 77 102" stroke="${color}" stroke-width="0.62" fill="none" opacity="0.29" stroke-linecap="round"/>
        <path d="M 78 32 C 81 37, 84 42, 87 48 S 91 55, 95 62" stroke="${color}" stroke-width="0.6" fill="none" opacity="0.28" stroke-linecap="round"/>
        <path d="M 28 70 C 31 75, 33 80, 36 86 S 40 93, 44 100" stroke="${color}" stroke-width="0.57" fill="none" opacity="0.26" stroke-linecap="round"/>
        <path d="M 94 28 C 97 33, 99 38, 102 44" stroke="${color}" stroke-width="0.62" fill="none" opacity="0.29" stroke-linecap="round"/>
        <path d="M 54 58 C 57 63, 59 68, 62 74 S 66 81, 70 88" stroke="${color}" stroke-width="0.59" fill="none" opacity="0.27" stroke-linecap="round"/>
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
             viewBox="0 0 120 120" 
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