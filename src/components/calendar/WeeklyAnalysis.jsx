import React from 'react';
import { TrendingUp, Clock, Target, Calendar as CalendarIcon } from 'lucide-react';

export default function WeeklyAnalysis({ analysis }) {
  if (!analysis) return null;

  return (
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-zinc-700/10 rounded-2xl blur-xl" />
      <div className="relative p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-sm shadow-[0_16px_64px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-3 mb-5">
          <TrendingUp className="w-5 h-5 text-zinc-500" />
          <h3 className="text-base font-black text-zinc-300 tracking-tight">Week Overview</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <CalendarIcon className="w-5 h-5 mx-auto mb-2 text-zinc-500" />
            <div className="text-2xl font-black text-white mb-1 tabular-nums">{analysis.totalEventHours}h</div>
            <div className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold">Scheduled</div>
          </div>

          <div className="text-center p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <Target className="w-5 h-5 mx-auto mb-2 text-zinc-500" />
            <div className="text-2xl font-black text-white mb-1 tabular-nums">{analysis.importantEventHours}h</div>
            <div className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold">Important</div>
          </div>

          <div className="text-center p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <Clock className="w-5 h-5 mx-auto mb-2 text-zinc-500" />
            <div className="text-2xl font-black text-white mb-1 tabular-nums">{analysis.freeTimeHours}h</div>
            <div className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold">Free Time</div>
          </div>

          <div className="text-center p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 text-zinc-500" />
            <div className="text-2xl font-black text-white mb-1 tabular-nums">{analysis.percentageImportant}%</div>
            <div className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold">Priority</div>
          </div>
        </div>

        <div className="mt-4 text-xs text-zinc-500 text-center">
          {analysis.percentageFree}% of waking hours remain free
        </div>
      </div>
    </div>
  );
}