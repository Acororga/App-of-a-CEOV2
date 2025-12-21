import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Circle, Phone, MessageSquare, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { differenceInMinutes, addMinutes, parseISO } from 'date-fns';

export default function CEOMode() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [duration, setDuration] = useState(30);
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
          // Session time is up, can exit now
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

  // Active CEO Mode
  if (activeSession) {
    const canExit = timeRemaining !== null && timeRemaining <= 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white flex flex-col items-center justify-center p-6">
        <Circle className="w-20 h-20 mb-8 text-white animate-pulse" />
        <h1 className="text-4xl font-bold mb-4">CEO MODE ACTIVE</h1>
        
        <div className="mb-12">
          {canExit ? (
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">Session Complete!</div>
              <div className="text-sm text-zinc-500">You can now exit CEO Mode</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-zinc-500" />
                <div className="text-3xl font-bold">{formatTime(timeRemaining || 0)}</div>
              </div>
              <div className="text-sm text-zinc-500">Time remaining</div>
            </div>
          )}
        </div>
        
        <div className="w-full max-w-md mb-12">
          <div className="text-sm text-zinc-500 text-center mb-6">AVAILABLE APPS</div>
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <div className="text-xs text-zinc-500">Phone</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div className="text-xs text-zinc-500">Messages</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2">
                <CalendarIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-xs text-zinc-500">Calendar</div>
            </div>
          </div>
        </div>

        <Button
          onClick={() => endMutation.mutate()}
          disabled={!canExit || endMutation.isPending}
          className={`px-8 py-3 rounded-xl text-base font-semibold transition-all ${
            canExit 
              ? 'bg-white text-black hover:bg-zinc-200' 
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
          }`}
        >
          {canExit ? 'EXIT CEO MODE' : 'LOCKED UNTIL TIME EXPIRES'}
        </Button>

        {!canExit && (
          <div className="mt-4 text-xs text-zinc-600 text-center max-w-md">
            CEO Mode cannot be exited early. Stay focused until your session time is complete.
          </div>
        )}
      </div>
    );
  }

  // Setup state
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6">
      <div className="max-w-md mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Home</span>
        </Link>

        <div className="text-center mb-12">
          <Circle className="w-16 h-16 mx-auto mb-6 text-white" />
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            CEO MODE
          </h1>
          <p className="text-zinc-400">
            Ultimate focus. Zero distractions. Cannot exit until time expires.
          </p>
        </div>

        {/* Duration Selection */}
        <div className="mb-8">
          <div className="text-sm text-zinc-500 font-medium mb-4">SELECT DURATION</div>
          <div className="grid grid-cols-3 gap-3">
            {[30, 60, 90, 120, 180, 240].map(mins => (
              <button
                key={mins}
                onClick={() => setDuration(mins)}
                className={`p-4 rounded-xl font-bold transition-all ${
                  duration === mins
                    ? 'bg-white text-black'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="text-sm text-zinc-500 mb-4">APPROVED APPS (3)</div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <Phone className="w-5 h-5 text-zinc-400" />
              <span className="text-sm">Phone</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <MessageSquare className="w-5 h-5 text-zinc-400" />
              <span className="text-sm">Messages</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <CalendarIcon className="w-5 h-5 text-zinc-400" />
              <span className="text-sm">Calendar</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 mb-8">
          <div className="text-sm text-zinc-400">
            ⚠️ <span className="font-semibold">Once activated, you cannot exit until the timer expires.</span> Choose your duration carefully.
          </div>
        </div>

        <Button
          onClick={() => startMutation.mutate()}
          disabled={startMutation.isPending}
          className="w-full bg-white text-black hover:bg-zinc-200 h-12 text-base font-semibold"
        >
          {startMutation.isPending ? 'Activating...' : `ACTIVATE FOR ${formatTime(duration)}`}
        </Button>
      </div>
    </div>
  );
}