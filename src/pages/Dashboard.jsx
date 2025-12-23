import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getHabitsForDate, 
  getHabitCompletionsForDate,
  checkInHabit
} from '../functions/businessLogic';
import { base44 } from '@/api/base44Client';
import { format, subDays } from 'date-fns';
import { ArrowLeft, CheckCircle2, Circle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [yesterdayVisible, setYesterdayVisible] = useState(true);
  const [tempYesterdayStates, setTempYesterdayStates] = useState({});

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = subDays(today, 1);

  // Today's habits
  const { data: todayHabits, isLoading: todayHabitsLoading } = useQuery({
    queryKey: ['habits', format(today, 'yyyy-MM-dd')],
    queryFn: () => getHabitsForDate(today),
    refetchOnMount: true
  });

  const { data: todayCompletions, isLoading: todayCompletionsLoading } = useQuery({
    queryKey: ['completions', format(today, 'yyyy-MM-dd')],
    queryFn: () => getHabitCompletionsForDate(today),
    refetchOnMount: true
  });

  // Yesterday's habits
  const { data: yesterdayHabits, isLoading: yesterdayHabitsLoading } = useQuery({
    queryKey: ['habits', format(yesterday, 'yyyy-MM-dd')],
    queryFn: () => getHabitsForDate(yesterday),
    refetchOnMount: true
  });

  const { data: yesterdayCompletions, isLoading: yesterdayCompletionsLoading } = useQuery({
    queryKey: ['completions', format(yesterday, 'yyyy-MM-dd')],
    queryFn: () => getHabitCompletionsForDate(yesterday),
    refetchOnMount: true
  });

  // Top Pareto tasks
  const { data: topTasks } = useQuery({
    queryKey: ['topTasks'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const tasks = await base44.entities.ParetoTask.filter({ 
        created_by: user.email,
        completed: false
      });
      
      // Sort by importance (crucial highest) and time (less time = higher priority)
      const importanceWeight = { crucial: 4, essential: 3, average: 2, low: 1 };
      const timeWeight = { 
        less_than_30min: 6, 
        '1_hour': 5, 
        '2_hours': 4, 
        half_day: 3, 
        '1_day': 2, 
        several_days: 1 
      };
      
      return tasks.sort((a, b) => {
        const scoreA = (importanceWeight[a.importance_level] || 0) * 10 + (timeWeight[a.time_duration] || 0);
        const scoreB = (importanceWeight[b.importance_level] || 0) * 10 + (timeWeight[b.time_duration] || 0);
        return scoreB - scoreA;
      }).slice(0, 5);
    }
  });

  const toggleTodayHabitMutation = useMutation({
    mutationFn: async ({ habitId, completed }) => {
      await checkInHabit(habitId, today, completed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['completions', format(today, 'yyyy-MM-dd')]);
    }
  });

  const validateYesterdayMutation = useMutation({
    mutationFn: async () => {
      if (!yesterdayHabits) return;
      const promises = yesterdayHabits.map(habit => 
        checkInHabit(habit.id, yesterday, tempYesterdayStates[habit.id] || false)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['completions', format(yesterday, 'yyyy-MM-dd')]);
      queryClient.invalidateQueries(['weeklyScore']);
      queryClient.invalidateQueries(['weekData']);
      setYesterdayVisible(false);
      setTempYesterdayStates({});
    }
  });

  const toggleYesterdayHabit = (habitId) => {
    setTempYesterdayStates(prev => ({
      ...prev,
      [habitId]: !prev[habitId]
    }));
  };

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      await base44.entities.ParetoTask.update(taskId, {
        completed: true,
        completed_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['topTasks']);
      queryClient.invalidateQueries(['paretoTasks']);
    }
  });

  // Create completion maps
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

  // Check if yesterday's habits need validation
  const needsYesterdayValidation = React.useMemo(() => {
    if (!yesterdayHabits || yesterdayHabits.length === 0) return false;
    
    // If no completions exist at all, needs validation
    if (!yesterdayCompletions || yesterdayCompletions.length === 0) return true;
    
    // Check if any habit is missing a completion record with checked_in_date
    for (const habit of yesterdayHabits) {
      const completion = yesterdayCompletions.find(c => c.habit_id === habit.id);
      if (!completion) {
        return true; // Missing completion record entirely
      }
    }
    
    return false;
  }, [yesterdayHabits, yesterdayCompletions]);

  // Initialize temp states based on existing completions
  React.useEffect(() => {
    if (yesterdayHabits && yesterdayHabits.length > 0) {
      const initialStates = {};
      yesterdayHabits.forEach(habit => {
        const completion = yesterdayCompletions?.find(c => c.habit_id === habit.id);
        initialStates[habit.id] = completion ? completion.completed : false;
      });
      setTempYesterdayStates(initialStates);
    }
  }, [yesterdayHabits, yesterdayCompletions]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Home</span>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>

        <div className="space-y-6">
          {/* Yesterday's Habits - Validation Box */}
          {yesterdayVisible && needsYesterdayValidation && yesterdayHabits && yesterdayHabits.length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-red-600/10 rounded-2xl blur-xl" />
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-zinc-300">YESTERDAY'S HABITS</h2>
                  <Link 
                    to={createPageUrl('Habits')}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5 text-zinc-400" />
                  </Link>
                </div>
                <div className="space-y-2 mb-4">
                  {yesterdayHabits.map(habit => (
                    <button
                      key={habit.id}
                      onClick={() => toggleYesterdayHabit(habit.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all"
                    >
                      {tempYesterdayStates[habit.id] ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-600 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${tempYesterdayStates[habit.id] ? 'text-zinc-400 line-through' : 'text-white'}`}>
                        {habit.title}
                      </span>
                    </button>
                  ))}
                </div>
                <Button
                  onClick={() => validateYesterdayMutation.mutate()}
                  disabled={validateYesterdayMutation.isPending}
                  className="w-full bg-white text-black hover:bg-zinc-200"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {validateYesterdayMutation.isPending ? 'Validating...' : 'Validate'}
                </Button>
              </div>
            </div>
          )}

          {/* Today's Habits */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl" />
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-zinc-300">TODAY'S HABITS</h2>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-zinc-600 font-medium">
                    {todayHabits && todayCompletions && 
                      `${todayCompletions.filter(c => c.completed).length}/${todayHabits.length}`}
                  </div>
                  <Link 
                    to={createPageUrl('Habits')}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5 text-zinc-400" />
                  </Link>
                </div>
              </div>
              <div className="space-y-2">
                {todayHabits && todayHabits.length > 0 ? (
                  todayHabits.map(habit => (
                    <button
                      key={habit.id}
                      onClick={() => toggleTodayHabitMutation.mutate({ 
                        habitId: habit.id, 
                        completed: !todayCompletionMap[habit.id] 
                      })}
                      className="w-full group"
                    >
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all">
                        {todayCompletionMap[habit.id] ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-zinc-600 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${todayCompletionMap[habit.id] ? 'text-zinc-400 line-through' : 'text-white'}`}>
                          {habit.title}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-600 text-sm">
                    No habits today
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PARETO PRIORITY TASKS */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-2xl blur-xl" />
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-zinc-300">TOP 5 PRIORITY ACTIONS</h2>
                <div className="flex items-center gap-3">
                  <Link 
                    to={createPageUrl('Pareto')}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    View All →
                  </Link>
                  <Link 
                    to={createPageUrl('Pareto')}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5 text-zinc-400" />
                  </Link>
                </div>
              </div>
              <div className="space-y-2">
                {topTasks && topTasks.length > 0 ? (
                  topTasks.map((task, index) => {
                    const importanceBadge = {
                      crucial: { text: 'CRUCIAL', color: 'text-red-400 bg-red-950/50' },
                      essential: { text: 'ESSENTIAL', color: 'text-yellow-400 bg-yellow-950/50' },
                      average: { text: 'AVERAGE', color: 'text-blue-400 bg-blue-950/50' },
                      low: { text: 'LOW', color: 'text-zinc-400 bg-zinc-900/50' }
                    };

                    return (
                      <button
                        key={task.id}
                        onClick={() => completeTaskMutation.mutate(task.id)}
                        className="w-full group text-left"
                      >
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-green-500/50 transition-all">
                          <span className="text-sm font-bold text-zinc-600">{index + 1}</span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white mb-1">{task.title}</div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${importanceBadge[task.importance_level].color}`}>
                                {importanceBadge[task.importance_level].text}
                              </span>
                              <span className="text-[10px] text-zinc-600">
                                {task.time_duration.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-zinc-600 text-sm">
                    No priority tasks yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}