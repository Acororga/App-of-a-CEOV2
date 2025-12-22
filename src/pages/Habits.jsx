import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getHabitsForDate, getHabitCompletionsForDate, calculateWeeklyHabitScore } from '../functions/businessLogic';
import { format, startOfWeek, addDays } from 'date-fns';
import { ArrowLeft, Plus, CheckCircle2, Circle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ObjectiveModal from '../components/habits/ObjectiveModal';
import HabitModal from '../components/habits/HabitModal';

export default function Habits() {
  const queryClient = useQueryClient();
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
    }
  });

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

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-gray-400 mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Home</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold">Habits & Productivity</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-gray-900 w-full">
            <TabsTrigger value="objectives" className="flex-1">Objectives</TabsTrigger>
            <TabsTrigger value="habits" className="flex-1">Habits</TabsTrigger>
            <TabsTrigger value="weekly" className="flex-1">Weekly</TabsTrigger>
          </TabsList>

          <TabsContent value="objectives" className="mt-6">
            <div className="space-y-3 mb-6">
              {objectives?.map(obj => {
                const habitCount = groupedHabits[obj.id]?.length || 0;
                return (
                  <div key={obj.id} className="p-4 rounded-lg bg-gray-900 border border-gray-800">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{obj.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold">{obj.title}</div>
                        <div className="text-sm text-gray-500">{habitCount} habits</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button 
              onClick={() => setShowObjectiveModal(true)}
              className="w-full bg-gray-900 border border-gray-800 hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Objective
            </Button>
          </TabsContent>

          <TabsContent value="habits" className="mt-6">
            <div className="space-y-6 mb-6">
              {objectives?.map(obj => {
                const objHabits = groupedHabits[obj.id] || [];
                if (objHabits.length === 0) return null;
                
                return (
                  <div key={obj.id}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{obj.icon}</span>
                      <h3 className="font-semibold text-gray-300">{obj.title}</h3>
                    </div>
                    <div className="space-y-2">
                      {objHabits.map(habit => (
                        <div key={habit.id} className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                          <div className="font-medium mb-2">{habit.title}</div>
                          <div className="flex items-center gap-2">
                            {[0,1,2,3,4,5,6].map(day => (
                              <div
                                key={day}
                                className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                                  habit.is_daily || (habit.specific_days && habit.specific_days.includes(day === 0 ? 0 : day))
                                    ? 'bg-gray-800 text-white'
                                    : 'bg-gray-950 text-gray-700'
                                }`}
                              >
                                {getDayAbbrev(day)}
                              </div>
                            ))}
                            <span className="text-xs text-gray-500 ml-2">
                              {habit.is_daily ? 'Daily' : `${habit.weekly_frequency}x/week`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <Button 
              onClick={() => setShowHabitModal(true)}
              className="w-full bg-gray-900 border border-gray-800 hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Habit
            </Button>
          </TabsContent>

          <TabsContent value="weekly" className="mt-6">
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-2">
                {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
              </div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Weekly Score</h2>
                <div className="text-2xl font-bold">
                  {weeklyScore?.success_percentage || 0}%
                </div>
              </div>
              <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    (weeklyScore?.success_percentage || 0) >= (weeklyScore?.threshold_percentage || 90)
                      ? 'bg-gradient-to-r from-green-600 to-green-400'
                      : 'bg-gradient-to-r from-yellow-600 to-yellow-400'
                  }`}
                  style={{ width: `${weeklyScore?.success_percentage || 0}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {weeklyScore?.total_completed || 0} / {weeklyScore?.total_expected || 0}
                </span>
                <span className="text-xs text-gray-500">
                  Target: {weeklyScore?.threshold_percentage || 90}%
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-2 text-gray-500 font-medium">Habit</th>
                    {[0,1,2,3,4,5,6].map(i => (
                      <th key={i} className="text-center py-2 text-gray-500 font-medium w-8">
                        {getDayAbbrev(i)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {habits?.map(habit => (
                    <tr key={habit.id} className="border-b border-gray-900">
                      <td className="py-3 text-gray-300">{habit.title}</td>
                      {[0,1,2,3,4,5,6].map(dayIndex => {
                        const day = addDays(weekStart, dayIndex);
                        const dayStr = format(day, 'yyyy-MM-dd');
                        const dayData = weekData?.[dayStr];
                        const isScheduled = habit.is_daily || (habit.specific_days && habit.specific_days.includes(dayIndex === 0 ? 0 : dayIndex));
                        const isCompleted = dayData?.completions[habit.id];
                        
                        return (
                          <td key={dayIndex} className="text-center py-3">
                            {!isScheduled ? (
                              <span className="text-gray-800">·</span>
                            ) : isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500 inline-block" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-600 inline-block" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {weeklyScore && (weeklyScore.success_percentage < weeklyScore.threshold_percentage) && (
              <div className="mt-6 p-4 rounded-lg bg-yellow-950 border border-yellow-900">
                <div className="text-sm text-yellow-400">
                  💡 Complete {Math.ceil((weeklyScore.threshold_percentage - weeklyScore.success_percentage) / 100 * weeklyScore.total_expected)} more habits to reach your weekly goal!
                </div>
              </div>
            )}

            {/* Weekly Contract Section */}
            <div className="mt-8 pt-8 border-t border-gray-800">
              <h2 className="text-lg font-semibold mb-4">Weekly Contract</h2>
              
              {!weeklyContract?.committed ? (
                <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Reward (if successful)</label>
                      <input
                        type="text"
                        value={weeklyContract?.reward_text || ''}
                        onChange={(e) => updateContractMutation.mutate({ reward_text: e.target.value })}
                        placeholder="e.g., Movie night, treat yourself..."
                        className="w-full p-3 rounded-lg bg-black border border-gray-800 text-white focus:border-green-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Sanction (if you fail)</label>
                      <input
                        type="text"
                        value={weeklyContract?.sanction_text || ''}
                        onChange={(e) => updateContractMutation.mutate({ sanction_text: e.target.value })}
                        placeholder="e.g., No social media, donate to charity..."
                        className="w-full p-3 rounded-lg bg-black border border-gray-800 text-white focus:border-red-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Success Threshold</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="50"
                          max="100"
                          step="5"
                          value={weeklyContract?.success_threshold_percentage || 90}
                          onChange={(e) => updateContractMutation.mutate({ success_threshold_percentage: parseInt(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-xl font-bold text-white w-16 text-right">
                          {weeklyContract?.success_threshold_percentage || 90}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        You must complete at least this percentage of habits to win
                      </div>
                    </div>

                    {weeklyContract?.reward_text && weeklyContract?.sanction_text && (
                      <Button
                        onClick={() => updateContractMutation.mutate({ committed: true })}
                        className="w-full bg-white text-black hover:bg-gray-200 mt-2"
                      >
                        Commit to Contract
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-green-950 border border-green-900">
                    <div className="text-sm text-green-400 font-semibold mb-1">✅ Your Reward</div>
                    <div className="text-white">{weeklyContract.reward_text}</div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-red-950 border border-red-900">
                    <div className="text-sm text-red-400 font-semibold mb-1">⚠️ Your Sanction</div>
                    <div className="text-white">{weeklyContract.sanction_text}</div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
                    <div className="text-sm text-gray-400 mb-1">Target: {weeklyContract.success_threshold_percentage}%</div>
                    <div className="text-lg font-bold">
                      {weeklyScore?.success_percentage >= weeklyContract.success_threshold_percentage
                        ? '🎉 You\'re on track to earn your reward!'
                        : '⚡ Keep going to avoid the sanction!'}
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 text-center">
                    Contract is locked until next week
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

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
    </div>
  );
}