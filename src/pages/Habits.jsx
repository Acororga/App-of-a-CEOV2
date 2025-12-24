import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getHabitsForDate, getHabitCompletionsForDate, calculateWeeklyHabitScore } from '../functions/businessLogic';
import { format, startOfWeek, addDays } from 'date-fns';
import { ArrowLeft, Plus, CheckCircle2, Circle, XCircle, Trash2, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ObjectiveModal from '../components/habits/ObjectiveModal';
import HabitModal from '../components/habits/HabitModal';

export default function Habits() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('weekly');
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  
  const { data: objectives } = useQuery({
    queryKey: ['objectives'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.Objective.filter({ created_by: user.email, archived: false });
    }
  });

  const { data: habits } = useQuery({
    queryKey: ['allHabits'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.Habit.filter({ created_by: user.email, archived: false });
    }
  });

  const { data: weeklyScore } = useQuery({
    queryKey: ['weeklyScore', format(weekStart, 'yyyy-MM-dd')],
    queryFn: () => calculateWeeklyHabitScore(weekStart)
  });

  const { data: weekData } = useQuery({
    queryKey: ['weekData', format(weekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      const data = {};
      for (let i = 0; i < 7; i++) {
        const day = addDays(weekStart, i);
        const dayStr = format(day, 'yyyy-MM-dd');
        const habits = await getHabitsForDate(day);
        const completions = await getHabitCompletionsForDate(day);
        
        const completionMap = {};
        completions.forEach(c => {
          completionMap[c.habit_id] = c.completed;
        });
        
        data[dayStr] = { habits, completions: completionMap };
      }
      return data;
    }
  });

  const { data: weeklyContract } = useQuery({
    queryKey: ['currentContract', format(weekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      const user = await base44.auth.me();
      const contracts = await base44.entities.WeeklyContract.filter({
        created_by: user.email,
        week_start_date: format(weekStart, 'yyyy-MM-dd')
      });
      return contracts[0];
    }
  });

  const createObjectiveMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return await base44.entities.Objective.create({
        ...data,
        created_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['objectives']);
      setShowObjectiveModal(false);
    }
  });

  const createHabitMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return await base44.entities.Habit.create({
        ...data,
        created_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allHabits']);
      setShowHabitModal(false);
    }
  });

  const deleteObjectiveMutation = useMutation({
    mutationFn: async (objectiveId) => {
      const objectiveHabits = habits.filter(h => h.objective_id === objectiveId);
      await Promise.all(objectiveHabits.map(h => base44.entities.Habit.delete(h.id)));
      await base44.entities.Objective.delete(objectiveId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['objectives']);
      queryClient.invalidateQueries(['allHabits']);
    }
  });

  const deleteHabitMutation = useMutation({
    mutationFn: async (habitId) => {
      await base44.entities.Habit.delete(habitId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allHabits']);
    }
  });

  const [contractForm, setContractForm] = useState({
    reward_text: '',
    sanction_text: '',
    success_threshold_percentage: 90
  });

  React.useEffect(() => {
    if (weeklyContract) {
      setContractForm({
        reward_text: weeklyContract.reward_text || '',
        sanction_text: weeklyContract.sanction_text || '',
        success_threshold_percentage: weeklyContract.success_threshold_percentage || 90
      });
    }
  }, [weeklyContract]);

  const updateContractMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      if (weeklyContract) {
        return await base44.entities.WeeklyContract.update(weeklyContract.id, data);
      } else {
        return await base44.entities.WeeklyContract.create({
          ...data,
          week_start_date: format(weekStart, 'yyyy-MM-dd'),
          week_end_date: format(addDays(weekStart, 6), 'yyyy-MM-dd'),
          created_by: user.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentContract']);
    }
  });

  const groupedHabits = {};
  habits?.forEach(habit => {
    const objId = habit.objective_id;
    if (!groupedHabits[objId]) {
      groupedHabits[objId] = [];
    }
    groupedHabits[objId].push(habit);
  });

  const getDayAbbrev = (dayIndex) => ['M', 'T', 'W', 'T', 'F', 'S', 'S'][dayIndex];

  const isOnTrack = (weeklyScore?.success_percentage || 0) >= (weeklyScore?.threshold_percentage || 90);
  const isAtRisk = (weeklyScore?.success_percentage || 0) >= 70 && !isOnTrack;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6 pt-20 relative overflow-hidden">
      {/* Noise texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px'
      }} />

      <div className="max-w-3xl mx-auto relative">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-300 mb-6 transition-colors duration-150 active:scale-95">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Home</span>
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent tracking-tight">
            Performance
          </h1>
          <div className="text-xs text-zinc-700 font-semibold uppercase tracking-widest">Execution & Results</div>
        </div>

        {/* PERFORMANCE ZONE - Dominant visual weight */}
        <div className="space-y-6 mb-12">
          {/* Weekly Score - PRIMARY */}
          <div className="relative animate-in fade-in zoom-in-95 duration-300">
            <div className={`absolute inset-0 rounded-[32px] blur-3xl transition-all duration-300 ${
              isOnTrack ? 'bg-gradient-to-r from-emerald-500/40 to-green-500/40 opacity-90' :
              isAtRisk ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 opacity-75' :
              'bg-gradient-to-r from-red-500/30 to-orange-500/30 opacity-70'
            }`} />
            <div className={`relative p-8 rounded-[32px] bg-gradient-to-br from-zinc-900/95 via-zinc-850/95 to-zinc-900/95 backdrop-blur-xl border-2 transition-all duration-300 shadow-[0_24px_96px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.05)] ${
              isOnTrack ? 'border-emerald-600/60' :
              isAtRisk ? 'border-yellow-600/60' :
              'border-red-600/60'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs text-zinc-600 font-semibold uppercase tracking-wider mb-2">
                    {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
                  </div>
                  <h2 className="text-2xl font-black text-zinc-200 tracking-tight">WEEK SCORE</h2>
                </div>
                <div className="text-right">
                  <div className={`text-6xl font-black leading-none mb-1 ${
                    isOnTrack ? 'bg-gradient-to-br from-emerald-200 to-green-400 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(52,211,153,0.5)]' :
                    isAtRisk ? 'bg-gradient-to-br from-yellow-200 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(251,191,36,0.5)]' :
                    'bg-gradient-to-br from-red-200 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(248,113,113,0.5)]'
                  }`}>
                    {weeklyScore?.success_percentage || 0}
                  </div>
                  <div className="text-xs text-zinc-600 font-bold uppercase tracking-wider">Percent</div>
                </div>
              </div>
              
              <div className="relative h-4 bg-black/40 rounded-full overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] border border-zinc-900/50">
                <div 
                  className={`h-full transition-all duration-700 shadow-[0_0_12px_currentColor] relative ${
                    isOnTrack ? 'bg-gradient-to-r from-emerald-500 to-green-400' :
                    isAtRisk ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
                    'bg-gradient-to-r from-red-500 to-orange-400'
                  }`}
                  style={{ width: `${weeklyScore?.success_percentage || 0}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/20" />
                </div>
              </div>

              <div className="flex justify-between mt-3">
                <span className="text-xs text-zinc-600 font-medium">
                  {weeklyScore?.total_completed || 0} / {weeklyScore?.total_expected || 0} completed
                </span>
                <span className="text-xs text-zinc-600 font-medium">
                  Target {weeklyScore?.threshold_percentage || 90}%
                </span>
              </div>
            </div>
          </div>

          {/* Weekly Contract - SECONDARY */}
          <div className="relative animate-in fade-in zoom-in-95 duration-300 delay-75">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-[28px] blur-2xl opacity-60" />
            <div className="relative p-7 rounded-[28px] bg-gradient-to-br from-zinc-900/90 via-zinc-850/90 to-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 shadow-[0_16px_64px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="flex items-center gap-3 mb-5">
                <Award className="w-6 h-6 text-purple-400" />
                <h2 className="text-lg font-black text-zinc-300 tracking-tight">WEEK CONTRACT</h2>
              </div>
              
              {!weeklyContract?.committed ? (
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={contractForm.reward_text}
                      onChange={(e) => setContractForm(prev => ({ ...prev, reward_text: e.target.value }))}
                      placeholder="Your reward if successful"
                      className="w-full p-4 rounded-xl bg-black/40 border border-zinc-800/50 text-white placeholder:text-zinc-700 focus:border-green-500/50 focus:outline-none transition-all h-12"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={contractForm.sanction_text}
                      onChange={(e) => setContractForm(prev => ({ ...prev, sanction_text: e.target.value }))}
                      placeholder="Sanction if you fail"
                      className="w-full p-4 rounded-xl bg-black/40 border border-zinc-800/50 text-white placeholder:text-zinc-700 focus:border-red-500/50 focus:outline-none transition-all h-12"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-zinc-600 font-bold uppercase tracking-wider">Threshold</span>
                      <span className="text-2xl font-black text-white">
                        {contractForm.success_threshold_percentage}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="5"
                      value={contractForm.success_threshold_percentage}
                      onChange={(e) => setContractForm(prev => ({ ...prev, success_threshold_percentage: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-zinc-900 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                    />
                  </div>

                  {contractForm.reward_text && contractForm.sanction_text && (
                    <Button
                      onClick={() => updateContractMutation.mutate({ 
                        ...contractForm,
                        committed: true 
                      })}
                      disabled={updateContractMutation.isPending}
                      className="w-full bg-white text-black hover:bg-zinc-200 h-12 text-sm font-bold rounded-xl active:scale-[0.98] transition-all duration-150"
                    >
                      {updateContractMutation.isPending ? 'Committing...' : 'Commit Contract'}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-5 rounded-2xl bg-green-950/40 border-2 border-green-800/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]">
                    <div className="text-[10px] text-green-500 font-black mb-2 uppercase tracking-wider">✓ Reward</div>
                    <div className="text-sm text-green-200 font-medium">{weeklyContract.reward_text}</div>
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-red-950/40 border-2 border-red-800/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]">
                    <div className="text-[10px] text-red-500 font-black mb-2 uppercase tracking-wider">⚠ Sanction</div>
                    <div className="text-sm text-red-200 font-medium">{weeklyContract.sanction_text}</div>
                  </div>

                  <div className="text-xs text-zinc-700 text-center font-medium pt-2">
                    Locked until next week
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* EXECUTION GRID - Compact, scannable */}
        <div className="mb-12">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-zinc-900/60 border border-zinc-800/50 w-full mb-6 p-1 h-11 rounded-xl shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]">
              <TabsTrigger value="weekly" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-lg font-bold text-xs uppercase tracking-wider transition-all duration-150">Grid</TabsTrigger>
              <TabsTrigger value="objectives" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-lg font-bold text-xs uppercase tracking-wider transition-all duration-150">Goals</TabsTrigger>
              <TabsTrigger value="habits" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-lg font-bold text-xs uppercase tracking-wider transition-all duration-150">All</TabsTrigger>
            </TabsList>

            <TabsContent value="weekly" className="mt-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-700/10 to-zinc-600/10 rounded-2xl blur-xl" />
                <div className="relative overflow-x-auto rounded-2xl bg-zinc-900/60 border border-zinc-800/50 shadow-[0_12px_48px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.02)]">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800/50">
                        <th className="text-left py-3 px-4 text-zinc-600 font-black uppercase tracking-wider">Habit</th>
                        {[1,2,3,4,5,6,0].map(i => (
                          <th key={i} className="text-center py-3 px-2 text-zinc-600 font-black uppercase tracking-wider w-10">
                            {getDayAbbrev(i === 0 ? 6 : i - 1)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {habits?.map((habit, hIdx) => (
                        <tr key={habit.id} className="border-b border-zinc-900/50 hover:bg-zinc-900/30 transition-colors">
                          <td className="py-3 px-4 text-zinc-300 font-medium">{habit.title}</td>
                          {[1,2,3,4,5,6,0].map((dayNum, index) => {
                            const day = addDays(weekStart, index);
                            const dayStr = format(day, 'yyyy-MM-dd');
                            const dayData = weekData?.[dayStr];
                            const isScheduled = habit.is_daily || (habit.specific_days && habit.specific_days.includes(dayNum));
                            const isCompleted = dayData?.completions[habit.id];

                            return (
                              <td key={index} className="text-center py-3 px-2">
                                {!isScheduled ? (
                                  <span className="text-zinc-900">·</span>
                                ) : isCompleted ? (
                                  <div className="inline-flex items-center justify-center">
                                    <div className="relative">
                                      <div className="absolute inset-0 bg-green-500/30 rounded-full blur-sm" />
                                      <CheckCircle2 className="relative w-5 h-5 text-green-400" />
                                    </div>
                                  </div>
                                ) : (
                                  <XCircle className="w-5 h-5 text-zinc-700 inline-block opacity-50" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="objectives" className="mt-0">
              <div className="space-y-3">
                {objectives?.map(obj => {
                  const habitCount = groupedHabits[obj.id]?.length || 0;
                  return (
                    <div key={obj.id} className="group relative">
                      <div className="relative p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 hover:bg-zinc-900/80 active:scale-[0.98] transition-all duration-150 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this objective and all its habits?')) {
                              deleteObjectiveMutation.mutate(obj.id);
                            }
                          }}
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-zinc-800/50 rounded-lg active:scale-95 duration-150"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                        <div className="flex items-center gap-4">
                          <span className="text-3xl drop-shadow-lg">{obj.icon}</span>
                          <div className="flex-1">
                            <div className="font-bold text-white text-base mb-1">{obj.title}</div>
                            <div className="text-xs text-zinc-600 font-semibold">{habitCount} habits tracked</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                <button
                  onClick={() => setShowObjectiveModal(true)}
                  className="w-full p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/40 hover:border-zinc-700/60 hover:bg-zinc-900/60 text-zinc-500 hover:text-zinc-300 font-semibold text-sm active:scale-[0.98] transition-all duration-150"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  New Objective
                </button>
              </div>
            </TabsContent>

            <TabsContent value="habits" className="mt-0">
              <div className="space-y-6">
                {objectives?.map(obj => {
                  const objHabits = groupedHabits[obj.id] || [];
                  if (objHabits.length === 0) return null;
                  
                  return (
                    <div key={obj.id}>
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <span className="text-lg drop-shadow-sm">{obj.icon}</span>
                        <h3 className="font-bold text-zinc-400 text-sm uppercase tracking-wider">{obj.title}</h3>
                      </div>
                      <div className="space-y-2">
                        {objHabits.map(habit => (
                          <div key={habit.id} className="group/habit relative">
                            <div className="relative p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/60 hover:bg-zinc-900/70 active:scale-[0.98] transition-all duration-150">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Delete this habit?')) {
                                    deleteHabitMutation.mutate(habit.id);
                                  }
                                }}
                                className="absolute top-3 right-3 opacity-0 group-hover/habit:opacity-100 transition-opacity p-1.5 hover:bg-zinc-800/50 rounded-lg active:scale-95 duration-150"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </button>
                              <div className="font-medium text-white text-sm mb-3">{habit.title}</div>
                              <div className="flex items-center gap-1.5">
                                {[1,2,3,4,5,6,0].map(day => (
                                  <div
                                    key={day}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                                      habit.is_daily || (habit.specific_days && habit.specific_days.includes(day))
                                        ? 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]'
                                        : 'bg-zinc-950/50 text-zinc-800 border border-zinc-900/50'
                                    }`}
                                  >
                                    {getDayAbbrev(day === 0 ? 6 : day - 1)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button
                onClick={() => setShowHabitModal(true)}
                className="w-full mt-6 p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/40 hover:border-zinc-700/60 hover:bg-zinc-900/60 text-zinc-500 hover:text-zinc-300 font-semibold text-sm active:scale-[0.98] transition-all duration-150"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                New Habit
              </button>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ObjectiveModal
        open={showObjectiveModal}
        onClose={() => setShowObjectiveModal(false)}
        onSubmit={(data) => createObjectiveMutation.mutate(data)}
      />

      <HabitModal
        open={showHabitModal}
        onClose={() => setShowHabitModal(false)}
        onSubmit={(data) => createHabitMutation.mutate(data)}
        objectives={objectives}
      />
    </div>
  );
}