import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getHabitsForDate, 
  getHabitCompletionsForDate,
  checkInHabit,
  ensureHabitsScheduled,
  transitionScheduledToPending,
  getTodayScreenTime
} from '../components/businessLogic';
import { base44 } from '@/api/base44Client';
import { format, subDays } from 'date-fns';
import { CheckCircle2, Circle, Check, Zap, Clock, Shield, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../components/LanguageProvider.jsx';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [habits, setHabits] = useState([]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const { data: screenTime = 0 } = useQuery({
    queryKey: ['todayScreenTime'],
    queryFn: getTodayScreenTime
  });

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [_, __, todayHabits, completions] = await Promise.all([
          ensureHabitsScheduled(today),
          transitionScheduledToPending(subDays(today, 1)),
          getHabitsForDate(today),
          getHabitCompletionsForDate(today)
        ]);
        
        setHabits(todayHabits.map(h => ({
          ...h,
          completed: completions.find(c => c.habit_id === h.id)?.completed || false
        })));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [today]);

  const completionRate = habits.length > 0 
    ? Math.round((habits.filter(h => h.completed).length / habits.length) * 100) 
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Status Hero: The Focus Ring */}
      <section className="flex flex-col items-center justify-center py-12">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Progress Ring Background */}
          <svg className="absolute w-full h-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="12"
              className="text-white/5"
            />
            <motion.circle
              cx="128"
              cy="128"
              r="120"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray={2 * Math.PI * 120}
              initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - completionRate / 100) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-primary"
              strokeLinecap="round"
            />
          </svg>
          
          <div className="text-center z-10">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl font-black tracking-tighter"
            >
              {completionRate}%
            </motion.div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
              Focus Score
            </div>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-sm">
          <div className="glass p-4 rounded-3xl text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xl font-bold">{Math.round(screenTime)}m</span>
            </div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Screen Time</div>
          </div>
          <div className="glass p-4 rounded-3xl text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="w-4 h-4 text-orange-400" />
              <span className="text-xl font-bold">{habits.filter(h => h.completed).length}/{habits.length}</span>
            </div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Habits</div>
          </div>
        </div>
      </section>

      {/* Grid of Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Habits Widget */}
        <section className="glass p-6 rounded-[2rem] flex flex-col h-full border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black tracking-tight">{t('habits')}</h3>
            <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">Today</div>
          </div>
          
          <div className="space-y-3 flex-1">
            {isLoading ? (
              <div className="h-32 flex items-center justify-center opacity-50 italic">Loading...</div>
            ) : habits.map(habit => (
              <motion.div 
                key={habit.id}
                whileHover={{ scale: 1.02 }}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                  habit.completed ? 'bg-primary/5 opacity-60' : 'bg-white/5'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  habit.completed ? 'bg-primary text-background' : 'bg-white/10 text-muted-foreground'
                }`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className={`font-bold tracking-tight ${habit.completed ? 'line-through' : ''}`}>
                    {habit.title}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <Button className="w-full mt-6 rounded-2xl bg-white/5 hover:bg-white/10 text-foreground font-bold h-12">
            Manage Habits
          </Button>
        </section>

        {/* Quick Actions Widget */}
        <section className="glass p-6 rounded-[2rem] border border-white/5">
          <h3 className="text-lg font-black tracking-tight mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <motion.button 
              whileHover={{ y: -4 }}
              className="aspect-square glass rounded-3xl flex flex-col items-center justify-center gap-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 fill-orange-500" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Start Focus</span>
            </motion.button>
            
            <motion.button 
              whileHover={{ y: -4 }}
              className="aspect-square glass rounded-3xl flex flex-col items-center justify-center gap-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">CEO Mode</span>
            </motion.button>
          </div>
        </section>

        {/* Productivity Trends Widget */}
        <section className="glass p-6 rounded-[2rem] border border-white/5 lg:col-span-1 md:col-span-2">
          <h3 className="text-lg font-black tracking-tight mb-6">Execution Trend</h3>
          <div className="h-48 flex items-end justify-between gap-2 px-2">
            {[40, 70, 45, 90, 65, 80, 100].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${val}%` }}
                  className={`w-full rounded-t-xl ${i === 6 ? 'bg-primary shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`}
                />
                <span className="text-[10px] font-bold text-muted-foreground">MTWTFSS"[i]</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
