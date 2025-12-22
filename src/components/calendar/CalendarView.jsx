import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, isSameMonth, isSameDay, isToday, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CalendarView({ events, onEventClick, onNewEvent, view = 'monthly' }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getEventsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events?.filter(e => e.event_date === dateStr) || [];
  };

  const renderMonthlyView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dayEvents = getEventsForDate(day);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isCurrentDay = isToday(day);
        
        days.push(
          <div
            key={day.toString()}
            onClick={() => dayEvents.length > 0 && onEventClick && onEventClick(dayEvents[0])}
            className={`min-h-24 p-2 border border-zinc-800 ${
              !isCurrentMonth ? 'bg-zinc-950/50' : 'bg-zinc-900'
            } ${dayEvents.length > 0 ? 'cursor-pointer hover:bg-zinc-800' : ''} transition-colors`}
          >
            <div className={`text-sm font-semibold mb-1 ${
              isCurrentDay ? 'text-blue-400' : isCurrentMonth ? 'text-white' : 'text-zinc-600'
            }`}>
              {format(day, 'd')}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 2).map(event => (
                <div key={event.id} className="text-xs px-2 py-1 rounded bg-blue-600/20 text-blue-300 truncate">
                  {event.event_time} {event.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs text-zinc-500">+{dayEvents.length - 2} more</div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div>
        <div className="grid grid-cols-7 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-zinc-500 py-2">
              {day}
            </div>
          ))}
        </div>
        {rows}
      </div>
    );
  };

  const renderWeeklyView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayEvents = getEventsForDate(day);
      const isCurrentDay = isToday(day);
      
      days.push(
        <div key={i} className="flex-1 border-r border-zinc-800 last:border-r-0">
          <div className={`text-center py-3 border-b border-zinc-800 ${
            isCurrentDay ? 'bg-blue-600/20 text-blue-400' : 'bg-zinc-900 text-white'
          }`}>
            <div className="text-xs text-zinc-500">{format(day, 'EEE')}</div>
            <div className="text-lg font-bold">{format(day, 'd')}</div>
          </div>
          <div className="p-2 space-y-2 min-h-96">
            {dayEvents.map(event => (
              <div
                key={event.id}
                onClick={() => onEventClick && onEventClick(event)}
                className="p-2 rounded bg-blue-600/20 border border-blue-600/30 text-blue-300 cursor-pointer hover:bg-blue-600/30 transition-colors"
              >
                <div className="text-xs font-semibold">{event.event_time}</div>
                <div className="text-sm">{event.title}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return <div className="flex border border-zinc-800 rounded-lg overflow-hidden">{days}</div>;
  };

  const renderDailyView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="border border-zinc-800 rounded-lg overflow-hidden">
        <div className="bg-zinc-900 text-center py-4 border-b border-zinc-800">
          <div className="text-2xl font-bold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</div>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          {hours.map(hour => (
            <div key={hour} className="flex border-b border-zinc-900">
              <div className="w-16 text-right pr-2 py-2 text-sm text-zinc-500">
                {format(new Date().setHours(hour, 0), 'HH:mm')}
              </div>
              <div className="flex-1 p-2 min-h-16 bg-zinc-950">
                {dayEvents
                  .filter(e => parseInt(e.event_time.split(':')[0]) === hour)
                  .map(event => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick && onEventClick(event)}
                      className="p-2 rounded bg-blue-600/20 border border-blue-600/30 text-blue-300 cursor-pointer hover:bg-blue-600/30 transition-colors mb-1"
                    >
                      <div className="text-sm font-semibold">{event.title}</div>
                      <div className="text-xs">{event.event_time} • {event.duration_minutes}min</div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderYearlyView = () => {
    const year = currentDate.getFullYear();
    const months = [];
    
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(year, month, 1);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
      
      const days = [];
      let day = startDate;
      
      while (day <= endDate) {
        const dayEvents = getEventsForDate(day);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isCurrentDay = isToday(day);
        
        days.push(
          <div
            key={day.toString()}
            className={`aspect-square flex items-center justify-center text-xs ${
              !isCurrentMonth ? 'text-zinc-700' : isCurrentDay ? 'bg-blue-600 text-white rounded-full' : dayEvents.length > 0 ? 'text-blue-400 font-bold' : 'text-zinc-400'
            }`}
          >
            {format(day, 'd')}
          </div>
        );
        day = addDays(day, 1);
      }
      
      months.push(
        <div key={month} className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="text-center font-semibold mb-2 text-zinc-300">
            {format(monthDate, 'MMMM')}
          </div>
          <div className="grid grid-cols-7 gap-1 text-[10px]">
            {days}
          </div>
        </div>
      );
    }
    
    return <div className="grid grid-cols-3 gap-4">{months}</div>;
  };

  const navigatePrev = () => {
    if (view === 'yearly') {
      setCurrentDate(prev => new Date(prev.getFullYear() - 1, 0, 1));
    } else if (view === 'monthly') {
      setCurrentDate(prev => addMonths(prev, -1));
    } else if (view === 'weekly') {
      setCurrentDate(prev => addDays(prev, -7));
    } else if (view === 'daily') {
      setCurrentDate(prev => addDays(prev, -1));
    }
  };

  const navigateNext = () => {
    if (view === 'yearly') {
      setCurrentDate(prev => new Date(prev.getFullYear() + 1, 0, 1));
    } else if (view === 'monthly') {
      setCurrentDate(prev => addMonths(prev, 1));
    } else if (view === 'weekly') {
      setCurrentDate(prev => addDays(prev, 7));
    } else if (view === 'daily') {
      setCurrentDate(prev => addDays(prev, 1));
    }
  };

  const getHeaderText = () => {
    if (view === 'yearly') return currentDate.getFullYear();
    if (view === 'monthly') return format(currentDate, 'MMMM yyyy');
    if (view === 'weekly') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    }
    if (view === 'daily') return format(currentDate, 'MMMM d, yyyy');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            onClick={navigatePrev}
            variant="outline"
            size="icon"
            className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold min-w-64 text-center">{getHeaderText()}</h2>
          <Button
            onClick={navigateNext}
            variant="outline"
            size="icon"
            className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button
          onClick={onNewEvent}
          className="bg-white text-black hover:bg-zinc-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Event
        </Button>
      </div>

      {view === 'monthly' && renderMonthlyView()}
      {view === 'weekly' && renderWeeklyView()}
      {view === 'daily' && renderDailyView()}
      {view === 'yearly' && renderYearlyView()}
    </div>
  );
}