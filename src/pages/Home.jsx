import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  ClipboardList, 
  CheckSquare, 
  Calendar, 
  Shield, 
  Zap, 
  FileText, 
  Trophy,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../components/LanguageProvider';

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const apps = [
    { id: 'Pareto', name: t('todo'), icon: ClipboardList, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'Habits', name: t('habits'), icon: CheckSquare, color: 'text-green-400', bg: 'bg-green-400/10' },
    { id: 'Calendar', name: t('schedule'), icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'ScreenTimeManager', name: t('screenTime'), icon: Activity, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 'Notes', name: 'Notes', icon: FileText, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { id: 'Leaderboard', name: 'Ranks', icon: Trophy, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <header className="mb-12 text-center">
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-black tracking-tight mb-2"
        >
          Good day, {user?.full_name?.split(' ')[0] || 'CEO'}.
        </motion.h1>
        <motion.p 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground font-medium"
        >
          Select an instrument of productivity.
        </motion.p>
      </header>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
      >
        {apps.map((app) => (
          <motion.button
            key={app.id}
            variants={item}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(createPageUrl(app.id))}
            className="aspect-square glass rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-4 group transition-all hover:bg-white/10"
          >
            <div className={`w-16 h-16 rounded-[1.5rem] ${app.bg} ${app.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
              <app.icon size={32} />
            </div>
            <span className="font-bold tracking-tight text-sm opacity-80">{app.name}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Focus Mode Quick Launch */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12"
      >
        <button 
          onClick={() => navigate(createPageUrl('FocusMode'))}
          className="w-full glass rounded-[2.5rem] p-8 flex items-center justify-between group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-500 flex items-center justify-center">
              <Zap className="fill-orange-500" />
            </div>
            <div className="text-left">
              <div className="text-xl font-black tracking-tight">Initiate Focus</div>
              <div className="text-sm text-muted-foreground font-medium">Activate distraction filters immediately.</div>
            </div>
          </div>
          <motion.div 
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="relative z-10"
          >
            <Shield className="w-8 h-8 opacity-20" />
          </motion.div>
        </button>
      </motion.section>
    </div>
  );
}
