import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useLanguage } from '../LanguageProvider';
import { X } from 'lucide-react';

export default function NormalModeBlockingScreen({ 
  entityName, 
  timeSpentToday = 0, 
  onClose 
}) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleGoToPriorities = () => {
    navigate(createPageUrl('Dashboard'));
    if (onClose) onClose();
  };

  const handleComeLater = () => {
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-6 overflow-hidden">
      {/* Noise texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px'
      }} />

      {/* Ambient gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-transparent rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-md w-full">
        {/* Visual Content - Aspirational Image */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-purple-500/10 rounded-[32px] blur-2xl" />
          <div className="relative aspect-[4/3] rounded-[32px] bg-gradient-to-br from-zinc-900/60 to-zinc-950/60 border border-zinc-800/50 overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" 
              alt="Focused work"
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black mb-3 bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent tracking-tight">
            Pause for a second.
          </h1>
          <p className="text-base text-zinc-400 mb-6 font-medium">
            You're scrolling on autopilot.
          </p>
          
          {/* Awareness line */}
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/10 rounded-2xl blur-xl" />
            <div className="relative px-5 py-3 rounded-2xl bg-zinc-900/60 border border-orange-500/30">
              <p className="text-sm text-orange-300/90">
                You've already spent <span className="font-black">{timeSpentToday} minutes</span> on {entityName} today.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Primary - Go to priorities */}
          <button
            onClick={handleGoToPriorities}
            className="w-full relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="relative py-5 rounded-2xl bg-gradient-to-br from-white via-zinc-100 to-white text-black font-black text-base tracking-tight shadow-[0_12px_48px_rgba(255,255,255,0.15)] hover:shadow-[0_16px_64px_rgba(255,255,255,0.25)] active:scale-[0.97] transition-all duration-150">
              → Open my to-do list
            </div>
          </button>

          {/* Secondary - Close */}
          <button
            onClick={handleComeLater}
            className="w-full py-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-300 font-semibold text-sm active:scale-[0.98] transition-all duration-150"
          >
            I'll come back later
          </button>
        </div>

        {/* Subtle hint */}
        <p className="text-center text-xs text-zinc-700 mt-6 font-medium">
          To add time, open the app and go to Screen Time settings
        </p>
      </div>
    </div>
  );
}