import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Circle, Phone, MessageSquare, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { differenceInSeconds, parseISO } from 'date-fns';

export default function CEOMode() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [duration, setDuration] = useState(60);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [activeSession, setActiveSession] = useState(null);

  const { data: activeSessions } = useQuery({
    queryKey: ['ceoModeSessions'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const sessions = await base44.entities.CEOModeSession.filter({ 
        created_by: user.email
      }, '-created_date', 1);
      
      if (sessions.length > 0 && !sessions[0].end_time) {
        return sessions[0];
      }
      return null;
    }
  });

  useEffect(() => {
    if (activeSessions) {
      setActiveSession(activeSessions);
    }
  }, [activeSessions]);

  useEffect(() => {
    if (activeSession) {
      const interval = setInterval(() => {
        const elapsed = differenceInSeconds(new Date(), parseISO(activeSession.start_time));
        const total = activeSession.duration_minutes * 60;
        const remaining = Math.max(0, total - elapsed);
        
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          endMutation.mutate(activeSession.id);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [activeSession]);

  const startMutation = useMutation({
    mutationFn: async (durationMins) => {
      const user = await base44.auth.me();
      return await base44.entities.CEOModeSession.create({
        start_time: new Date().toISOString(),
        duration_minutes: durationMins,
        created_by: user.email
      });
    },
    onSuccess: (session) => {
      setActiveSession(session);
      queryClient.invalidateQueries(['ceoModeSessions']);
    }
  });

  const endMutation = useMutation({
    mutationFn: async (sessionId) => {
      await base44.entities.CEOModeSession.update(sessionId, {
        end_time: new Date().toISOString()
      });
    },
    onSuccess: () => {
      setActiveSession(null);
      queryClient.invalidateQueries(['ceoModeSessions']);
      navigate(createPageUrl('Home'));
    }
  });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!activeSession) return 0;
    const total = activeSession.duration_minutes * 60;
    const elapsed = total - timeRemaining;
    return (elapsed / total) * 100;
  };

  // Session complete state
  if (endMutation.isSuccess) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-bold mb-4">SESSION COMPLETE</h1>
          <div className="text-gray-400 mb-8">CEO Mode has ended</div>
          <div className="text-sm text-gray-500">Returning to home...</div>
        </div>
      </div>
    );
  }

  // Active CEO Mode state - Cannot exit until timer ends
  if (activeSession && timeRemaining > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-zinc-950 text-white flex flex-col items-center justify-center p-6">
        <Circle className="w-20 h-20 mb-8 text-white" />
        <h1 className="text-3xl font-bold mb-4">CEO MODE ACTIVE</h1>
        <p className="text-zinc-500 mb-12 text-center">Stay focused. Timer must complete.</p>
        
        <div className="text-8xl font-bold mb-8 tabular-nums">
          {formatTime(timeRemaining)}
        </div>
        
        <div className="w-full max-w-md mb-8">
          <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-zinc-600 to-zinc-400 transition-all duration-1000"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>

        <div className="w-full max-w-md mb-16">
          <div className="text-sm text-zinc-600 text-center mb-6">AVAILABLE APPS</div>
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <div className="text-xs text-zinc-600">Phone</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div className="text-xs text-zinc-600">Messages</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2">
                <CalendarIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-xs text-zinc-600">Calendar</div>
            </div>
          </div>
        </div>

        <div className="text-center p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 max-w-md">
          <div className="text-sm text-zinc-500">
            🔒 CEO Mode cannot be exited until the timer completes. Stay focused.
          </div>
        </div>
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
          <p className="text-zinc-500">
            Ultimate focus. Zero distractions. Lock yourself in.
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-sm text-zinc-400 mb-4 font-medium">Select Duration</label>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[30, 60, 90, 120, 180, 240].map(mins => (
              <button
                key={mins}
                onClick={() => setDuration(mins)}
                className={`p-4 rounded-xl border transition-all ${
                  duration === mins
                    ? 'bg-zinc-700 border-zinc-600'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="text-2xl font-bold">{mins}</div>
                <div className="text-xs text-zinc-500">min</div>
              </button>
            ))}
          </div>
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 pl-12 text-white focus:outline-none focus:border-zinc-600"
              placeholder="Custom duration"
            />
          </div>
        </div>

        <div className="mb-8">
          <div className="text-sm text-zinc-500 mb-4">APPROVED APPS (3)</div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <Phone className="w-5 h-5 text-zinc-600" />
              <span className="text-sm">Phone</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <MessageSquare className="w-5 h-5 text-zinc-600" />
              <span className="text-sm">Messages</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <CalendarIcon className="w-5 h-5 text-zinc-600" />
              <span className="text-sm">Calendar</span>
            </div>
          </div>
        </div>

        <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 mb-8">
          <div className="text-sm text-red-400">
            ⚠️ <span className="font-semibold">WARNING:</span> CEO Mode cannot be exited until the timer completes. You will be locked in for the full duration.
          </div>
        </div>

        <Button
          onClick={() => startMutation.mutate(duration)}
          disabled={startMutation.isPending}
          className="w-full bg-white text-black hover:bg-zinc-200 h-12 text-base font-semibold"
        >
          {startMutation.isPending ? 'Activating...' : `🔒 ACTIVATE CEO MODE (${duration}m)`}
        </Button>
      </div>
    </div>
  );
}