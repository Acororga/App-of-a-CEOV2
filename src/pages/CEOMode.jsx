import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Circle, Phone, MessageSquare, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { differenceInMinutes, addMinutes, parseISO } from 'date-fns';
import { useLanguage } from '../components/LanguageProvider';

export default function CEOMode() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [duration, setDuration] = useState(() => {
    const lastDuration = localStorage.getItem('lastCEODuration');
    return lastDuration ? parseInt(lastDuration) : 30;
  });
  const [timeRemaining, setTimeRemaining] = useState(null);

  const { data: activeSession, refetch: refetchSession } = useQuery({
    queryKey: ['ceoModeSession'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const sessions = await base44.entities.CEOModeSession.filter({ 
        created_by: user.email
      }, '-created_date', 1);
      
      if (sessions.length > 0 && !sessions[0].end_time) {
        return sessions[0];
      }
      return null;
    },
    refetchInterval: 5000
  });

  useEffect(() => {
    if (activeSession) {
      const timer = setInterval(() => {
        const plannedEnd = parseISO(activeSession.planned_end_time);
        const remaining = differenceInMinutes(plannedEnd, new Date());
        
        if (remaining <= 0) {
          setTimeRemaining(0);
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [activeSession]);

  const startMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const plannedEnd = addMinutes(now, duration);
      
      localStorage.setItem('lastCEODuration', duration.toString());
      
      const user = await base44.auth.me();
      return await base44.entities.CEOModeSession.create({
        start_time: now.toISOString(),
        planned_end_time: plannedEnd.toISOString(),
        duration_minutes: duration,
        created_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ceoModeSession']);
      refetchSession();
    }
  });

  const endMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const plannedEnd = parseISO(activeSession.planned_end_time);
      const isEarlyExit = now < plannedEnd;

      await base44.entities.CEOModeSession.update(activeSession.id, {
        end_time: now.toISOString(),
        early_exit: isEarlyExit
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ceoModeSession']);
      navigate(createPageUrl('Home'));
    }
  });

  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  // Active CEO Mode - MONOCHROME, MINIMAL
  if (activeSession) {
    const canExit = timeRemaining !== null && timeRemaining <= 0;

    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Minimal texture */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.008]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px'
        }} />

        <div className="relative">
          <div className={`absolute inset-0 ${canExit ? 'bg-white/5' : 'bg-white/[0.02]'} rounded-full blur-[120px] transition-all duration-1000`} />
          <Circle className={`relative w-24 h-24 mb-16 transition-all duration-700 ${canExit ? 'text-white' : 'text-zinc-800 animate-pulse'}`} strokeWidth={1} />
        </div>
        
        <h1 className={`text-5xl font-black mb-12 tracking-tighter transition-all duration-700 ${
          canExit ? 'text-white' : 'text-zinc-700'
        }`}>
          CEO MODE
        </h1>
        
        <div className="mb-20">
          {canExit ? (
            <div className="text-center">
              <div className="text-3xl font-black text-white mb-3 tracking-tight animate-in fade-in duration-500">
                Complete
              </div>
              <div className="text-sm text-zinc-600 font-medium">You may exit</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="text-7xl font-black text-zinc-300 tracking-tighter tabular-nums">
                  {formatTime(timeRemaining || 0)}
                </div>
              </div>
              <div className="text-sm text-zinc-700 font-medium uppercase tracking-widest">Remaining</div>
            </div>
          )}
        </div>
        
        <div className="w-full max-w-xs mb-16">
          <div className="text-[10px] text-zinc-800 text-center mb-6 font-black uppercase tracking-widest">Available</div>
          <div className="flex justify-center gap-6">
            {[
              { icon: Phone, label: 'Phone' },
              { icon: MessageSquare, label: 'Messages' },
              { icon: CalendarIcon, label: 'Calendar' }
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center justify-center mb-2 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]">
                  <Icon className="w-6 h-6 text-zinc-700" strokeWidth={1.5} />
                </div>
                <div className="text-[9px] text-zinc-800 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={() => endMutation.mutate()}
          disabled={!canExit || endMutation.isPending}
          className={`px-10 py-4 rounded-2xl text-base font-black transition-all duration-300 ${
            canExit 
              ? 'bg-white text-black hover:bg-zinc-200 shadow-[0_12px_48px_rgba(255,255,255,0.15)] active:scale-95' 
              : 'bg-zinc-950 text-zinc-800 cursor-not-allowed border border-zinc-900 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]'
          }`}
        >
          {canExit ? 'EXIT' : 'LOCKED'}
        </Button>

        {!canExit && (
          <div className="mt-6 text-[10px] text-zinc-800 text-center max-w-xs font-medium leading-relaxed">
            Cannot exit early
          </div>
        )}
      </div>
    );
  }

  // Setup - Stark, clear
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6 pt-20 relative overflow-hidden">
      {/* Noise texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px'
      }} />

      <div className="max-w-md mx-auto relative">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-300 mb-8 transition-colors duration-150 active:scale-95">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">{t('home')}</span>
        </Link>

        <div className="text-center mb-16">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-white/5 rounded-full blur-[80px]" />
            <Circle className="relative w-20 h-20 text-zinc-700" strokeWidth={1} />
          </div>
          <h1 className="text-5xl font-black mb-4 tracking-tighter bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            {t('ceoMode')}
          </h1>
          <p className="text-zinc-600 font-medium text-sm max-w-xs mx-auto leading-relaxed">
            {t('maximumFocus')}. {t('onceActivatedCannotExit')}
          </p>
        </div>

        {/* Duration Selection - Clear, decisive */}
        <div className="mb-12">
          <div className="text-xs text-zinc-700 font-black mb-5 uppercase tracking-widest text-center">{t('duration')}</div>
          <div className="grid grid-cols-3 gap-3">
            {[30, 60, 90, 120, 180, 240].map(mins => (
              <button
                key={mins}
                onClick={() => setDuration(mins)}
                className={`p-5 rounded-2xl font-black text-lg transition-all duration-150 shadow-[0_8px_24px_rgba(0,0,0,0.4)] ${
                  duration === mins
                    ? 'bg-white text-black scale-105 shadow-[0_12px_32px_rgba(255,255,255,0.15)]'
                    : 'bg-zinc-900/60 border border-zinc-800/60 text-zinc-500 hover:border-zinc-700/60 active:scale-95'
                }`}
              >
                {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <div className="text-xs text-zinc-700 font-black mb-5 uppercase tracking-widest text-center">
            {t('approvedApps')} (3)
          </div>
          <div className="space-y-2">
            {[
              { icon: Phone, label: t('phone') },
              { icon: MessageSquare, label: t('messages') },
              { icon: CalendarIcon, label: t('calendar') }
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <Icon className="w-5 h-5 text-zinc-600" strokeWidth={2} />
                <span className="text-sm font-medium text-zinc-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-900/60 rounded-2xl p-5 mb-10 shadow-[inset_0_2px_12px_rgba(0,0,0,0.6)]">
          <div className="text-xs text-zinc-600 font-medium leading-relaxed">
            <span className="font-black text-zinc-500">⚠</span> {t('onceActivatedCannotExit')}
          </div>
        </div>

        <Button
          onClick={() => startMutation.mutate()}
          disabled={startMutation.isPending}
          className="w-full bg-white text-black hover:bg-zinc-200 h-14 text-base font-black rounded-2xl shadow-[0_12px_48px_rgba(255,255,255,0.12)] hover:shadow-[0_16px_64px_rgba(255,255,255,0.18)] active:scale-[0.97] transition-all duration-150"
        >
          {startMutation.isPending ? t('activating') : `${t('activate')} ${formatTime(duration)}`}
        </Button>
      </div>
    </div>
  );
}