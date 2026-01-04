import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { getOrCreateWinStreak } from '../functions/businessLogic';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Flame, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function WinStreak() {
  const { t } = useLanguage();
  const { data: streak } = useQuery({
    queryKey: ['winStreak'],
    queryFn: getOrCreateWinStreak
  });

  const { data: recentSessions } = useQuery({
    queryKey: ['recentSessions'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const sessions = await base44.entities.FocusSession.filter({ 
        created_by: user.email 
      }, '-created_date', 10);
      return sessions;
    }
  });

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-gray-400 mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Home</span>
        </Link>

        <div className="text-center mb-12">
          <Flame className="w-16 h-16 mx-auto mb-6 text-orange-500" />
          
          <div className="mb-8">
            <div className="text-sm text-gray-500 mb-2">CURRENT STREAK</div>
            <div className="text-7xl font-bold">{streak?.current_streak || 0}</div>
          </div>

          <div className="w-full h-px bg-gray-800 mb-8" />

          <div>
            <div className="text-sm text-gray-500 mb-2">LONGEST STREAK</div>
            <div className="text-4xl font-bold text-gray-400">{streak?.longest_streak || 0}</div>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">RECENT SESSIONS</h2>
        </div>

        <div className="space-y-2">
          {recentSessions?.map(session => (
            <div
              key={session.id}
              className={`p-4 rounded-lg border ${
                session.completed
                  ? 'bg-green-950 border-green-900'
                  : 'bg-red-950 border-red-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {session.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <div className="text-sm font-medium">
                      {format(new Date(session.created_date), 'MMM d, yyyy')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {session.actual_duration_minutes || session.duration_minutes} minutes
                    </div>
                  </div>
                </div>
                <div className={`text-sm font-semibold ${
                  session.completed ? 'text-green-400' : 'text-red-400'
                }`}>
                  {session.completed ? '+1' : 'RESET'}
                </div>
              </div>
            </div>
          ))}
          {(!recentSessions || recentSessions.length === 0) && (
            <div className="text-center py-12 text-gray-600">
              No sessions yet. Start your first focus session!
            </div>
          )}
        </div>

        {streak && streak.current_streak > 0 && streak.longest_streak > streak.current_streak && (
          <div className="mt-8 p-4 rounded-lg bg-gray-900 border border-gray-800">
            <div className="text-sm text-gray-400 text-center">
              💡 Keep going! {streak.longest_streak - streak.current_streak} more {streak.longest_streak - streak.current_streak === 1 ? 'day' : 'days'} to beat your record.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}