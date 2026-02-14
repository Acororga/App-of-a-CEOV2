import React from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, List, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

// V1: The Minimalist Monolith (Opal-inspired)
// Deep blacks, central focus ring, bottom sheet nav.

const V1Home = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30">
      {/* Dynamic Background Gradient (Subtle) */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen px-6 pb-24 pt-12">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
              <User className="w-4 h-4 text-zinc-400" />
            </div>
            <span className="text-sm font-bold text-zinc-400">Good Morning</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400">
            Panda 🐼
          </div>
        </header>

        {/* Central Focus Ring */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-12">
          <div className="relative w-72 h-72 flex items-center justify-center">
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full animate-pulse" />
            
            {/* Ring SVG */}
            <svg className="w-full h-full -rotate-90">
              <circle cx="144" cy="144" r="130" stroke="#18181b" strokeWidth="8" fill="none" />
              <motion.circle 
                cx="144" cy="144" r="130" 
                stroke="#6366f1" strokeWidth="8" fill="none" strokeLinecap="round"
                initial={{ strokeDasharray: 816, strokeDashoffset: 816 }}
                animate={{ strokeDashoffset: 816 * 0.35 }} // 65% progress
                transition={{ duration: 2, ease: "circOut" }}
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center">
              <span className="text-6xl font-black tracking-tighter text-white">65<span className="text-2xl text-zinc-500">%</span></span>
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-2">Focus Score</span>
            </div>
          </div>

          <p className="mt-8 text-center text-zinc-400 max-w-xs text-sm leading-relaxed">
            You are efficiently blocking <span className="text-indigo-400 font-bold">Instagram</span> and <span className="text-indigo-400 font-bold">Twitter</span>.
          </p>
        </div>

        {/* Primary Action */}
        <div className="mt-auto space-y-4">
          <Button 
            className="w-full h-16 rounded-[2rem] bg-white text-black hover:bg-zinc-200 text-lg font-bold shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-transform active:scale-95"
          >
            <Zap className="w-5 h-5 mr-2 fill-black" />
            Deep Focus
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-14 rounded-[1.5rem] bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Habits
            </Button>
            <Button variant="outline" className="h-14 rounded-[1.5rem] bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-semibold">
              <List className="w-4 h-4 mr-2" />
              Tasks
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Nav (Minimal) */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-xl border-t border-zinc-900 flex items-center justify-around px-8 pb-4 z-50">
        <NavIcon icon={Zap} label="Focus" active />
        <NavIcon icon={Shield} label="Block" />
        <NavIcon icon={List} label="Stats" />
      </nav>
    </div>
  );
};

const NavIcon = ({ icon: Icon, label, active }) => (
  <button className="flex flex-col items-center gap-1 p-2">
    <Icon className={`w-6 h-6 ${active ? 'text-white' : 'text-zinc-600'}`} />
    <span className={`text-[10px] font-bold ${active ? 'text-white' : 'text-zinc-600'}`}>{label}</span>
  </button>
);

export default V1Home;
