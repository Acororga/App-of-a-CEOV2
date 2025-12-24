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
import { ArrowLeft, CheckCircle2, Circle, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  console.log('🔴 DASHBOARD VERSION: 2025-12-23-FINAL');
  const queryClient = useQueryClient();
  const [yesterdayVisible, setYesterdayVisible] = useState(true);
  const [tempYesterdayStates, setTempYesterdayStates] = useState({});

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = subDays(today, 1);

  const [todayHabits, setTodayHabits] = React.useState(null);
  const [todayCompletions, setTodayCompletions] = React.useState(null);
  const [yesterdayHabits, setYesterdayHabits] = React.useState(null);
  const [yesterdayCompletions, setYesterdayCompletions] = React.useState(null);

  // Fetch habits directly with useEffect
  React.useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      console.log('=== DASHBOARD FETCHING DATA ===');
      console.log('Today:', format(today, 'yyyy-MM-dd'));
      console.log('Yesterday:', format(yesterday, 'yyyy-MM-dd'));
      console.log('Today day of week:', today.getDay());
      console.log('Yesterday day of week:', yesterday.getDay());
      
      try {
        const tHabits = await getHabitsForDate(today);
        const tCompletions = await getHabitCompletionsForDate(today);
        const yHabits = await getHabitsForDate(yesterday);
        const yCompletions = await getHabitCompletionsForDate(yesterday);
        
        if (!mounted) return;
        
        console.log('RESULTS:');
        console.log('- Today habits:', tHabits.length, tHabits.map(h => h.title));
        console.log('- Today completions:', tCompletions.length);
        console.log('- Yesterday habits:', yHabits.length, yHabits.map(h => h.title));
        console.log('- Yesterday completions:', yCompletions.length);
        
        setTodayHabits(tHabits);
        setTodayCompletions(tCompletions);
        setYesterdayHabits(yHabits);
        setYesterdayCompletions(yCompletions);
      } catch (error) {
        console.error('Error fetching habits:', error);
      }
    };
    
    fetchData();
    
    return () => {
      mounted = false;
    };
  }, [today.getTime(), yesterday.getTime()]);

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
    onSuccess: async () => {
      const tCompletions = await getHabitCompletionsForDate(today);
      setTodayCompletions(tCompletions);
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
    onSuccess: async () => {
      const yCompletions = await getHabitCompletionsForDate(yesterday);
      setYesterdayCompletions(yCompletions);
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

  const needsYesterdayValidation = React.useMemo(() => {
    console.log('=== Checking needsYesterdayValidation ===');
    console.log('yesterdayHabits:', yesterdayHabits?.length);
    console.log('yesterdayCompletions:', yesterdayCompletions?.length);
    console.log('yesterdayVisible:', yesterdayVisible);
    
    // Must have yesterday habits
    if (!yesterdayHabits || yesterdayHabits.length === 0) {
      console.log('→ NO HABITS YESTERDAY');
      return false;
    }
    
    // If no completions at all, needs validation
    if (!yesterdayCompletions || yesterdayCompletions.length === 0) {
      console.log('→ NO COMPLETIONS - NEEDS VALIDATION');
      return true;
    }
    
    // Check if all habits have been checked in
    const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
    for (const habit of yesterdayHabits) {
      const completion = yesterdayCompletions.find(c => c.habit_id === habit.id);
      if (!completion) {
        console.log(`→ HABIT "${habit.title}" NOT CHECKED IN`);
        return true;
      }
      
      // Check if completion was made for yesterday specifically
      const completionDate = format(new Date(completion.checked_in_date), 'yyyy-MM-dd');
      const isSameDay = completion.date === yesterdayStr;
      
      console.log(`Habit "${habit.title}":`, {
        completion_date: completion.date,
        checked_in_date: completionDate,
        yesterday: yesterdayStr,
        isSameDay
      });
      
      if (!isSameDay) {
        console.log(`→ HABIT "${habit.title}" WRONG DATE`);
        return true;
      }
    }
    
    console.log('→ ALL VALIDATED');
    return false;
  }, [yesterdayHabits, yesterdayCompletions, yesterdayVisible, yesterday]);

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

        <div className="space-y-4">
          {/* Yesterday's Habits - Critical Alert */}
          {yesterdayVisible && needsYesterdayValidation && yesterdayHabits && yesterdayHabits.length > 0 && (
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600/30 to-orange-600/30 rounded-2xl blur-2xl animate-pulse" />
              <div className="relative p-5 rounded-2xl bg-gradient-to-br from-red-950/40 via-zinc-900 to-orange-950/40 border-2 border-red-600/30 shadow-[0_0_40px_rgba(220,38,38,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
                    <h2 className="text-base font-black tracking-tight text-red-100">PENDING VALIDATION</h2>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-red-950/50 border border-red-800/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider">Action Required</span>
                  </div>
                </div>
                <div className="space-y-1.5 mb-3">
                  {yesterdayHabits.map(habit => (
                    <button
                      key={habit.id}
                      onClick={() => toggleYesterdayHabit(habit.id)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60 hover:border-red-700/50 hover:bg-zinc-850/60 transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
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
            {(() => {
              const completionRate = todayHabits && todayCompletions ? (todayCompletions.filter(c => c.completed).length / todayHabits.length) : 0;
              const isOnTrack = completionRate >= 0.7;
              const isAtRisk = completionRate < 0.7 && completionRate > 0.3;
              const isOffTrack = completionRate <= 0.3;

              return (
                <div className={`absolute inset-0 rounded-2xl blur-xl transition-opacity ${
                  isOnTrack ? 'bg-gradient-to-r from-emerald-600/15 to-green-600/15 opacity-70' :
                  isAtRisk ? 'bg-gradient-to-r from-yellow-600/15 to-orange-600/15 opacity-60' :
                  'bg-gradient-to-r from-red-600/15 to-orange-600/15 opacity-50'
                }`} />
              );
            })()}
            <div className={(() => {
              const completionRate = todayHabits && todayCompletions ? (todayCompletions.filter(c => c.completed).length / todayHabits.length) : 0;
              const isOnTrack = completionRate >= 0.7;
              const isAtRisk = completionRate < 0.7 && completionRate > 0.3;
              
              return `relative p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border transition-all ${
                isOnTrack ? 'border-emerald-700/40' :
                isAtRisk ? 'border-yellow-700/40' :
                'border-red-700/40'
              }`;
            })()}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-zinc-300">TODAY'S HABITS</h2>
                  {/* Visual state indicator */}
                  {(() => {
                    const completionRate = todayHabits && todayCompletions ? (todayCompletions.filter(c => c.completed).length / todayHabits.length) : 0;
                    const isOnTrack = completionRate >= 0.7;
                    const isAtRisk = completionRate < 0.7 && completionRate > 0.3;
                    
                    return (
                      <div className={`w-2 h-2 rounded-full ${
                        isOnTrack ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' :
                        isAtRisk ? 'bg-yellow-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' :
                        'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)] animate-pulse'
                      }`} />
                    );
                  })()}
                </div>
                <div className="flex items-center gap-3">
                  {/* Progress indicator */}
                  {(() => {
                    const completionRate = todayHabits && todayCompletions ? (todayCompletions.filter(c => c.completed).length / todayHabits.length) : 0;
                    const isOnTrack = completionRate >= 0.7;
                    const isAtRisk = completionRate < 0.7 && completionRate > 0.3;
                    
                    return (
                      <div className={`px-2 py-1 rounded text-xs font-bold ${
                        isOnTrack ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/50' :
                        isAtRisk ? 'bg-yellow-950/50 text-yellow-300 border border-yellow-800/50' :
                        'bg-red-950/50 text-red-300 border border-red-800/50'
                      }`}>
                        {todayHabits && todayCompletions && 
                          `${todayCompletions.filter(c => c.completed).length}/${todayHabits.length}`}
                      </div>
                    );
                  })()}
                  <Link 
                    to={createPageUrl('Habits')}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5 text-zinc-400" />
                  </Link>
                </div>
              </div>
              <div className="space-y-1.5">
                {todayHabits && todayHabits.length > 0 ? (
                  todayHabits.map((habit, idx) => {
                    const isCompleted = todayCompletionMap[habit.id];
                    const totalCompleted = Object.values(todayCompletionMap).filter(Boolean).length;
                    const completionRate = todayHabits.length > 0 ? (totalCompleted / todayHabits.length) : 0;
                    const isFirstUncompleted = !isCompleted && Object.keys(todayCompletionMap).slice(0, idx).every(key => todayCompletionMap[key]);
                    
                    return (
                      <button
                        key={habit.id}
                        onClick={() => toggleTodayHabitMutation.mutate({ 
                          habitId: habit.id, 
                          completed: !todayCompletionMap[habit.id] 
                        })}
                        className={`w-full group relative transition-all duration-300 ${isFirstUncompleted ? 'scale-[1.01]' : ''}`}
                      >
                        {/* Next action highlight */}
                        {isFirstUncompleted && (
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-sm" />
                        )}
                        {/* Completion glow */}
                        {isCompleted && (
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 rounded-lg" />
                        )}
                        <div className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          isCompleted 
                            ? 'bg-emerald-950/20 border-emerald-800/40 shadow-[inset_0_1px_0_rgba(16,185,129,0.1)]' 
                            : isFirstUncompleted
                            ? 'bg-zinc-900/70 border-blue-700/40 shadow-[0_4px_16px_rgba(59,130,246,0.1),inset_0_1px_0_rgba(255,255,255,0.03)]'
                            : 'bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700/60 hover:bg-zinc-900/60'
                        }`}>
                          {isCompleted ? (
                            <div className="relative">
                              <div className="absolute inset-0 bg-green-500/30 rounded-full blur-sm" />
                              <CheckCircle2 className="relative w-5 h-5 text-green-400 flex-shrink-0" />
                            </div>
                          ) : (
                            <Circle className="w-5 h-5 text-zinc-600 flex-shrink-0" />
                          )}
                          <span className={`text-sm flex-1 text-left ${isCompleted ? 'text-zinc-500 line-through' : 'text-white'}`}>
                            {habit.title}
                          </span>
                          {/* Position indicator */}
                          <div className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold ${
                            isCompleted 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-zinc-800 text-zinc-600'
                          }`}>
                            {idx + 1}
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-zinc-600 text-sm">
                    No habits today
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PARETO PRIORITY ACTIONS - ELEVATED */}
          <div className="relative mt-6">
            <div className="absolute -inset-1 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl blur-2xl" />
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-850 to-zinc-900 border border-zinc-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_16px_rgba(139,92,246,0.4)]" />
                  <div>
                    <h2 className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">CRITICAL ACTIONS</h2>
                    <p className="text-[9px] text-zinc-600 font-medium tracking-wide">80/20 PRIORITY</p>
                  </div>
                </div>
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
              <div className="space-y-1.5">
                {topTasks && topTasks.length > 0 ? (
                  topTasks.map((task, index) => {
                    const importanceConfig = {
                      crucial: { 
                        badge: 'CRITICAL', 
                        color: 'text-red-300 bg-red-950/60 border-red-800/60',
                        glow: 'from-red-600/20 to-orange-600/20',
                        bar: 'from-red-500 to-orange-500',
                        scale: index === 0 ? 1.02 : 1
                      },
                      essential: { 
                        badge: 'HIGH', 
                        color: 'text-yellow-300 bg-yellow-950/60 border-yellow-800/60',
                        glow: 'from-yellow-600/15 to-amber-600/15',
                        bar: 'from-yellow-500 to-amber-500',
                        scale: 1
                      },
                      average: { 
                        badge: 'MEDIUM', 
                        color: 'text-blue-300 bg-blue-950/60 border-blue-800/60',
                        glow: 'from-blue-600/10 to-cyan-600/10',
                        bar: 'from-blue-500 to-cyan-500',
                        scale: 1
                      },
                      low: { 
                        badge: 'LOW', 
                        color: 'text-zinc-500 bg-zinc-900/60 border-zinc-800/60',
                        glow: 'from-zinc-600/5 to-zinc-500/5',
                        bar: 'from-zinc-500 to-zinc-600',
                        scale: 0.98
                      }
                    };

                    const config = importanceConfig[task.importance_level];

                    return (
                      <button
                        key={task.id}
                        onClick={() => completeTaskMutation.mutate(task.id)}
                        className="w-full group text-left relative"
                        style={{ transform: `scale(${config.scale})` }}
                      >
                        {index === 0 && (
                          <div className={`absolute -inset-0.5 bg-gradient-to-r ${config.glow} rounded-xl blur-md`} />
                        )}
                        <div className={`relative flex items-center gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/60 hover:border-emerald-600/50 transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden`}>
                          <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${config.bar}`} />
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${config.bar} flex items-center justify-center font-black text-white text-sm shadow-lg`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white mb-1 truncate">{task.title}</div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${config.color}`}>
                                {config.badge}
                              </span>
                              <span className="text-[9px] text-zinc-600 font-medium">
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