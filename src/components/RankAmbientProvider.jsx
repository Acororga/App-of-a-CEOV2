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
        accentRgb: '217, 119, 6',
        topRightOrnament: (
          <svg className="absolute top-0 right-0 w-[400px] h-[400px] opacity-40 pointer-events-none" viewBox="0 0 400 400">
            <defs>
              <filter id="bronze-shadow">
                <feGaussianBlur in="SourceAlpha" stdDeviation="8"/>
                <feOffset dx="4" dy="4" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.5"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path d="M 400 0 Q 320 40 280 100 Q 240 160 260 220 Q 280 280 240 320 Q 200 360 140 350 Q 80 340 40 300 L 0 260 L 0 0 Z" 
                  fill="url(#bronze-gradient)" filter="url(#bronze-shadow)"/>
            <defs>
              <linearGradient id="bronze-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b45309" stopOpacity="0.8"/>
                <stop offset="50%" stopColor="#d97706" stopOpacity="0.7"/>
                <stop offset="100%" stopColor="#92400e" stopOpacity="0.6"/>
              </linearGradient>
            </defs>
          </svg>
        ),
        bottomLeftOrnament: (
          <svg className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-40 pointer-events-none" viewBox="0 0 400 400">
            <path d="M 0 400 Q 60 380 100 320 Q 140 260 120 200 Q 100 140 140 100 Q 180 60 240 80 Q 300 100 340 140 L 380 180 L 400 400 L 0 400 Z" 
                  fill="url(#bronze-gradient-bottom)" filter="url(#bronze-shadow)"/>
            <defs>
              <linearGradient id="bronze-gradient-bottom" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#92400e" stopOpacity="0.6"/>
                <stop offset="50%" stopColor="#d97706" stopOpacity="0.7"/>
                <stop offset="100%" stopColor="#b45309" stopOpacity="0.8"/>
              </linearGradient>
            </defs>
          </svg>
        )
      },
      2: { // Silver
        gradient: 'from-gray-500/[0.03] via-gray-400/[0.02] to-gray-500/[0.03]',
        accent: 'gray-400',
        accentRgb: '156, 163, 175',
        topRightOrnament: (
          <svg className="absolute top-0 right-0 w-[420px] h-[420px] opacity-50 pointer-events-none" viewBox="0 0 420 420">
            <defs>
              <filter id="silver-shadow">
                <feGaussianBlur in="SourceAlpha" stdDeviation="12"/>
                <feOffset dx="2" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.4"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path d="M 420 0 Q 340 30 290 90 Q 240 150 250 210 Q 260 270 220 320 Q 180 370 120 380 Q 60 390 10 350 L 0 310 L 0 0 Z" 
                  fill="url(#silver-gradient)" filter="url(#silver-shadow)"/>
            <defs>
              <linearGradient id="silver-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e5e7eb" stopOpacity="0.8"/>
                <stop offset="50%" stopColor="#d1d5db" stopOpacity="0.75"/>
                <stop offset="100%" stopColor="#9ca3af" stopOpacity="0.7"/>
              </linearGradient>
            </defs>
          </svg>
        ),
        bottomLeftOrnament: (
          <svg className="absolute bottom-0 left-0 w-[420px] h-[420px] opacity-50 pointer-events-none" viewBox="0 0 420 420">
            <path d="M 0 420 Q 70 400 120 350 Q 170 300 150 240 Q 130 180 170 130 Q 210 80 270 90 Q 330 100 380 140 L 420 190 L 420 420 L 0 420 Z" 
                  fill="url(#silver-gradient-bottom)" filter="url(#silver-shadow)"/>
            <defs>
              <linearGradient id="silver-gradient-bottom" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9ca3af" stopOpacity="0.7"/>
                <stop offset="50%" stopColor="#d1d5db" stopOpacity="0.75"/>
                <stop offset="100%" stopColor="#e5e7eb" stopOpacity="0.8"/>
              </linearGradient>
            </defs>
          </svg>
        )
      },
      3: { // Gold
        gradient: 'from-yellow-700/[0.05] via-yellow-600/[0.04] to-yellow-700/[0.05]',
        accent: 'yellow-600',
        accentRgb: '202, 138, 4',
        topRightOrnament: (
          <svg className="absolute top-0 right-0 w-[450px] h-[450px] opacity-55 pointer-events-none" viewBox="0 0 450 450">
            <defs>
              <filter id="gold-shadow">
                <feGaussianBlur in="SourceAlpha" stdDeviation="10"/>
                <feOffset dx="3" dy="3" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.6"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path d="M 450 0 Q 360 50 310 120 Q 260 190 280 260 Q 300 330 250 380 Q 200 430 130 420 Q 60 410 15 360 L 0 310 L 0 0 Z" 
                  fill="url(#gold-gradient)" filter="url(#gold-shadow)"/>
            <defs>
              <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.85"/>
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.75"/>
              </linearGradient>
            </defs>
          </svg>
        ),
        bottomLeftOrnament: (
          <svg className="absolute bottom-0 left-0 w-[450px] h-[450px] opacity-55 pointer-events-none" viewBox="0 0 450 450">
            <path d="M 0 450 Q 80 420 140 360 Q 200 300 180 230 Q 160 160 200 110 Q 240 60 300 80 Q 360 100 410 150 L 450 210 L 450 450 L 0 450 Z" 
                  fill="url(#gold-gradient-bottom)" filter="url(#gold-shadow)"/>
            <defs>
              <linearGradient id="gold-gradient-bottom" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d97706" stopOpacity="0.75"/>
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.85"/>
              </linearGradient>
            </defs>
          </svg>
        )
      },
      4: { // Platinum
        gradient: 'from-cyan-900/[0.04] via-slate-800/[0.03] to-cyan-900/[0.04]',
        accent: 'cyan-500',
        accentRgb: '6, 182, 212',
        topRightOrnament: (
          <svg className="absolute top-0 right-0 w-[440px] h-[440px] opacity-45 pointer-events-none" viewBox="0 0 440 440">
            <defs>
              <filter id="platinum-shadow">
                <feGaussianBlur in="SourceAlpha" stdDeviation="14"/>
                <feOffset dx="1" dy="1" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.35"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path d="M 440 0 Q 350 40 300 110 Q 250 180 270 240 Q 290 300 240 350 Q 190 400 120 390 Q 50 380 10 330 L 0 280 L 0 0 Z" 
                  fill="url(#platinum-gradient)" filter="url(#platinum-shadow)"/>
            <defs>
              <linearGradient id="platinum-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#cffafe" stopOpacity="0.7"/>
                <stop offset="50%" stopColor="#a5f3fc" stopOpacity="0.65"/>
                <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.6"/>
              </linearGradient>
            </defs>
          </svg>
        ),
        bottomLeftOrnament: (
          <svg className="absolute bottom-0 left-0 w-[440px] h-[440px] opacity-45 pointer-events-none" viewBox="0 0 440 440">
            <path d="M 0 440 Q 75 410 130 350 Q 185 290 165 220 Q 145 150 185 100 Q 225 50 285 70 Q 345 90 395 140 L 440 200 L 440 440 L 0 440 Z" 
                  fill="url(#platinum-gradient-bottom)" filter="url(#platinum-shadow)"/>
            <defs>
              <linearGradient id="platinum-gradient-bottom" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.6"/>
                <stop offset="50%" stopColor="#a5f3fc" stopOpacity="0.65"/>
                <stop offset="100%" stopColor="#cffafe" stopOpacity="0.7"/>
              </linearGradient>
            </defs>
          </svg>
        )
      },
      5: { // Diamond
        gradient: 'from-blue-900/[0.05] via-cyan-900/[0.04] to-blue-900/[0.05]',
        accent: 'blue-400',
        accentRgb: '96, 165, 250',
        topRightOrnament: (
          <svg className="absolute top-0 right-0 w-[460px] h-[460px] opacity-50 pointer-events-none" viewBox="0 0 460 460">
            <defs>
              <filter id="diamond-shadow">
                <feGaussianBlur in="SourceAlpha" stdDeviation="16"/>
                <feOffset dx="0" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.45"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path d="M 460 0 L 380 60 L 320 140 L 290 220 L 270 300 L 230 360 L 160 410 L 80 440 L 20 420 L 0 380 L 0 0 Z" 
                  fill="url(#diamond-gradient)" filter="url(#diamond-shadow)"/>
            <defs>
              <linearGradient id="diamond-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.75"/>
                <stop offset="30%" stopColor="#bfdbfe" stopOpacity="0.7"/>
                <stop offset="70%" stopColor="#93c5fd" stopOpacity="0.65"/>
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.6"/>
              </linearGradient>
            </defs>
          </svg>
        ),
        bottomLeftOrnament: (
          <svg className="absolute bottom-0 left-0 w-[460px] h-[460px] opacity-50 pointer-events-none" viewBox="0 0 460 460">
            <path d="M 0 460 L 70 420 L 140 370 L 190 310 L 230 240 L 260 170 L 300 110 L 350 60 L 410 20 L 440 0 L 460 40 L 460 460 L 0 460 Z" 
                  fill="url(#diamond-gradient-bottom)" filter="url(#diamond-shadow)"/>
            <defs>
              <linearGradient id="diamond-gradient-bottom" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6"/>
                <stop offset="30%" stopColor="#93c5fd" stopOpacity="0.65"/>
                <stop offset="70%" stopColor="#bfdbfe" stopOpacity="0.7"/>
                <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.75"/>
              </linearGradient>
            </defs>
          </svg>
        )
      },
      6: { // Batman
        gradient: 'from-black/[0.06] via-zinc-950/[0.05] to-black/[0.06]',
        accent: 'zinc-700',
        accentRgb: '63, 63, 70',
        topRightOrnament: (
          <svg className="absolute top-0 right-0 w-[480px] h-[480px] opacity-60 pointer-events-none" viewBox="0 0 480 480">
            <defs>
              <filter id="batman-shadow">
                <feGaussianBlur in="SourceAlpha" stdDeviation="20"/>
                <feOffset dx="0" dy="4" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.7"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path d="M 480 0 Q 390 60 330 140 Q 270 220 290 300 Q 310 380 250 440 Q 190 500 110 480 Q 30 460 0 400 L 0 0 Z" 
                  fill="url(#batman-gradient)" filter="url(#batman-shadow)"/>
            <defs>
              <linearGradient id="batman-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#18181b" stopOpacity="0.95"/>
                <stop offset="50%" stopColor="#0a0a0a" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="#000000" stopOpacity="0.85"/>
              </linearGradient>
            </defs>
          </svg>
        ),
        bottomLeftOrnament: (
          <svg className="absolute bottom-0 left-0 w-[480px] h-[480px] opacity-60 pointer-events-none" viewBox="0 0 480 480">
            <path d="M 0 480 Q 90 440 150 370 Q 210 300 190 220 Q 170 140 220 80 Q 270 20 350 40 Q 430 60 480 120 L 480 480 L 0 480 Z" 
                  fill="url(#batman-gradient-bottom)" filter="url(#batman-shadow)"/>
            <defs>
              <linearGradient id="batman-gradient-bottom" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.85"/>
                <stop offset="50%" stopColor="#0a0a0a" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="#18181b" stopOpacity="0.95"/>
              </linearGradient>
            </defs>
          </svg>
        )
      },
      7: { // CEO
        gradient: 'from-black via-black to-black',
        accent: 'yellow-500',
        accentRgb: '234, 179, 8',
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