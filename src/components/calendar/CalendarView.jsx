import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, isSameMonth, isSameDay, isToday, isFuture, isPast, startOfDay } from 'date-fns';
import { fr, es, zhCN, hi, id as idLocale, ru, ar, pt } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../LanguageProvider';

const colorMap = {
  blue: { bg: 'bg-cyan-500/35', text: 'text-cyan-100', border: 'border-cyan-400/50', darkBg: 'bg-cyan-950/45', darkText: 'text-cyan-300/90', darkBorder: 'border-cyan-800/50' },
  green: { bg: 'bg-emerald-500/35', text: 'text-emerald-100', border: 'border-emerald-400/50', darkBg: 'bg-emerald-950/45', darkText: 'text-emerald-300/90', darkBorder: 'border-emerald-800/50' },
  purple: { bg: 'bg-violet-500/35', text: 'text-violet-100', border: 'border-violet-400/50', darkBg: 'bg-violet-950/45', darkText: 'text-violet-300/90', darkBorder: 'border-violet-800/50' },
  pink: { bg: 'bg-fuchsia-500/35', text: 'text-fuchsia-100', border: 'border-fuchsia-400/50', darkBg: 'bg-fuchsia-950/45', darkText: 'text-fuchsia-300/90', darkBorder: 'border-fuchsia-800/50' },
  orange: { bg: 'bg-amber-500/35', text: 'text-amber-100', border: 'border-amber-400/50', darkBg: 'bg-amber-950/45', darkText: 'text-amber-300/90', darkBorder: 'border-amber-800/50' },
  red: { bg: 'bg-rose-500/35', text: 'text-rose-100', border: 'border-rose-400/50', darkBg: 'bg-rose-950/45', darkText: 'text-rose-300/90', darkBorder: 'border-rose-800/50' },
  yellow: { bg: 'bg-lime-500/35', text: 'text-lime-100', border: 'border-lime-400/50', darkBg: 'bg-lime-950/45', darkText: 'text-lime-300/90', darkBorder: 'border-lime-800/50' },
  teal: { bg: 'bg-teal-500/35', text: 'text-teal-100', border: 'border-teal-400/50', darkBg: 'bg-teal-950/45', darkText: 'text-teal-300/90', darkBorder: 'border-teal-800/50' }
};

export default function CalendarView({ events, onEventClick, onNewEvent, onTimeClick, onDateChange, eventTypes = [] }) {
  const { language, t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('yearly');
  
  const getEventColor = (event) => {
    if (event.is_birthday) {
      return { 
        bg: 'bg-gradient-to-r from-pink-300/40 via-yellow-200/40 to-purple-300/40', 
        text: 'text-white', 
        border: 'border-yellow-300/50 shadow-[0_0_12px_rgba(253,224,71,0.3),inset_0_1px_4px_rgba(255,255,255,0.2)]', 
        darkBg: 'bg-gradient-to-r from-pink-400/50 via-yellow-300/50 to-purple-400/50', 
        darkText: 'text-yellow-50 font-bold', 
        darkBorder: 'border-yellow-300/60 shadow-[0_0_16px_rgba(253,224,71,0.4),inset_0_2px_6px_rgba(255,255,255,0.15)]',
        extraClass: 'animate-pulse'
      };
    }
    if (event.event_type_id) {
      const type = eventTypes.find(t => t.id === event.event_type_id);
      if (type) {
        return colorMap[type.color] || colorMap.blue;
      }
    }
    return colorMap.blue;
  };
  
  const getDateFnsLocale = () => {
    const locales = { fr, es, zh: zhCN, hi, id: idLocale, ru, ar, pt };
    return locales[language] || undefined;
  };

  const getEventsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events?.filter(e => e.event_date === dateStr) || [];
  };

  const renderYearlyView = () => {
    const year = currentDate.getFullYear();
    const months = [];
    
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(year, month, 1);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthStart);
      
      // Count events in this month
      let eventCount = 0;
      let day = monthStart;
      while (day <= monthEnd) {
        const dayEvents = getEventsForDate(day);
        eventCount += dayEvents.length;
        day = addDays(day, 1);
      }
      
      months.push(
        <button
          key={month} 
          onClick={() => {
            setCurrentDate(monthDate);
            setView('monthly');
          }}
          className="relative p-5 h-24 bg-zinc-900/60 rounded-xl border border-zinc-800/50 hover:bg-zinc-900/80 hover:border-zinc-700/60 active:scale-[0.98] transition-all duration-150 flex flex-col items-center justify-center"
        >
          <div className="text-center font-bold text-zinc-300 text-base mb-1">
            {format(monthDate, 'MMM', { locale: getDateFnsLocale() })}
          </div>
          {eventCount > 0 && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40">
                <span className="text-xs font-bold text-blue-400">{eventCount}</span>
              </div>
            </div>
          )}
        </button>
      );
    }
    
    return <div className="grid grid-cols-3 gap-3">{months}</div>;
  };

  const renderMonthlyView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;
    const today = startOfDay(new Date());
    const weekDaysLabels = [t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday'), t('sunday')];

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dayEvents = getEventsForDate(day);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isCurrentDay = isToday(day);
        const isFutureDay = isFuture(day) && !isCurrentDay;
        const isPastDay = isPast(day) && !isCurrentDay;
        
        const clickDay = day;
        days.push(
          <button
            key={day.toString()}
            onClick={() => {
              setCurrentDate(clickDay);
              setView('daily');
              onDateChange?.(clickDay);
            }}
            className={`relative min-h-24 p-3 border transition-all duration-150 text-left ${
              !isCurrentMonth 
                ? 'bg-zinc-950/30 border-zinc-900/30 opacity-30' 
                : isCurrentDay
                ? 'bg-gradient-to-br from-blue-950/80 to-purple-950/80 border-blue-700/60 shadow-[0_8px_24px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(59,130,246,0.1)] scale-105'
                : 'bg-zinc-900/60 border-zinc-800/50 hover:bg-zinc-900/80 hover:border-zinc-700/60 active:scale-[0.98]'
            }`}
          >
            {isCurrentDay && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded" />
            )}
            <div className={`relative text-sm font-bold mb-2 ${
              isCurrentDay 
                ? 'text-blue-300' 
                : isCurrentMonth 
                ? isPastDay ? 'text-zinc-500' : 'text-white' 
                : 'text-zinc-700'
            }`}>
              {format(day, 'd')}
            </div>
            <div className="relative space-y-1">
              {dayEvents.slice(0, 2).map(event => {
                const eventColor = getEventColor(event);
                return (
                  <div key={event.id} className={`text-xs px-2 py-1 rounded-lg font-medium truncate transition-all border ${eventColor.extraClass || ''} ${
                    isCurrentDay
                      ? `${event.is_birthday ? eventColor.bg : eventColor.bg} ${eventColor.text} ${eventColor.border} shadow-[0_0_8px_rgba(59,130,246,0.3)]`
                      : `${event.is_birthday ? eventColor.darkBg : eventColor.darkBg} ${eventColor.darkText} ${eventColor.darkBorder}`
                  }`}>
                    {event.is_birthday ? '🎂✨ ' : event.event_time + ' '}{event.is_birthday ? event.birthday_person_name : event.title}
                  </div>
                );
              })}
              {dayEvents.length > 2 && (
                <div className={`text-[10px] font-semibold ${isCurrentDay ? 'text-blue-400' : 'text-zinc-600'}`}>
                  +{dayEvents.length - 2}
                </div>
              )}
            </div>
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-2">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDaysLabels.map(dayLabel => (
            <div key={dayLabel} className="text-center text-[10px] font-black text-zinc-700 uppercase tracking-widest py-2">
              {dayLabel}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {rows}
        </div>
      </div>
    );
  };

  const renderDailyView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const isCurrentDay = isToday(currentDate);
    const birthdayEvents = dayEvents.filter(e => e.is_birthday);
    const regularEvents = dayEvents.filter(e => !e.is_birthday);
    
    // Get next few hours if today
    const now = new Date();
    const currentHour = now.getHours();
    const hours = isCurrentDay 
      ? Array.from({ length: 8 }, (_, i) => (currentHour + i) % 24).filter(h => h >= currentHour && h < 24)
      : Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-700/10 to-zinc-600/10 rounded-2xl blur-xl" />
        <div className="relative rounded-2xl bg-zinc-900/60 border border-zinc-800/50 overflow-hidden shadow-[0_12px_48px_rgba(0,0,0,0.5)]">
          <div className="bg-gradient-to-r from-zinc-900/80 to-zinc-850/80 text-center py-5 border-b border-zinc-800/50">
            <div className={`text-xl font-black tracking-tight ${isCurrentDay ? 'text-blue-300' : 'text-white'}`}>
              {format(currentDate, 'EEEE, MMM d', { locale: getDateFnsLocale() })}
            </div>
          </div>
          
          {birthdayEvents.length > 0 && (
            <div className="p-4 border-b border-zinc-800/50">
              {birthdayEvents.map(event => (
                <div key={event.id} className="p-4 rounded-xl bg-gradient-to-br from-pink-300/50 via-yellow-200/50 to-purple-300/50 border-2 border-yellow-300/60 shadow-[0_0_24px_rgba(253,224,71,0.4),0_6px_20px_rgba(236,72,153,0.3),inset_0_2px_6px_rgba(255,255,255,0.15)] mb-3 last:mb-0 animate-pulse">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎂✨🎉</div>
                    <div className="text-lg font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] mb-1">{event.birthday_person_name}</div>
                    {event.birthday_relationship && (
                      <div className="text-xs text-yellow-50/90 mb-2">{event.birthday_relationship}</div>
                    )}
                    {event.birthday_notes && (
                      <div className="text-xs text-yellow-50/70 mt-2 italic">{event.birthday_notes}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="max-h-[500px] overflow-y-auto">
            {hours.map(hour => {
              const hourEvents = regularEvents.filter(e => parseInt(e.event_time.split(':')[0]) === hour);
              const hasEvents = hourEvents.length > 0;
              
              return (
                <button
                  key={hour}
                  onClick={() => {
                    if (onTimeClick) {
                      const timeStr = format(new Date().setHours(hour, 0), 'HH:mm');
                      onTimeClick(format(currentDate, 'yyyy-MM-dd'), timeStr);
                    }
                  }}
                  className={`w-full flex border-b border-zinc-900/50 hover:bg-zinc-900/60 active:scale-[0.99] transition-all duration-150 ${
                    hasEvents ? 'bg-zinc-900/40' : 'bg-transparent'
                  }`}
                >
                  <div className="w-16 text-right pr-4 py-3 text-xs text-zinc-700 font-bold tabular-nums">
                    {format(new Date().setHours(hour, 0), 'HH:mm')}
                  </div>
                  <div className="flex-1 p-3 min-h-16 text-left">
                   {hourEvents.map(event => {
                     const eventColor = getEventColor(event);
                     return (
                       <div
                         key={event.id}
                         className={`p-3 rounded-xl border shadow-[0_4px_16px_rgba(59,130,246,0.2)] mb-2 last:mb-0 ${
                           event.is_birthday
                             ? `${eventColor.darkBg} ${eventColor.darkBorder}`
                             : `${eventColor.darkBg} ${eventColor.darkBorder}`
                         }`}
                       >
                         <div className={`text-sm font-bold mb-1 ${event.is_birthday ? eventColor.darkText : eventColor.darkText}`}>
                           {event.is_birthday ? '🎂 ' : ''}{event.is_birthday ? event.birthday_person_name : event.title}
                         </div>
                         <div className={`text-xs font-medium ${event.is_birthday ? 'text-pink-400/60' : eventColor.darkText}`}>
                           {event.is_birthday 
                             ? (event.birthday_relationship ? event.birthday_relationship : 'Toute la journée')
                             : `${event.event_time} • ${event.duration_minutes}min`
                           }
                         </div>
                       </div>
                     );
                   })}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const navigatePrev = () => {
    let newDate;
    if (view === 'yearly') {
      newDate = new Date(currentDate.getFullYear() - 1, 0, 1);
    } else if (view === 'monthly') {
      newDate = addMonths(currentDate, -1);
    } else if (view === 'weekly') {
      newDate = addDays(currentDate, -7);
    } else if (view === 'daily') {
      newDate = addDays(currentDate, -1);
    }
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const navigateNext = () => {
    let newDate;
    if (view === 'yearly') {
      newDate = new Date(currentDate.getFullYear() + 1, 0, 1);
    } else if (view === 'monthly') {
      newDate = addMonths(currentDate, 1);
    } else if (view === 'weekly') {
      newDate = addDays(currentDate, 7);
    } else if (view === 'daily') {
      newDate = addDays(currentDate, 1);
    }
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const getHeaderText = () => {
    const locale = getDateFnsLocale();
    if (view === 'yearly') return currentDate.getFullYear();
    if (view === 'monthly') return format(currentDate, 'MMMM yyyy', { locale });
    if (view === 'weekly') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      return `${format(weekStart, 'MMM d', { locale })} - ${format(weekEnd, 'MMM d, yyyy', { locale })}`;
    }
    if (view === 'daily') return format(currentDate, 'MMMM d, yyyy', { locale });
  };

  const handleBackNavigation = () => {
    if (view === 'daily') {
      setView('monthly');
    } else if (view === 'monthly') {
      setView('yearly');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {(view === 'monthly' || view === 'daily') && (
            <button
              onClick={handleBackNavigation}
              className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/50 hover:bg-zinc-900/80 hover:border-zinc-700/60 active:scale-95 transition-all duration-150"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={navigatePrev}
              className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/50 hover:bg-zinc-900/80 hover:border-zinc-700/60 active:scale-95 transition-all duration-150"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-base font-bold min-w-32 text-center">{getHeaderText()}</h2>
            <button
              onClick={navigateNext}
              className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/50 hover:bg-zinc-900/80 hover:border-zinc-700/60 active:scale-95 transition-all duration-150"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <Button
          onClick={onNewEvent}
          className="bg-white text-black hover:bg-zinc-200 h-9 px-3 text-xs font-bold rounded-xl shadow-[0_8px_24px_rgba(255,255,255,0.12)] active:scale-95 transition-all duration-150"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {view === 'yearly' && renderYearlyView()}
      {view === 'monthly' && renderMonthlyView()}
      {view === 'daily' && renderDailyView()}
    </div>
  );
}