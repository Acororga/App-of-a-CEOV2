import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Plus, X, Trash2, Zap, Grid3x3, Check, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from '../components/LanguageProvider';

export default function Pareto() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    time_duration: '1_hour',
    importance_level: 'crucial'
  });
  const [newTask, setNewTask] = useState({
    title: '',
    time_duration: '1_hour',
    importance_level: 'crucial'
  });
  
  const { data: tasks } = useQuery({
    queryKey: ['paretoTasks'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.ParetoTask.filter({ 
        created_by: user.email
      });
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const user = await base44.auth.me();
      return await base44.entities.ParetoTask.create({
        ...taskData,
        created_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['paretoTasks']);
      setShowAddForm(false);
      setNewTask({ title: '', time_duration: '1_hour', importance_level: 'crucial' });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      await base44.entities.ParetoTask.delete(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['paretoTasks']);
    }
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      await base44.entities.ParetoTask.update(taskId, {
        completed: true,
        completed_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['paretoTasks']);
    }
  });

  const uncompletedTasks = tasks?.filter(t => !t.completed) || [];
  
  const prioritizedTasks = React.useMemo(() => {
    if (!uncompletedTasks) return [];
    
    const importanceWeight = { crucial: 4, essential: 3, average: 2, low: 1 };
    const timeWeight = { 
      less_than_30min: 6, 
      '1_hour': 5, 
      '2_hours': 4, 
      half_day: 3, 
      '1_day': 2, 
      several_days: 1 
    };
    
    return [...uncompletedTasks].sort((a, b) => {
      const scoreA = (importanceWeight[a.importance_level] || 0) * 10 + (timeWeight[a.time_duration] || 0);
      const scoreB = (importanceWeight[b.importance_level] || 0) * 10 + (timeWeight[b.time_duration] || 0);
      return scoreB - scoreA;
    });
  }, [uncompletedTasks]);

  const topThree = prioritizedTasks.slice(0, 3);
  const others = prioritizedTasks.slice(3);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTask.title.trim()) {
      createTaskMutation.mutate(newTask);
    }
  };

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const user = await base44.auth.me();
      return await base44.entities.ParetoTask.create({
        ...taskData,
        created_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['paretoTasks']);
      setShowAddForm(false);
      setNewTask({ title: '', time_duration: '1_hour', importance_level: 'crucial' });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      await base44.entities.ParetoTask.delete(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['paretoTasks']);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTask.title.trim()) {
      createTaskMutation.mutate(newTask);
    }
  };

  // Swipe handling
  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isRightSwipe && activeTab === 'list') {
      setActiveTab('matrix');
    } else if (isRightSwipe && activeTab === 'matrix') {
      setActiveTab('history');
    } else if (isLeftSwipe && activeTab === 'matrix') {
      setActiveTab('list');
    } else if (isLeftSwipe && activeTab === 'history') {
      setActiveTab('matrix');
    }
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };



  // Categorize tasks for Pareto Matrix (based on QUICK TO DO + IMPORTANCE)
  const quickImportant = uncompletedTasks.filter(t => 
    (t.importance_level === 'crucial' || t.importance_level === 'essential') &&
    (t.time_duration === 'less_than_30min' || t.time_duration === '1_hour')
  );
  
  const slowImportant = uncompletedTasks.filter(t => 
    (t.importance_level === 'crucial' || t.importance_level === 'essential') &&
    (t.time_duration === '2_hours' || t.time_duration === 'half_day' || t.time_duration === '1_day' || t.time_duration === 'several_days')
  );
  
  const quickNotImportant = uncompletedTasks.filter(t => 
    (t.importance_level === 'average' || t.importance_level === 'low') &&
    (t.time_duration === 'less_than_30min' || t.time_duration === '1_hour')
  );
  
  const slowNotImportant = uncompletedTasks.filter(t => 
    (t.importance_level === 'average' || t.importance_level === 'low') &&
    (t.time_duration === '2_hours' || t.time_duration === 'half_day' || t.time_duration === '1_day' || t.time_duration === 'several_days')
  );

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6 pt-20 relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Noise texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px'
      }} />

      <div className="max-w-2xl mx-auto relative">
        <div className="flex items-center justify-between mb-6">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-300 transition-colors duration-150 active:scale-95">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{t('home')}</span>
          </Link>

          <div className="w-20" />
        </div>

        {/* List View */}
        {activeTab === 'list' && (
          <>
            <div className="mb-10">
              <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-white via-red-100 to-orange-100 bg-clip-text text-transparent tracking-tight">
                {t('todo')}
              </h1>
              <div className="text-xs text-zinc-700 font-semibold uppercase tracking-widest">{t('twentyEightyRule')}</div>
            </div>

            {/* Add Task Form */}
            {showAddForm && (
              <div className="mb-8 relative animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-[24px] blur-2xl" />
                <form onSubmit={handleSubmit} className="relative p-6 rounded-[24px] bg-gradient-to-br from-zinc-900/95 via-zinc-850/95 to-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 shadow-[0_16px_64px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-black tracking-tight">{t('newTask')}</h3>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="p-2 hover:bg-zinc-800/50 rounded-lg transition-all duration-150 active:scale-95"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Input
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder={t('whatNeedsToBeDone')}
                        className="bg-zinc-900/80 border-zinc-700/50 h-12 text-base placeholder:text-zinc-600 focus:border-white/30 transition-all"
                        autoFocus
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Select
                          value={newTask.importance_level}
                          onValueChange={(value) => setNewTask({ ...newTask, importance_level: value })}
                        >
                          <SelectTrigger className="bg-zinc-900/80 border-zinc-700/50 h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="crucial">🔴 {t('crucial')}</SelectItem>
                            <SelectItem value="essential">🟡 {t('essential')}</SelectItem>
                            <SelectItem value="average">🔵 {t('average')}</SelectItem>
                            <SelectItem value="low">⚪ {t('low')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Select
                          value={newTask.time_duration}
                          onValueChange={(value) => setNewTask({ ...newTask, time_duration: value })}
                        >
                          <SelectTrigger className="bg-zinc-900/80 border-zinc-700/50 h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="less_than_30min">{t('lessThan30min')}</SelectItem>
                            <SelectItem value="1_hour">{t('oneHour')}</SelectItem>
                            <SelectItem value="2_hours">{t('twoHours')}</SelectItem>
                            <SelectItem value="half_day">{t('halfDay')}</SelectItem>
                            <SelectItem value="1_day">{t('oneDay')}</SelectItem>
                            <SelectItem value="several_days">{t('multiDay')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={!newTask.title.trim() || createTaskMutation.isPending}
                      className="w-full bg-white text-black hover:bg-zinc-200 h-12 text-base font-bold rounded-xl active:scale-[0.98] transition-all duration-150"
                    >
                      {createTaskMutation.isPending ? `${t('add')}...` : t('addTask')}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* TOP 3 PRIORITIES - MAXIMUM VISUAL WEIGHT */}
            {topThree.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.5)]" />
                    <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                      YOUR PRIORITIES
                    </h2>
                  </div>
                  {!showAddForm && (
                    <Button 
                      data-pareto-add
                      onClick={() => setShowAddForm(true)}
                      size="sm"
                      className="bg-white text-black hover:bg-zinc-200 h-9 px-4 text-xs font-bold rounded-xl active:scale-95 transition-all duration-150"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      {t('add')}
                    </Button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {topThree.map((task, index) => {
                    const sizeScale = index === 0 ? 1 : index === 1 ? 0.9 : 0.85;
                    const opacityScale = index === 0 ? 1 : index === 1 ? 0.95 : 0.9;

                    const importanceColors = {
                      crucial: { 
                        glow: 'from-red-500/40 to-orange-500/40', 
                        border: 'border-red-500/60', 
                        bg: 'from-red-950/60 to-orange-950/60',
                        badge: 'text-red-200 bg-red-900/70 border-red-700/70'
                      },
                      essential: { 
                        glow: 'from-yellow-500/30 to-amber-500/30', 
                        border: 'border-yellow-500/50', 
                        bg: 'from-yellow-950/50 to-amber-950/50',
                        badge: 'text-yellow-200 bg-yellow-900/70 border-yellow-700/70'
                      },
                      average: { 
                        glow: 'from-blue-500/25 to-cyan-500/25', 
                        border: 'border-blue-500/40', 
                        bg: 'from-blue-950/40 to-cyan-950/40',
                        badge: 'text-blue-200 bg-blue-900/70 border-blue-700/70'
                      }
                    };

                    const colors = importanceColors[task.importance_level] || importanceColors.average;

                    return (
                      <div key={task.id} className="relative group animate-in fade-in zoom-in-95 duration-300" style={{ animationDelay: `${index * 50}ms`, opacity: opacityScale }}>
                        <div className={`absolute inset-0 bg-gradient-to-r ${colors.glow} rounded-[28px] blur-3xl opacity-70 group-hover:opacity-100 transition-opacity duration-300`} />
                        <div 
                          onClick={() => deleteTaskMutation.mutate(task.id)}
                          style={{ transform: `scale(${sizeScale})`, transformOrigin: 'top' }}
                          className={`relative flex items-start gap-5 p-6 rounded-[28px] bg-gradient-to-br ${colors.bg} backdrop-blur-xl border-2 ${colors.border} cursor-pointer hover:border-opacity-80 active:scale-[0.97] transition-all duration-150 shadow-[0_20px_80px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.05)]`}
                        >
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-black text-2xl text-white/90 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)] border border-white/10`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <div className="text-lg font-bold text-white mb-2 leading-tight">{task.title}</div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] px-3 py-1.5 rounded-lg border-2 font-black uppercase tracking-wider ${colors.badge}`}>
                                {task.importance_level}
                              </span>
                              <span className="text-xs text-zinc-500 font-medium">
                                {task.time_duration.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pt-1">
                            <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/40">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* OTHER TASKS - Visually recessed */}
            {others.length > 0 && (
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-0.5 h-6 bg-zinc-800 rounded-full" />
                  <h2 className="text-sm font-bold text-zinc-600 tracking-tight uppercase">{t('otherTasks')}</h2>
                </div>
                
                <div className="space-y-2">
                  {others.map((task, index) => {
                    const importanceBadge = {
                      crucial: { text: 'CRITICAL', color: 'text-red-400/60 bg-red-950/40 border-red-900/40' },
                      essential: { text: 'HIGH', color: 'text-yellow-400/60 bg-yellow-950/40 border-yellow-900/40' },
                      average: { text: 'MED', color: 'text-blue-400/60 bg-blue-950/40 border-blue-900/40' },
                      low: { text: 'LOW', color: 'text-zinc-500 bg-zinc-900/40 border-zinc-800/40' }
                    };

                    const badge = importanceBadge[task.importance_level];

                    return (
                      <div key={task.id} className="group relative opacity-60 hover:opacity-100 transition-opacity duration-200">
                        <div 
                          onClick={() => deleteTaskMutation.mutate(task.id)}
                          className="relative flex items-center gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/40 hover:border-zinc-700/60 hover:bg-zinc-900/60 cursor-pointer active:scale-[0.98] transition-all duration-150"
                        >
                          <div className="w-7 h-7 rounded-lg bg-zinc-850/60 flex items-center justify-center text-xs font-bold text-zinc-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
                            {index + 4}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-zinc-400 mb-1 truncate">{task.title}</div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${badge.color}`}>
                                {badge.text}
                              </span>
                              <span className="text-[9px] text-zinc-700">
                                {task.time_duration.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3.5 h-3.5 text-zinc-600" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {prioritizedTasks.length === 0 && !showAddForm && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-700/10 to-zinc-600/10 rounded-[24px] blur-2xl" />
                <div className="relative text-center py-24 px-6 rounded-[24px] bg-zinc-900/50 border border-zinc-800/50">
                  <Zap className="w-16 h-16 mx-auto mb-6 text-zinc-700" />
                  <div className="text-lg font-bold text-zinc-500 mb-2">{t('noPrioritiesSet')}</div>
                  <div className="text-sm text-zinc-700 mb-6">{t('focusOnWhatMatters')}</div>
                  <Button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-white text-black hover:bg-zinc-200 h-12 px-6 text-sm font-bold rounded-xl active:scale-95 transition-all duration-150"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('addFirstTask')}
                  </Button>
                </div>
              </div>
            )}

            {/* Add button for non-empty state */}
            {prioritizedTasks.length > 0 && !showAddForm && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-5 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/60 hover:bg-zinc-900/80 text-sm font-semibold text-zinc-400 hover:text-zinc-300 active:scale-95 transition-all duration-150"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  {t('addTask')}
                </button>
              </div>
            )}

            <div className="mt-8 text-center text-xs text-zinc-600">
              Swipe right for Matrix view →
            </div>
          </>
        )}

        {/* Matrix View */}
        {activeTab === 'matrix' && (
          <div className="space-y-6">
            <div className="mb-6">
              <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent tracking-tight">
                Pareto Matrix
              </h1>
              <div className="text-xs text-zinc-700 font-semibold uppercase tracking-widest">Impact vs Time Investment</div>
            </div>

            {/* Matrix with visible axes */}
            <div className="relative">
              {/* Axis Lines */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-800/50" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-zinc-800/50" />

              <div className="grid grid-cols-2 gap-3">
                {/* Quadrant 1: Quick & Important (DO NOW) */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl blur-xl" />
                  <div className="relative p-4 rounded-2xl bg-zinc-900/70 border border-red-700/40 min-h-[280px]">
                    <div className="mb-3">
                      <div className="text-xs font-black text-red-300 uppercase tracking-wider mb-1">DO NOW</div>
                      <div className="text-[10px] text-red-400/60">Quick • High Impact</div>
                    </div>
                    <div className="space-y-2">
                      {quickImportant.map(task => (
                        <button
                          key={task.id}
                          onClick={() => deleteTaskMutation.mutate(task.id)}
                          className="w-full text-left p-3 rounded-lg bg-red-950/30 border border-red-900/30 hover:border-red-800/50 hover:bg-red-950/50 active:scale-[0.98] transition-all"
                        >
                          <div className="text-xs font-semibold text-red-200 truncate">{task.title}</div>
                        </button>
                      ))}
                      {quickImportant.length === 0 && (
                        <div className="text-center py-8 text-zinc-700 text-xs">Empty</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quadrant 2: Takes Time & Important (PLAN) */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl" />
                  <div className="relative p-4 rounded-2xl bg-zinc-900/70 border border-blue-700/40 min-h-[280px]">
                    <div className="mb-3">
                      <div className="text-xs font-black text-blue-300 uppercase tracking-wider mb-1">PLAN</div>
                      <div className="text-[10px] text-blue-400/60">Takes Time • High Impact</div>
                    </div>
                    <div className="space-y-2">
                      {slowImportant.map(task => (
                        <button
                          key={task.id}
                          onClick={() => deleteTaskMutation.mutate(task.id)}
                          className="w-full text-left p-3 rounded-lg bg-blue-950/30 border border-blue-900/30 hover:border-blue-800/50 hover:bg-blue-950/50 active:scale-[0.98] transition-all"
                        >
                          <div className="text-xs font-semibold text-blue-200 truncate">{task.title}</div>
                        </button>
                      ))}
                      {slowImportant.length === 0 && (
                        <div className="text-center py-8 text-zinc-700 text-xs">Empty</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quadrant 3: Quick & Low Impact (DELEGATE) */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-2xl blur-xl" />
                  <div className="relative p-4 rounded-2xl bg-zinc-900/70 border border-yellow-700/40 min-h-[280px]">
                    <div className="mb-3">
                      <div className="text-xs font-black text-yellow-300 uppercase tracking-wider mb-1">DELEGATE</div>
                      <div className="text-[10px] text-yellow-400/60">Quick • Low Impact</div>
                    </div>
                    <div className="space-y-2">
                      {quickNotImportant.map(task => (
                        <button
                          key={task.id}
                          onClick={() => deleteTaskMutation.mutate(task.id)}
                          className="w-full text-left p-3 rounded-lg bg-yellow-950/30 border border-yellow-900/30 hover:border-yellow-800/50 hover:bg-yellow-950/50 active:scale-[0.98] transition-all"
                        >
                          <div className="text-xs font-semibold text-yellow-200 truncate">{task.title}</div>
                        </button>
                      ))}
                      {quickNotImportant.length === 0 && (
                        <div className="text-center py-8 text-zinc-700 text-xs">Empty</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quadrant 4: Takes Time & Low Impact (ELIMINATE) */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-600/20 to-zinc-500/20 rounded-2xl blur-xl" />
                  <div className="relative p-4 rounded-2xl bg-zinc-900/70 border border-zinc-700/40 min-h-[280px]">
                    <div className="mb-3">
                      <div className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-1">ELIMINATE</div>
                      <div className="text-[10px] text-zinc-500/60">Takes Time • Low Impact</div>
                    </div>
                    <div className="space-y-2">
                      {slowNotImportant.map(task => (
                        <button
                          key={task.id}
                          onClick={() => deleteTaskMutation.mutate(task.id)}
                          className="w-full text-left p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/30 hover:border-zinc-700/50 hover:bg-zinc-900/50 active:scale-[0.98] transition-all"
                        >
                          <div className="text-xs font-semibold text-zinc-400 truncate">{task.title}</div>
                        </button>
                      ))}
                      {slowNotImportant.length === 0 && (
                        <div className="text-center py-8 text-zinc-700 text-xs">Empty</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-zinc-600">
              ← Swipe left for list • Swipe right for history →
            </div>
          </div>
        )}

        {/* History View */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="mb-6">
              <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent tracking-tight">
                All Tasks
              </h1>
              <div className="text-xs text-zinc-700 font-semibold uppercase tracking-widest">Complete History</div>
            </div>

            <div className="space-y-3">
              {recentTasks.length > 0 ? (
                recentTasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      task.completed
                        ? 'bg-zinc-900/40 border-zinc-800/40 opacity-60'
                        : 'bg-zinc-900/60 border-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className={`text-sm font-medium mb-2 ${task.completed ? 'line-through text-zinc-600' : 'text-white'}`}>
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] px-2 py-1 rounded-lg font-black border uppercase tracking-wider ${
                            task.importance_level === 'crucial' 
                              ? 'text-red-300 bg-red-950/60 border-red-800/60'
                              : task.importance_level === 'essential'
                              ? 'text-yellow-300 bg-yellow-950/60 border-yellow-800/60'
                              : 'text-blue-300 bg-blue-950/60 border-blue-800/60'
                          }`}>
                            {task.importance_level}
                          </span>
                          <span className="text-[9px] text-zinc-700 font-medium">
                            {task.time_duration.replace(/_/g, ' ')}
                          </span>
                          {task.completed && task.completed_date && (
                            <span className="text-[9px] text-green-600 font-medium">
                              ✓ {format(new Date(task.completed_date), 'MMM d')}
                            </span>
                          )}
                        </div>
                      </div>
                      {!task.completed && (
                        <button
                          onClick={() => completeTaskMutation.mutate(task.id)}
                          className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors"
                        >
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <div className="text-zinc-600 mb-2">No tasks</div>
                  <button
                    onClick={() => {
                      setActiveTab('list');
                      setShowAddForm(true);
                    }}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Add your first task
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 text-center text-xs text-zinc-600">
              ← Swipe left to return to matrix
            </div>
          </div>
        )}
      </div>
    </div>
  );
}