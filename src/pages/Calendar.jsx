import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft } from 'lucide-react';
import EventModal from '../components/calendar/EventModal';
import CalendarView from '../components/calendar/CalendarView';
import { useLanguage } from '../components/LanguageProvider';

export default function Calendar() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [showEventModal, setShowEventModal] = useState(false);
  const [prefilledEvent, setPrefilledEvent] = useState(null);
  
  const { data: events } = useQuery({
    queryKey: ['allEvents'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.CalendarEvent.filter({ created_by: user.email }, '-event_date');
    },
    initialData: []
  });

  const createEventMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return await base44.entities.CalendarEvent.create({
        ...data,
        created_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allEvents']);
      setShowEventModal(false);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6 pt-20 relative overflow-hidden">
      {/* Noise texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px'
      }} />

      <div className="max-w-4xl mx-auto relative">
        <div className="flex items-center justify-between mb-6">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-300 transition-colors duration-150 active:scale-95">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{t('home')}</span>
          </Link>
          
          <h1 className="text-2xl font-black bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent tracking-tight">
            {t('schedule')}
          </h1>
          
          <div className="w-20" />
        </div>

        <CalendarView
          events={events}
          onNewEvent={() => {
            setPrefilledEvent(null);
            setShowEventModal(true);
          }}
          onTimeClick={(date, time) => {
            setPrefilledEvent({ event_date: date, event_time: time });
            setShowEventModal(true);
          }}
        />

        <EventModal
          open={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setPrefilledEvent(null);
          }}
          onSubmit={(data) => createEventMutation.mutate(data)}
          initialData={prefilledEvent}
        />
      </div>
    </div>
  );
}