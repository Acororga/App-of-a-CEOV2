import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUpcomingEvents } from '../functions/businessLogic';
import { base44 } from '@/api/base44Client';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EventModal from '../components/calendar/EventModal';

export default function Calendar() {
  const queryClient = useQueryClient();
  const [showEventModal, setShowEventModal] = useState(false);
  
  const { data: events } = useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: () => getUpcomingEvents(30)
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
      queryClient.invalidateQueries(['upcomingEvents']);
    }
  });

  const getTimeUntil = (eventDate, eventTime) => {
    const eventDateTime = parseISO(`${eventDate}T${eventTime}`);
    const mins = differenceInMinutes(eventDateTime, new Date());
    
    if (mins < 0) return 'Past';
    if (mins < 60) return `${mins}m`;
    
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    
    if (hours < 24) return `${hours}h ${remainingMins}m`;
    
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  // Group events by date
  const groupedEvents = {};
  events?.forEach(event => {
    if (!groupedEvents[event.event_date]) {
      groupedEvents[event.event_date] = [];
    }
    groupedEvents[event.event_date].push(event);
  });

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-gray-400 mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Home</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Schedule</h1>
          <p className="text-sm text-gray-400">Upcoming events</p>
        </div>

        <div className="space-y-6 mb-6">
          {Object.keys(groupedEvents).sort().map(date => (
            <div key={date}>
              <div className="text-sm font-semibold text-gray-400 mb-3">
                {format(new Date(date), 'EEEE, MMM d')}
              </div>
              <div className="space-y-2">
                {groupedEvents[date].map(event => (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold mb-1">{event.title}</div>
                        {event.description && (
                          <div className="text-sm text-gray-500 mb-2">{event.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{event.event_time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>•</span>
                        <span>{event.duration_minutes}min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>•</span>
                        <span className="text-blue-400">{getTimeUntil(event.event_date, event.event_time)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {(!events || events.length === 0) && (
          <div className="text-center py-12 text-gray-600">
            No upcoming events
          </div>
        )}

        <Button 
          onClick={() => setShowEventModal(true)}
          className="w-full bg-gray-900 border border-gray-800 hover:bg-gray-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Event
        </Button>

        <EventModal
          open={showEventModal}
          onClose={() => setShowEventModal(false)}
          onSubmit={(data) => createEventMutation.mutate(data)}
        />
      </div>
    </div>
  );
}