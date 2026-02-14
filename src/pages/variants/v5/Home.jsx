import React from 'react';
import { motion } from 'framer-motion';
import { Target, Terminal, Cpu, ShieldAlert } from 'lucide-react';

// V5: The Futuristic HUD (Sci-fi/Cyberpunk lite)
// Thin lines, neon accents, data-heavy look.

const V5Home = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-[#00ff9d] font-mono p-4 overflow-hidden relative selection:bg-[#00ff9d]/30">
      
      {/* Grid Background */}
      <div className="fixed inset-0" 
           style={{ backgroundImage: 'linear-gradient(rgba(0, 255, 157, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 157, 0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
      />

      {/* Header HUD */}
      <header className="relative z-10 flex justify-between items-start mb-8 border-b border-[#00ff9d]/20 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">SYS.STATUS</h1>
          <div className="text-xs text-[#00ff9d]/60">v2.0.45 // ONLINE</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">09:41</div>
          <div className="text-[10px] text-[#00ff9d] animate-pulse">● SECURE CONNECTION</div>
        </div>
      </header>

      {/* Main Focus Target */}
      <div className="relative z-10 mb-8 p-1">
        <div className="border border-[#00ff9d]/30 bg-[#00ff9d]/5 p-6 relative clip-corners">
          {/* Decorative Corners */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#00ff9d]" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00ff9d]" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#00ff9d]" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#00ff9d]" />

          <div className="flex items-center gap-4 mb-4">
            <Target className="w-6 h-6 animate-spin-slow" />
            <h2 className="text-sm font-bold tracking-widest text-white">CURRENT OBJECTIVE</h2>
          </div>
          
          <div className="text-xl font-bold text-white mb-2">Q1 REPORT ANALYSIS</div>
          <div className="w-full bg-[#00ff9d]/10 h-1 mt-2">
            <div className="bg-[#00ff9d] h-full w-[70%]" />
          </div>
          <div className="flex justify-between text-[10px] mt-1 text-[#00ff9d]/60">
            <span>PROGRESS</span>
            <span>70%</span>
          </div>
        </div>
      </div>

      {/* Data Rows */}
      <div className="relative z-10 space-y-2">
        {[
          { label: 'COGNITIVE LOAD', val: '45%', icon: Cpu },
          { label: 'THREAT LEVEL', val: 'LOW', icon: ShieldAlert },
          { label: 'TASKS PENDING', val: '04', icon: Terminal },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-3 border border-[#00ff9d]/20 bg-black hover:bg-[#00ff9d]/10 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4 text-[#00ff9d]" />
              <span className="text-xs font-bold tracking-wider text-white">{item.label}</span>
            </div>
            <span className="font-mono text-sm text-[#00ff9d]">{item.val}</span>
          </div>
        ))}
      </div>

      {/* Footer Command Line */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-[#00ff9d]/20 z-20">
        <div className="flex gap-2 text-xs font-mono">
          <span className="text-[#00ff9d]">{'>'}</span>
          <span className="animate-pulse">_</span>
        </div>
      </div>

      <style>{`
        .clip-corners {
          clip-path: polygon(
            0 10px, 10px 0, 
            calc(100% - 10px) 0, 100% 10px, 
            100% calc(100% - 10px), calc(100% - 10px) 100%, 
            10px 100%, 0 calc(100% - 10px)
          );
        }
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default V5Home;
