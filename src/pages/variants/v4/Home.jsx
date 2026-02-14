import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, BarChart2, Layers } from 'lucide-react';

// V4: The Neuromorphic Tactile (Soft UI modern take)
// Soft shadows, tactile feel, claymorphism.

const V4Home = () => {
  return (
    <div className="min-h-screen bg-[#E0E5EC] text-[#4A5568] font-sans p-6 pb-24">
      
      <div className="flex justify-between items-center mb-10 mt-4">
        <div className="w-12 h-12 rounded-[12px] bg-[#E0E5EC] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] flex items-center justify-center">
          <Layers className="w-6 h-6 text-[#718096]" />
        </div>
        <div className="text-lg font-black tracking-widest text-[#A0AEC0]">N E U R O</div>
      </div>

      {/* Main Focus Control */}
      <div className="relative w-full aspect-square max-w-sm mx-auto mb-12 rounded-full bg-[#E0E5EC] shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] flex items-center justify-center">
        <div className="absolute inset-4 rounded-full border-4 border-[#E0E5EC] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff]" />
        
        <div className="z-10 text-center">
          <div className="text-5xl font-bold text-[#2D3748] mb-2">25:00</div>
          <div className="text-sm font-bold text-[#A0AEC0] uppercase tracking-wider">Focus Time</div>
        </div>

        <motion.button 
          whileTap={{ scale: 0.95, boxShadow: "inset 6px 6px 12px #b8b9be, inset -6px -6px 12px #ffffff" }}
          className="absolute bottom-10 w-16 h-16 rounded-full bg-[#E0E5EC] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] flex items-center justify-center text-orange-500"
        >
          <Play className="w-6 h-6 fill-current" />
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-6">
        <NeuroCard>
          <div className="text-xs font-bold text-[#A0AEC0] mb-2 uppercase">Tasks</div>
          <div className="text-2xl font-bold text-[#4A5568]">12</div>
          <div className="w-full h-2 bg-[#CBD5E0] rounded-full mt-3 overflow-hidden shadow-inner">
            <div className="h-full w-2/3 bg-blue-400 rounded-full" />
          </div>
        </NeuroCard>
        
        <NeuroCard>
          <div className="text-xs font-bold text-[#A0AEC0] mb-2 uppercase">Streak</div>
          <div className="text-2xl font-bold text-[#4A5568]">5 Days</div>
          <div className="flex gap-1 mt-3">
            {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 rounded-full bg-orange-400" />)}
          </div>
        </NeuroCard>
      </div>

    </div>
  );
};

const NeuroCard = ({ children }) => (
  <div className="p-5 rounded-[20px] bg-[#E0E5EC] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)]">
    {children}
  </div>
);

export default V4Home;
