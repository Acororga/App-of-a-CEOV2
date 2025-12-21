import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getHabitsForDate, 
  getHabitCompletionsForDate, 
  hasUncheckedHabits,
  checkInHabit,
  getTopParetoTasks,
  getNextEvent,
  getOrCreateWinStreak
} from '../functions/businessLogic';
import { base44 } from '@/api/base44Client';
import { format, subDays, differenceInMinutes, parseISO } from 'date-fns';
import { ArrowLeft, Target, CheckCircle2, Circle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [checkInMode, setCheckInMode] = useState(false);
  const [checkInDate, setCheckInDate] = useState(null);
  const [habitStates, setHabitStates] = useState({});

  const yesterday = subDays(new Date(), 1);

  const { data: hasUnchecked } = useQuery({
    queryKey: ['hasUnchecked', format(yesterday, 'yyyy-MM-dd')],
    queryFn: () => hasUncheckedHabits(yesterday)
  });

  const { data: yesterdayHabits } = useQuery({
    queryKey: ['habits', format(yesterday, 'yyyy-MM-dd')],
    queryFn: () => getHabitsForDate(yesterday),
    enabled: checkInMode
  });

  const { data: yesterdayCompletions } = useQuery({
    queryKey: ['completions', format(yesterday, 'yyyy-MM-dd')],
    queryFn: () => getHabitCompletionsForDate(yesterday),
    enabled: checkInMode
  });

  const { data: todayHabits } = useQuery({
    queryKey: ['habits', format(new Date(), 'yyyy-MM-dd')],
    queryFn: () => getHabitsForDate(new Date()),
    enabled: !checkInMode
  });

  const { data: todayCompletions } = useQuery({
    queryKey: ['completions', format(new Date(), 'yyyy-MM-dd')],
    queryFn: () => getHabitCompletionsForDate(new Date()),
    enabled: !checkInMode
  });

  const { data: topTasks } = useQuery({
    queryKey: ['topTasks'],
    queryFn: () => getTopParetoTasks(3)
  });

  const { data: nextEvent } = useQuery({
    queryKey: ['nextEvent'],
    queryFn: getNextEvent
  });

  const { data: streak } = useQuery({
    queryKey: ['winStreak'],
    queryFn: getOrCreateWinStreak
  });

  useEffect(() => {
    if (hasUnchecked && !checkInMode) {
      setCheckInMode(true);
      setCheckInDate(yesterday);
    }
  }, [hasUnchecked]);

  useEffect(() => {
    if (yesterdayCompletions && yesterdayHabits) {
      const states = {};
      yesterdayCompletions.forEach(c => {
        states[c.habit_id] = c.completed;
      });
      setHabitStates(states);
    }
  }, [yesterdayCompletions, yesterdayHabits]);

  const checkInMutation = useMutation({
    mutationFn: async () => {
      for (const habitId in habitStates) {
        await checkInHabit(habitId, checkInDate, habitStates[habitId]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['hasUnchecked']);
      setCheckInMode(false);
    }
  });

  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habitId, completed }) => {
      await checkInHabit(habitId, new Date(), completed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['completions']);
    }
  });

  const todayCompletionMap = {};
  if (todayCompletions) {
    todayCompletions.forEach(c => {
      todayCompletionMap[c.habit_id] = c.completed;
    });
  }

  const getTimeUntilEvent = () => {
    if (!nextEvent) return null;
    const eventTime = parseISO(`${nextEvent.event_date}T${nextEvent.event_time}`);
    const mins = differenceInMinutes(eventTime, new Date());
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (checkInMode && yesterdayHabits) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-md mx-auto">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-gray-400 mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Home</span>
          </Link>

          <div className="mb-8">
            <div className="text-sm text-gray-500 mb-2">YESTERDAY</div>
            <h1 className="text-2xl font-bold">Complete Check-in</h1>
          </div>

          <div className="space-y-3 mb-8">
            {yesterdayHabits.map(habit => (
              <button
                key={habit.id}
                onClick={() => setHabitStates(prev => ({ ...prev, [habit.id]: !prev[habit.id] }))}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all"
              >
                {habitStates[habit.id] ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                )}
                <span className={habitStates[habit.id] ? 'text-white' : 'text-gray-400'}>
                  {habit.title}
                </span>
              </button>
            ))}
          </div>

          <Button
            onClick={() => checkInMutation.mutate()}
            disabled={checkInMutation.isPending}
            className="w-full bg-white text-black hover:bg-gray-200 h-12 text-base font-semibold"
          >
            {checkInMutation.isPending ? 'Validating...' : '✓ Validate Check-in'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-gray-400 mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Home</span>
        </Link>

        <div className="mb-8">
          <div className="text-sm text-gray-500 mb-2">TODAY</div>
          <h1 className="text-2xl font-bold">Daily Dashboard</h1>
        </div>

        {/* Today's Habits */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-300">HABITS</h2>
            <div className="text-sm text-gray-500">
              {todayHabits && todayCompletions && `${todayCompletions.filter(c => c.completed).length}/${todayHabits.length}`}
            </div>
          </div>
          <div className="space-y-2">
            {todayHabits?.map(habit => (
              <button
                key={habit.id}
                onClick={() => toggleHabitMutation.mutate({ 
                  habitId: habit.id, 
                  completed: !todayCompletionMap[habit.id] 
                })}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all"
              >
                {todayCompletionMap[habit.id] ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-600 flex-shrink-0" />
                )}
                <span className={`text-sm ${todayCompletionMap[habit.id] ? 'text-gray-400 line-through' : 'text-white'}`}>
                  {habit.title}
                </span>
              </button>
            ))}
            {(!todayHabits || todayHabits.length === 0) && (
              <div className="text-center py-8 text-gray-600 text-sm">
                No habits scheduled today
              </div>
            )}
          </div>
        </div>

        {/* Top Priorities */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-300">TOP PRIORITIES</h2>
          </div>
          <div className="space-y-2">
            {topTasks?.slice(0, 3).map((task, index) => (
              <Link
                key={task.id}
                to={createPageUrl('Pareto')}
                className="block p-3 rounded-lg bg-gray-900 border border-gray-800 hover:border-red-900 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-red-500 font-bold text-sm">{index + 1}.</span>
                  <span className="text-sm text-white">{task.title}</span>
                </div>
              </Link>
            ))}
            {(!topTasks || topTasks.length === 0) && (
              <div className="text-center py-8 text-gray-600 text-sm">
                No priorities set
              </div>
            )}
          </div>
        </div>

        {/* Next Event */}
        {nextEvent && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-300">NEXT EVENT</h2>
            </div>
            <Link
              to={createPageUrl('Calendar')}
              className="block p-4 rounded-lg bg-gray-900 border border-gray-800 hover:border-blue-900 transition-all"
            >
              <div className="text-white font-medium mb-1">{nextEvent.title}</div>
              <div className="text-sm text-gray-500">{getTimeUntilEvent()}</div>
            </Link>
          </div>
        )}

        {/* Quick Action */}
        <Link to={createPageUrl('FocusMode')}>
          <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 h-12 text-base font-semibold">
            🎯 Start Focus Mode
          </Button>
        </Link>
      </div>
    </div>
  );
}