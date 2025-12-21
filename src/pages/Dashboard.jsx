import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getHabitsForDate, 
  getHabitCompletionsForDate, 
  checkInHabit,
  getNextEvent,
  getOrCreateWinStreak
} from '../functions/businessLogic';
import { base44 } from '@/api/base44Client';
import { format, subDays, differenceInMinutes, parseISO } from 'date-fns';
import { ArrowLeft, Target, CheckCircle2, Circle, Calendar } from 'lucide-react';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [yesterdayStates, setYesterdayStates] = useState({});

  const today = new Date();
  const yesterday = subDays(today, 1);

  const { data: todayHabits } = useQuery({
    queryKey: ['habits', format(today, 'yyyy-MM-dd')],
    queryFn: () => getHabitsForDate(today)
  });

  const { data: todayCompletions } = useQuery({
    queryKey: ['completions', format(today, 'yyyy-MM-dd')],
    queryFn: () => getHabitCompletionsForDate(today)
  });

  const { data: yesterdayHabits } = useQuery({
    queryKey: ['habits', format(yesterday, 'yyyy-MM-dd')],
    queryFn: () => getHabitsForDate(yesterday)
  });

  const { data: yesterdayCompletions } = useQuery({
    queryKey: ['completions', format(yesterday, 'yyyy-MM-dd')],
    queryFn: () => getHabitCompletionsForDate(yesterday)
  });

  const { data: topTasks } = useQuery({
    queryKey: ['topParetoTasks'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const tasks = await base44.entities.ParetoTask.filter({ 
        created_by: user.email,
        completed: false
      });
      // Sort by importance first, then time
      const importanceOrder = { crucial: 4, essential: 3, average: 2, low: 1 };
      const timeOrder = { '<30min': 6, '1h': 5, '2h': 4, 'half_day': 3, 'day': 2, 'several_days': 1 };
      return tasks.sort((a, b) => {
        const impDiff = importanceOrder[b.importance_level] - importanceOrder[a.importance_level];
        if (impDiff !== 0) return impDiff;
        return timeOrder[b.time_duration] - timeOrder[a.time_duration];
      }).slice(0, 5);
    }
  });

  const { data: nextEvent } = useQuery({
    queryKey: ['nextEvent'],
    queryFn: getNextEvent
  });

  const todayCompletionMap = {};
  if (todayCompletions) {
    todayCompletions.forEach(c => {
      todayCompletionMap[c.habit_id] = c.completed;
    });
  }

  const yesterdayCompletionMap = {};
  if (yesterdayCompletions) {
    yesterdayCompletions.forEach(c => {
      yesterdayCompletionMap[c.habit_id] = c.completed;
    });
  }

  const toggleTodayMutation = useMutation({
    mutationFn: async ({ habitId, completed }) => {
      await checkInHabit(habitId, today, completed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['completions', format(today, 'yyyy-MM-dd')]);
    }
  });

  const toggleYesterdayMutation = useMutation({
    mutationFn: async ({ habitId, completed }) => {
      await checkInHabit(habitId, yesterday, completed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['completions', format(yesterday, 'yyyy-MM-dd')]);
    }
  });

  const completeParetoMutation = useMutation({
    mutationFn: async (taskId) => {
      await base44.entities.ParetoTask.update(taskId, {
        completed: true,
        completed_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['topParetoTasks']);
      queryClient.invalidateQueries(['paretoTasks']);
    }
  });

  const getTimeUntilEvent = () => {
    if (!nextEvent) return null;
    const eventTime = parseISO(`${nextEvent.event_date}T${nextEvent.event_time}`);
    const mins = differenceInMinutes(eventTime, new Date());
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Home</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Daily Dashboard
          </h1>
          <p className="text-sm text-zinc-500 font-medium">{format(today, 'EEEE, MMMM d')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* LEFT SIDE - HABITS */}
          <div className="space-y-6">
            {/* Today's Habits */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-teal-600/10 rounded-2xl blur-xl" />
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-emerald-400">TODAY'S HABITS</h2>
                  <div className="text-sm text-zinc-500">
                    {todayHabits && todayCompletions && `${todayCompletions.filter(c => c.completed).length}/${todayHabits.length}`}
                  </div>
                </div>
                <div className="space-y-2">
                  {todayHabits?.map(habit => (
                    <button
                      key={habit.id}
                      onClick={() => toggleTodayMutation.mutate({ 
                        habitId: habit.id, 
                        completed: !todayCompletionMap[habit.id] 
                      })}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-emerald-600/50 transition-all group"
                    >
                      {todayCompletionMap[habit.id] ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-600 flex-shrink-0 group-hover:text-emerald-600/50" />
                      )}
                      <span className={`text-sm ${todayCompletionMap[habit.id] ? 'text-zinc-500 line-through' : 'text-white'}`}>
                        {habit.title}
                      </span>
                    </button>
                  ))}
                  {(!todayHabits || todayHabits.length === 0) && (
                    <div className="text-center py-8 text-zinc-600 text-sm">
                      No habits scheduled today
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Yesterday's Check-in */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-orange-600/10 rounded-2xl blur-xl" />
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-amber-400">YESTERDAY'S CHECK-IN</h2>
                  <div className="text-xs text-zinc-500">{format(yesterday, 'MMM d')}</div>
                </div>
                <div className="space-y-2">
                  {yesterdayHabits?.map(habit => (
                    <button
                      key={habit.id}
                      onClick={() => toggleYesterdayMutation.mutate({ 
                        habitId: habit.id, 
                        completed: !yesterdayCompletionMap[habit.id] 
                      })}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-amber-600/50 transition-all group"
                    >
                      {yesterdayCompletionMap[habit.id] ? (
                        <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-600 flex-shrink-0 group-hover:text-amber-600/50" />
                      )}
                      <span className={`text-sm ${yesterdayCompletionMap[habit.id] ? 'text-zinc-500 line-through' : 'text-white'}`}>
                        {habit.title}
                      </span>
                    </button>
                  ))}
                  {(!yesterdayHabits || yesterdayHabits.length === 0) && (
                    <div className="text-center py-8 text-zinc-600 text-sm">
                      No habits to check in
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - PARETO PRIORITY ACTIONS */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-orange-600/10 rounded-2xl blur-xl" />
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-500" />
                    <h2 className="text-lg font-bold text-red-400">TOP PRIORITIES</h2>
                  </div>
                  <Link to={createPageUrl('Pareto')} className="text-xs text-zinc-500 hover:text-zinc-300">
                    View All →
                  </Link>
                </div>
                <div className="space-y-2">
                  {topTasks?.map((task, index) => (
                    <div
                      key={task.id}
                      className="group p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-red-600/50 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => completeParetoMutation.mutate(task.id)}
                          className="flex-shrink-0 mt-0.5"
                        >
                          <Circle className="w-5 h-5 text-zinc-600 group-hover:text-red-600/50" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-red-500 font-bold text-sm">#{index + 1}</span>
                            <span className="text-sm text-white font-medium">{task.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`px-2 py-0.5 rounded ${
                              task.importance_level === 'crucial' ? 'bg-red-900/50 text-red-400' :
                              task.importance_level === 'essential' ? 'bg-orange-900/50 text-orange-400' :
                              task.importance_level === 'average' ? 'bg-yellow-900/50 text-yellow-400' :
                              'bg-zinc-700/50 text-zinc-400'
                            }`}>
                              {task.importance_level}
                            </span>
                            <span className="text-zinc-500">•</span>
                            <span className="text-zinc-500">{task.time_duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!topTasks || topTasks.length === 0) && (
                    <div className="text-center py-8 text-zinc-600 text-sm">
                      No priorities set
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Next Event */}
            {nextEvent && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl" />
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 shadow-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <h2 className="text-sm font-bold text-blue-400">NEXT EVENT</h2>
                  </div>
                  <Link
                    to={createPageUrl('Calendar')}
                    className="block group"
                  >
                    <div className="text-white font-medium mb-1 group-hover:text-blue-400 transition-colors">
                      {nextEvent.title}
                    </div>
                    <div className="text-sm text-zinc-500">in {getTimeUntilEvent()}</div>
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Action */}
            <Link to={createPageUrl('FocusMode')} className="block group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-2xl group-hover:shadow-purple-500/50 transition-all group-active:scale-[0.98]">
                  <div className="flex items-center justify-center gap-3">
                    <Target className="w-6 h-6 text-white" />
                    <span className="text-lg font-bold text-white">Start Focus Mode</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}