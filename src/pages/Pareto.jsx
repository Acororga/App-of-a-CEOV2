import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Plus, X, Trash2, Zap, LayoutGrid, CheckCircle2, MoreVertical, ListTodo } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from '../components/LanguageProvider.jsx';
import { usePremium } from '../components/PremiumProvider';
import { canCreateTask } from '../components/premiumLimits';
import PremiumGate from '../components/PremiumGate';

export default function Pareto() {
  const { t } = useLanguage();
  const { isPremiumUser } = usePremium();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    time_duration: '1_hour',
    importance_level: 'crucial'
  });
  
  const { data: tasks = [] } = useQuery({
    queryKey: ['paretoTasks'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.ParetoTask.filter({ created_by: user.id });
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const check = await canCreateTask(isPremiumUser);
      if (!check.allowed) throw new Error('Premium limit reached');
      return await base44.entities.ParetoTask.create(taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['paretoTasks']);
      setShowAddForm(false);
      setNewTask({ title: '', time_duration: '1_hour', importance_level: 'crucial' });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId) => await base44.entities.ParetoTask.delete(taskId),
    onSuccess: () => queryClient.invalidateQueries(['paretoTasks'])
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      await base44.entities.ParetoTask.update(taskId, {
        completed: true,
        completed_date: new Date().toISOString()
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['paretoTasks'])
  });

  const uncompletedTasks = tasks.filter(t => !t.completed);
  
  const prioritizedTasks = useMemo(() => {
    const importanceWeight = { crucial: 4, essential: 3, average: 2, low: 1 };
    const timeWeight = { less_than_30min: 6, '1_hour': 5, '2_hours': 4, half_day: 3, '1_day': 2, several_days: 1 };
    
    return [...uncompletedTasks].sort((a, b) => {
      const scoreA = (importanceWeight[a.importance_level] || 0) * 10 + (timeWeight[a.time_duration] || 0);
      const scoreB = (importanceWeight[b.importance_level] || 0) * 10 + (timeWeight[b.time_duration] || 0);
      return scoreB - scoreA;
    });
  }, [uncompletedTasks]);

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">{t('todo')}</h1>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest mt-1 opacity-70">The 80/20 Rule</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'list' ? 'glass text-primary' : 'text-muted-foreground'}`}
          >
            Stack
          </button>
          <button 
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'matrix' ? 'glass text-primary' : 'text-muted-foreground'}`}
          >
            Matrix
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Interface */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'list' ? (
              <motion.div 
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {prioritizedTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    layout
                    className="glass p-5 rounded-[1.5rem] flex items-center gap-4 group border border-white/5 hover:border-white/10"
                  >
                    <button 
                      onClick={() => completeTaskMutation.mutate(task.id)}
                      className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-current" />
                    </button>
                    
                    <div className="flex-1">
                      <h3 className="font-bold tracking-tight">{task.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-40">{task.time_duration.replace(/_/g, ' ')}</span>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <span className={`text-[10px] font-black uppercase tracking-tighter ${
                          task.importance_level === 'crucial' ? 'text-red-400' : 
                          task.importance_level === 'essential' ? 'text-orange-400' : 'text-blue-400'
                        }`}>
                          {task.importance_level}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => deleteTaskMutation.mutate(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
                
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="w-full rounded-[1.5rem] border-2 border-dashed border-white/10 bg-transparent hover:bg-white/5 h-16 text-muted-foreground"
                >
                  <Plus className="mr-2" /> Add Task
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                key="matrix"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="grid grid-cols-2 gap-4 aspect-square"
              >
                {/* Simplified Matrix Visual */}
                <div className="glass rounded-[2rem] p-6 border-red-500/20 bg-red-500/5">
                  <div className="text-[10px] font-black uppercase text-red-400 tracking-widest mb-4">Urgent & Imp.</div>
                  <div className="space-y-2">
                    {prioritizedTasks.filter(t => t.importance_level === 'crucial').slice(0, 3).map(t => (
                      <div key={t.id} className="text-xs font-bold opacity-60 truncate">• {t.title}</div>
                    ))}
                  </div>
                </div>
                <div className="glass rounded-[2rem] p-6 border-blue-500/20 bg-blue-500/5">
                  <div className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-4">Strategic</div>
                  <div className="space-y-2">
                    {prioritizedTasks.filter(t => t.importance_level === 'essential').slice(0, 3).map(t => (
                      <div key={t.id} className="text-xs font-bold opacity-60 truncate">• {t.title}</div>
                    ))}
                  </div>
                </div>
                <div className="glass rounded-[2rem] p-6 opacity-40">
                  <div className="text-[10px] font-black uppercase tracking-widest mb-4">Delegable</div>
                </div>
                <div className="glass rounded-[2rem] p-6 opacity-20">
                  <div className="text-[10px] font-black uppercase tracking-widest mb-4">Eliminate</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar / Stats */}
        <div className="lg:col-span-4 space-y-6">
          <section className="glass p-6 rounded-[2rem] space-y-4">
            <h3 className="font-black text-sm uppercase tracking-widest opacity-50">Efficiency</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span>Task Density</span>
                <span className="text-primary">{uncompletedTasks.length}</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(uncompletedTasks.length * 10, 100)}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          </section>
          
          <PremiumGate feature="tasks" limit={5} current={uncompletedTasks.length} compact>
            <div className="glass p-6 rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent">
              <h3 className="font-bold text-lg mb-2">High Performance</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">You are currently operating at peak capacity. Focus on the top 3 items to maintain velocity.</p>
            </div>
          </PremiumGate>
        </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.form
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onSubmit={(e) => {
                e.preventDefault();
                createTaskMutation.mutate(newTask);
              }}
              className="relative w-full max-w-md glass-dark p-8 rounded-[2.5rem] border border-white/10 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tight">New Objective</h2>
                <button type="button" onClick={() => setShowAddForm(false)} className="p-2 rounded-xl hover:bg-white/5"><X /></button>
              </div>

              <div className="space-y-4">
                <Input 
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Task Description"
                  className="bg-white/5 border-white/10 h-14 rounded-2xl font-bold"
                  autoFocus
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Select value={newTask.importance_level} onValueChange={v => setNewTask({...newTask, importance_level: v})}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crucial">Crucial</SelectItem>
                      <SelectItem value="essential">Essential</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={newTask.time_duration} onValueChange={v => setNewTask({...newTask, time_duration: v})}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                      <SelectValue placeholder="Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1_hour">1 Hour</SelectItem>
                      <SelectItem value="2_hours">2 Hours</SelectItem>
                      <SelectItem value="half_day">Half Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full rounded-2xl h-14" disabled={!newTask.title}>
                Authorize Execution
              </Button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
