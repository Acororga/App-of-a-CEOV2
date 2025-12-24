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

  React.useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        const tHabits = await getHabitsForDate(today);
        const tCompletions = await getHabitCompletionsForDate(today);
        const yHabits = await getHabitsForDate(yesterday);
        const yCompletions = await getHabitCompletionsForDate(yesterday);
        
        if (!mounted) return;
        
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

  const { data: topTasks } = useQuery({
    queryKey: ['topTasks'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const tasks = await base44.entities.ParetoTask.filter({ 
        created_by: user.email,
        completed: false
      });
      
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
      }).slice(0, 3);
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
    if (!yesterdayHabits || yesterdayHabits.length === 0) return false;
    if (!yesterdayCompletions || yesterdayCompletions.length === 0) return true;
    
    const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
    for (const habit of yesterdayHabits) {
      const completion = yesterdayCompletions.find(c => c.habit_id === habit.id);
      if (!completion) return true;
      const isSameDay = completion.date === yesterdayStr;
      if (!isSameDay) return true;
    }
    
    return false;
  }, [yesterdayHabits, yesterdayCompletions, yesterdayVisible, yesterday]);

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

  const completionRate = todayHabits && todayCompletions ? (todayCompletions.filter(c => c.completed).length / todayHabits.length) : 0;
  const isOnTrack = completionRate >= 0.7;
  const isAtRisk = completionRate < 0.7 && completionRate > 0.3;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6 pt-20 relative overflow-hidden">
      {/* Noise texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px'
      }} />

      <div className="max-w-2xl mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-300 mb-6 transition-colors duration-150 active:scale-95">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Home</span>
        </Link>

        <div className="mb-10 relative">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent tracking-tight">
            Control Center
          </h1>
          <div className="text-xs text-zinc-700 font-semibold uppercase tracking-widest">Today's Focus</div>
        </div>

        {/* ACTION ZONE - Layered visual hierarchy */}
        <div className="space-y-8 mb-16">
          {/* Yesterday Alert - CRITICAL PRIORITY */}
          {yesterdayVisible && needsYesterdayValidation && yesterdayHabits && yesterdayHabits.length > 0 && (
            <div className="relative animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/40 to-red-500/40 rounded-[32px] blur-3xl opacity-80 animate-pulse" />
              <div className="relative p-8 rounded-[32px] bg-gradient-to-br from-zinc-900/95 via-zinc-850/95 to-zinc-900/95 backdrop-blur-xl border-2 border-orange-500/60 shadow-[0_24px_96px_rgba(249,115,22,0.5),0_0_0_1px_rgba(249,115,22,0.1),inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black text-orange-200 mb-1 tracking-tight">YESTERDAY</h2>
                    <div className="text-xs text-orange-400/60 font-medium">Validation required</div>
                  </div>
                  <Link 
                    to={createPageUrl('Habits')}
                    className="p-2.5 hover:bg-zinc-800/50 rounded-xl transition-all duration-150 active:scale-95"
                  >
                    <Plus className="w-5 h-5 text-zinc-400" />
                  </Link>
                </div>
                <div className="space-y-2 mb-6">
                  {yesterdayHabits.map(habit => (
                    <button
                      key={habit.id}
                      onClick={() => toggleYesterdayHabit(habit.id)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/60 hover:bg-zinc-900/80 active:scale-[0.98] transition-all duration-150"
                    >
                      {tempYesterdayStates[habit.id] ? (
                        <div className="relative">
                          <div className="absolute inset-0 bg-green-500/30 rounded-full blur-md" />
                          <CheckCircle2 className="relative w-6 h-6 text-green-400 flex-shrink-0" />
                        </div>
                      ) : (
                        <Circle className="w-6 h-6 text-zinc-600 flex-shrink-0" />
                      )}
                      <span className={`text-sm font-medium ${tempYesterdayStates[habit.id] ? 'text-zinc-500 line-through' : 'text-white'}`}>
                        {habit.title}
                      </span>
                    </button>
                  ))}
                </div>
                <Button
                  onClick={() => validateYesterdayMutation.mutate()}
                  disabled={validateYesterdayMutation.isPending}
                  className="w-full bg-white text-black hover:bg-zinc-200 h-14 text-base font-bold rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] active:scale-[0.98] transition-all duration-150"
                >
                  <Check className="w-5 h-5 mr-2" />
                  {validateYesterdayMutation.isPending ? 'Validating...' : 'Validate Yesterday'}
                </Button>
              </div>
            </div>
          )}

          {/* Today's Habits - PRIMARY FOCUS */}
          <div className="relative animate-in fade-in zoom-in-95 duration-300">
            <div className={`absolute inset-0 rounded-[32px] blur-3xl transition-all duration-300 ${
              isOnTrack ? 'bg-gradient-to-r from-emerald-500/30 to-green-500/30 opacity-80' :
              isAtRisk ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 opacity-70' :
              'bg-gradient-to-r from-red-500/30 to-orange-500/30 opacity-60'
            }`} />
            <div className={`relative p-8 rounded-[32px] bg-gradient-to-br from-zinc-900/95 via-zinc-850/95 to-zinc-900/95 backdrop-blur-xl border-2 transition-all duration-300 shadow-[0_24px_96px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] ${
              isOnTrack ? 'border-emerald-600/60' :
              isAtRisk ? 'border-yellow-600/60' :
              'border-red-600/60'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-black text-zinc-200 tracking-tight">TODAY</h2>
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    isOnTrack ? 'bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.8)]' :
                    isAtRisk ? 'bg-yellow-400 shadow-[0_0_16px_rgba(251,191,36,0.8)]' :
                    'bg-red-400 shadow-[0_0_16px_rgba(248,113,113,0.8)] animate-pulse'
                  }`} />
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-xl text-sm font-black border-2 shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] transition-all ${
                    isOnTrack ? 'bg-emerald-950/50 text-emerald-200 border-emerald-700/50' :
                    isAtRisk ? 'bg-yellow-950/50 text-yellow-200 border-yellow-700/50' :
                    'bg-red-950/50 text-red-200 border-red-700/50'
                  }`}>
                    {todayHabits && todayCompletions && 
                      `${todayCompletions.filter(c => c.completed).length}/${todayHabits.length}`}
                  </div>
                  <Link 
                    to={createPageUrl('Habits')}
                    className="p-2.5 hover:bg-zinc-800/50 rounded-xl transition-all duration-150 active:scale-95"
                  >
                    <Plus className="w-5 h-5 text-zinc-400" />
                  </Link>
                </div>
              </div>
              <div className="space-y-2.5">
                {todayHabits && todayHabits.length > 0 ? (
                  todayHabits.map((habit, idx) => {
                    const isCompleted = todayCompletionMap[habit.id];
                    
                    return (
                      <button
                        key={habit.id}
                        onClick={() => toggleTodayHabitMutation.mutate({ 
                          habitId: habit.id, 
                          completed: !todayCompletionMap[habit.id] 
                        })}
                        className="w-full group relative"
                      >
                        {isCompleted && (
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/15 to-emerald-500/15 rounded-2xl blur-lg" />
                        )}
                        <div className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-150 ${
                          isCompleted 
                            ? 'bg-green-950/30 border-green-700/50 shadow-[inset_0_2px_12px_rgba(34,197,94,0.2)]' 
                            : 'bg-zinc-900/60 border-zinc-800/60 hover:border-zinc-700/60 hover:bg-zinc-900/80 active:scale-[0.98]'
                        }`}>
                          {isCompleted ? (
                            <div className="relative">
                              <div className="absolute inset-0 bg-green-500/40 rounded-full blur-lg" />
                              <CheckCircle2 className="relative w-6 h-6 text-green-400 flex-shrink-0" />
                            </div>
                          ) : (
                            <Circle className="w-6 h-6 text-zinc-600 flex-shrink-0" />
                          )}
                          <span className={`text-sm font-medium flex-1 text-left ${isCompleted ? 'text-zinc-500 line-through' : 'text-white'}`}>
                            {habit.title}
                          </span>
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${
                            isCompleted 
                              ? 'bg-green-500/30 text-green-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]' 
                              : 'bg-zinc-800/60 text-zinc-600'
                          }`}>
                            {idx + 1}
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-zinc-600 text-sm font-medium">
                    No habits today
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Priority Tasks - SECONDARY FOCUS */}
          {topTasks && topTasks.length > 0 && (
            <div className="relative animate-in fade-in zoom-in-95 duration-300 delay-75">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[28px] blur-2xl opacity-60" />
              <div className="relative p-7 rounded-[28px] bg-gradient-to-br from-zinc-900/90 via-zinc-850/90 to-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 shadow-[0_16px_64px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-black text-zinc-300 tracking-tight">PRIORITIES</h2>
                  <Link 
                    to={createPageUrl('Pareto')}
                    className="text-xs text-zinc-500 hover:text-zinc-300 font-semibold uppercase tracking-wider transition-colors duration-150"
                  >
                    View All →
                  </Link>
                </div>
                <div className="space-y-2">
                  {topTasks.map((task, index) => {
                    const importanceBadge = {
                      crucial: { text: 'CRITICAL', color: 'text-red-300 bg-red-950/60 border-red-800/60' },
                      essential: { text: 'HIGH', color: 'text-yellow-300 bg-yellow-950/60 border-yellow-800/60' },
                      average: { text: 'MEDIUM', color: 'text-blue-300 bg-blue-950/60 border-blue-800/60' }
                    };

                    const badge = importanceBadge[task.importance_level] || importanceBadge.average;

                    return (
                      <button
                        key={task.id}
                        onClick={() => completeTaskMutation.mutate(task.id)}
                        className="w-full group text-left relative"
                      >
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-green-500/50 hover:bg-zinc-900/70 active:scale-[0.98] transition-all duration-150">
                          <div className="w-8 h-8 rounded-xl bg-zinc-800/60 flex items-center justify-center text-sm font-black text-zinc-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white mb-1 truncate">{task.title}</div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] px-2 py-1 rounded-lg font-black border uppercase tracking-wider ${badge.color}`}>
                                {badge.text}
                              </span>
                              <span className="text-[9px] text-zinc-700 font-medium">
                                {task.time_duration.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}