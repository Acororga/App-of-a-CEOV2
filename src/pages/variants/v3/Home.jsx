import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronRight, Activity, Calendar, ListTodo } from 'lucide-react';

// V3: The Bento Grid (Linear/Apple Health inspired)
// Clean lines, organized grid, high density.

const V3Home = () => {
  return (
    <div className="min-h-screen bg-[#F2F2F7] text-gray-900 font-sans p-4 pb-24">
      
      {/* Header */}
      <header className="flex justify-between items-end mb-6 pt-4 px-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Summary</h2>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 overflow-hidden">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="User" />
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Main Focus Card */}
        <BentoCard className="col-span-2 bg-white text-black h-40 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <Activity className="w-6 h-6 text-orange-500" />
          </div>
          <div className="mt-auto">
            <div className="text-4xl font-black font-mono tracking-tighter">85%</div>
            <div className="text-sm font-bold text-gray-500">Focus Efficiency</div>
          </div>
          {/* Chart Graphic Placeholder */}
          <div className="absolute bottom-0 right-0 w-32 h-24 opacity-10">
            <svg viewBox="0 0 100 100" className="fill-orange-500">
              <path d="M0 100 L20 80 L40 90 L60 40 L80 60 L100 20 V100 Z" />
            </svg>
          </div>
        </BentoCard>

        {/* Square Widgets */}
        <BentoCard className="bg-white aspect-square flex flex-col justify-between">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold">5</div>
            <div className="text-xs font-semibold text-gray-500">Tasks Left</div>
          </div>
        </BentoCard>

        <BentoCard className="bg-white aspect-square flex flex-col justify-between">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold">3</div>
            <div className="text-xs font-semibold text-gray-500">Events</div>
          </div>
        </BentoCard>

        {/* Wide List Widget */}
        <BentoCard className="col-span-2 bg-white min-h-[200px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Today's Habits</h3>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            {['Morning Run', 'Read 30 mins', 'No Sugar'].map((habit, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className={`w-5 h-5 rounded-full border-2 ${i === 0 ? 'bg-green-500 border-green-500' : 'border-gray-300'}`} />
                <span className={`font-medium ${i === 0 ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{habit}</span>
              </div>
            ))}
          </div>
        </BentoCard>
      </div>

      {/* Floating Action Button */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-6 w-16 h-16 rounded-full bg-black text-white shadow-2xl flex items-center justify-center z-50"
      >
        <Plus className="w-8 h-8" />
      </motion.button>
    </div>
  );
};

const BentoCard = ({ children, className = "" }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className={`p-5 rounded-[1.5rem] shadow-sm border border-gray-200/60 ${className}`}
  >
    {children}
  </motion.div>
);

export default V3Home;
