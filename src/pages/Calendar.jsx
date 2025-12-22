import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft } from 'lucide-react';
import EventModal from '../components/calendar/EventModal';
import CalendarView from '../components/calendar/CalendarView';

export default function Calendar() {
  const queryClient = useQueryClient();
  const [showEventModal, setShowEventModal] = useState(false);
  const [prefilledEvent, setPrefilledEvent] = useState(null);
  
  const { data: events } = useQuery({
    queryKey: ['allEvents'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.CalendarEvent.filter({ created_by: user.email }, '-event_date');
    }
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
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Home</span>
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Calendar
          </h1>
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