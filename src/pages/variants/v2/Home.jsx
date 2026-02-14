import React from 'react';
import { motion } from 'framer-motion';
import { Home, Grid, Settings, Bell, Search, Mic, Zap } from 'lucide-react';

// V2: The Glass OS (VisionOS-inspired)
// Heavy glassmorphism, floating dock, spatial depth.

const V2Home = () => {
  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center text-white font-sans overflow-hidden">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      <div className="relative z-10 p-6 flex flex-col h-screen">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h1 className="text-3xl font-thin tracking-tight text-white drop-shadow-md">Sunday, Feb 1</h1>
            <p className="text-white/70 font-medium">Good afternoon</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-10 h-10" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="mx-auto w-full max-w-md h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center px-4 gap-3 shadow-xl mb-8">
          <Search className="w-5 h-5 text-white/50" />
          <input type="text" placeholder="Search apps..." className="bg-transparent border-none outline-none text-white placeholder:text-white/50 w-full" />
          <Mic className="w-5 h-5 text-white/50" />
        </div>

        {/* App Grid */}
        <div className="grid grid-cols-2 gap-4 auto-rows-fr">
          <GlassCard title="Focus" icon="🎯" color="bg-orange-500" size="large">
            <div className="mt-2 text-2xl font-bold">2h 15m</div>
            <div className="text-xs opacity-70">Deep Work Today</div>
          </GlassCard>
          
          <div className="grid grid-rows-2 gap-4">
            <GlassCard title="Tasks" icon="✅" color="bg-blue-500" />
            <GlassCard title="Calendar" icon="📅" color="bg-red-500" />
          </div>

          <GlassCard title="Habits" icon="🔥" color="bg-green-500" size="wide" className="col-span-2">
            <div className="flex justify-between items-center mt-2 px-2">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-white/20 border border-white/10 backdrop-blur-md" />)}
              </div>
              <span className="text-sm font-bold">3/5 Completed</span>
            </div>
          </GlassCard>
        </div>

        {/* Floating Dock */}
        <div className="mt-auto mb-6 mx-auto">
          <div className="h-20 px-6 rounded-[2rem] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex items-center gap-6">
            <DockIcon icon={Home} active />
            <DockIcon icon={Grid} />
            <div className="w-16 h-16 -mt-12 rounded-full bg-white backdrop-blur-xl border border-white/50 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              <Zap className="w-8 h-8 text-black fill-black" />
            </div>
            <DockIcon icon={Bell} />
            <DockIcon icon={Settings} />
          </div>
        </div>
      </div>
    </div>
  );
};

const GlassCard = ({ title, icon, color, children, className = "" }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`p-5 rounded-[1.5rem] bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg flex flex-col justify-between ${className}`}
  >
    <div className="flex justify-between items-start">
      <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center shadow-inner`}>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="w-2 h-2 rounded-full bg-white/50" />
    </div>
    <div>
      <h3 className="font-bold text-lg tracking-tight text-white/90">{title}</h3>
      {children}
    </div>
  </motion.div>
);

const DockIcon = ({ icon: Icon, active }) => (
  <motion.button 
    whileHover={{ y: -5 }}
    className={`p-3 rounded-2xl transition-all ${active ? 'bg-white/20' : 'hover:bg-white/10'}`}
  >
    <Icon className="w-6 h-6 text-white" />
  </motion.button>
);

export default V2Home;
