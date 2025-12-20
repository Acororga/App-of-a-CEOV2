import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { startCEOModeSession, endCEOModeSession, getApprovedApps } from '../functions/businessLogic';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Circle, Phone, MessageSquare, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CEOMode() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

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

  const { data: approvedApps } = useQuery({
    queryKey: ['approvedApps'],
    queryFn: getApprovedApps
  });

  useEffect(() => {
    if (activeSessions) {
      setActiveSessionId(activeSessions.id);
    }
  }, [activeSessions]);

  const startMutation = useMutation({
    mutationFn: startCEOModeSession,
    onSuccess: (session) => {
      setActiveSessionId(session.id);
      queryClient.invalidateQueries(['ceoModeSessions']);
    }
  });

  const endMutation = useMutation({
    mutationFn: () => endCEOModeSession(activeSessionId),
    onSuccess: () => {
      setActiveSessionId(null);
      queryClient.invalidateQueries(['ceoModeSessions']);
      navigate(createPageUrl('Home'));
    }
  });

  const handleActivate = () => {
    startMutation.mutate();
  };

  const handleExit = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    endMutation.mutate();
  };

  // Active CEO Mode state
  if (activeSessionId) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        {showExitConfirm ? (
          <div className="max-w-md w-full">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-center mb-4">EXIT CEO MODE?</h2>
              <p className="text-gray-400 text-center mb-8">
                This will restore full access to all apps and features.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowExitConfirm(false)}
                  variant="outline"
                  className="flex-1 bg-transparent border-gray-700 hover:bg-gray-800"
                >
                  Stay in CEO Mode
                </Button>
                <Button
                  onClick={confirmExit}
                  className="flex-1 bg-white text-black hover:bg-gray-200"
                >
                  Exit
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <Circle className="w-20 h-20 mb-8 text-white" />
            <h1 className="text-3xl font-bold mb-12">CEO MODE ACTIVE</h1>
            
            <div className="w-full max-w-md mb-16">
              <div className="text-sm text-gray-500 text-center mb-6">AVAILABLE APPS</div>
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-2">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs text-gray-500">Phone</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-2">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs text-gray-500">Messages</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-2">
                    <CalendarIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs text-gray-500">Calendar</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleExit}
              className="px-6 py-3 rounded-lg border border-gray-800 hover:border-gray-700 text-sm font-medium transition-colors"
            >
              EXIT CEO MODE
            </button>
          </>
        )}
      </div>
    );
  }

  // Setup state
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-gray-400 mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Home</span>
        </Link>

        <div className="text-center mb-12">
          <Circle className="w-16 h-16 mx-auto mb-6 text-white" />
          <h1 className="text-3xl font-bold mb-4">CEO MODE</h1>
          <p className="text-gray-400">
            Ultimate focus. Zero distractions. Only approved apps accessible.
          </p>
        </div>

        <div className="mb-8">
          <div className="text-sm text-gray-500 mb-4">APPROVED APPS ({approvedApps?.length || 3})</div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-900">
              <Phone className="w-5 h-5 text-gray-400" />
              <span className="text-sm">Phone</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-900">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <span className="text-sm">Messages</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-900">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm">Calendar</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8">
          <div className="text-sm text-gray-400">
            ⚠️ CEO Mode blocks all other apps and websites until you explicitly exit.
          </div>
        </div>

        <div className="bg-gray-900 border border-yellow-900 rounded-xl p-4 mb-8">
          <div className="text-sm text-yellow-400">
            🔒 Platform Limitation: Full app blocking requires native OS permissions. This mode provides a minimal UI overlay.
          </div>
        </div>

        <Button
          onClick={handleActivate}
          disabled={startMutation.isPending}
          className="w-full bg-white text-black hover:bg-gray-200 h-12 text-base font-semibold"
        >
          {startMutation.isPending ? 'Activating...' : 'ACTIVATE CEO MODE'}
        </Button>
      </div>
    </div>
  );
}