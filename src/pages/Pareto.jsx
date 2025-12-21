import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tantml:react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function Pareto() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    time_duration: '1h',
    importance_level: 'average'
  });

  const { data: tasks } = useQuery({
    queryKey: ['paretoTasks'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.ParetoTask.filter({ 
        created_by: user.email,
        completed: false
      });
    }
  });

  const createMutation = useMutation({
    mutationFn: async (taskData) => {
      const user = await base44.auth.me();
      
      // Calculate positions
      const timeMap = { '<30min': 5, '1h': 4, '2h': 3, 'half_day': 2, 'day': 1, 'several_days': 0 };
      const importanceMap = { 'crucial': 4, 'essential': 3, 'average': 2, 'low': 1 };
      
      const position_x = timeMap[taskData.time_duration];
      const position_y = importanceMap[taskData.importance_level];
      
      await base44.entities.ParetoTask.create({
        ...taskData,
        position_x,
        position_y,
        created_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['paretoTasks']);
      setShowForm(false);
      setNewTask({ title: '', time_duration: '1h', importance_level: 'average' });
    }
  });

  const completeMutation = useMutation({
    mutationFn: async (taskId) => {
      await base44.entities.ParetoTask.update(taskId, {
        completed: true,
        completed_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['paretoTasks']);
      queryClient.invalidateQueries(['topParetoTasks']);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTask.title.trim()) {
      createMutation.mutate(newTask);
    }
  };

  // Matrix dimensions and positioning
  const MATRIX_SIZE = 300;
  const CELL_SIZE = MATRIX_SIZE / 5;
  
  const getTaskPosition = (task) => {
    // X: 0 (several_days) to 5 (<30min) - left to right
    // Y: 1 (low) to 4 (crucial) - bottom to top (inverted for display)
    const x = (task.position_x || 2) * CELL_SIZE + CELL_SIZE / 2;
    const y = MATRIX_SIZE - ((task.position_y || 2) * CELL_SIZE + CELL_SIZE / 2);
    return { x, y };
  };

  const getImportanceColor = (level) => {
    switch(level) {
      case 'crucial': return 'bg-red-600 border-red-500';
      case 'essential': return 'bg-orange-600 border-orange-500';
      case 'average': return 'bg-yellow-600 border-yellow-500';
      case 'low': return 'bg-zinc-600 border-zinc-500';
      default: return 'bg-zinc-600 border-zinc-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Home</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Pareto Matrix
          </h1>
          <p className="text-sm text-zinc-500 font-medium">80/20 Task Prioritization</p>
        </div>

        {showForm && (
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-2xl blur-xl" />
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Add New Action</h2>
                <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Action</label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="What needs to be done?"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Time Duration</label>
                  <Select 
                    value={newTask.time_duration} 
                    onValueChange={(value) => setNewTask({...newTask, time_duration: value})}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<30min">Less than 30 minutes</SelectItem>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="2h">2 hours</SelectItem>
                      <SelectItem value="half_day">Half a day</SelectItem>
                      <SelectItem value="day">A day</SelectItem>
                      <SelectItem value="several_days">Several days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Importance & Impact</label>
                  <Select 
                    value={newTask.importance_level} 
                    onValueChange={(value) => setNewTask({...newTask, importance_level: value})}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crucial">Crucial</SelectItem>
                      <SelectItem value="essential">Essential</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="low">Low Importance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || !newTask.title.trim()}
                  className="w-full bg-white text-black hover:bg-zinc-200"
                >
                  {createMutation.isPending ? 'Adding...' : 'Add to Matrix'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            className="w-full mb-8 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Action
          </Button>
        )}

        {/* Pareto Matrix */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 rounded-2xl blur-2xl" />
          <div className="relative p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 shadow-2xl overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Matrix Container */}
              <div className="relative" style={{ width: MATRIX_SIZE + 100, height: MATRIX_SIZE + 100, margin: '0 auto' }}>
                {/* Y-axis label */}
                <div 
                  className="absolute text-xs font-semibold text-zinc-500 uppercase tracking-wider"
                  style={{ 
                    left: -50, 
                    top: '50%', 
                    transform: 'translateY(-50%) rotate(-90deg)',
                    transformOrigin: 'center'
                  }}
                >
                  Importance
                </div>

                {/* Y-axis labels */}
                <div className="absolute" style={{ left: -10, top: 0, textAlign: 'right', width: 80 }}>
                  <div className="text-xs text-red-400">Crucial</div>
                </div>
                <div className="absolute" style={{ left: -10, top: CELL_SIZE, textAlign: 'right', width: 80 }}>
                  <div className="text-xs text-orange-400">Essential</div>
                </div>
                <div className="absolute" style={{ left: -10, top: CELL_SIZE * 2, textAlign: 'right', width: 80 }}>
                  <div className="text-xs text-yellow-400">Average</div>
                </div>
                <div className="absolute" style={{ left: -10, top: CELL_SIZE * 3, textAlign: 'right', width: 80 }}>
                  <div className="text-xs text-zinc-500">Low</div>
                </div>

                {/* X-axis labels */}
                <div className="absolute" style={{ left: 0, bottom: -30, width: CELL_SIZE }}>
                  <div className="text-xs text-zinc-500 text-center">Days</div>
                </div>
                <div className="absolute" style={{ left: CELL_SIZE, bottom: -30, width: CELL_SIZE }}>
                  <div className="text-xs text-zinc-500 text-center">1 Day</div>
                </div>
                <div className="absolute" style={{ left: CELL_SIZE * 2, bottom: -30, width: CELL_SIZE }}>
                  <div className="text-xs text-zinc-500 text-center">½ Day</div>
                </div>
                <div className="absolute" style={{ left: CELL_SIZE * 3, bottom: -30, width: CELL_SIZE }}>
                  <div className="text-xs text-zinc-500 text-center">2h</div>
                </div>
                <div className="absolute" style={{ left: CELL_SIZE * 4, bottom: -30, width: CELL_SIZE }}>
                  <div className="text-xs text-zinc-500 text-center">1h</div>
                </div>
                <div className="absolute" style={{ left: CELL_SIZE * 5, bottom: -30, width: CELL_SIZE }}>
                  <div className="text-xs text-zinc-500 text-center"><30m</div>
                </div>

                {/* X-axis label */}
                <div 
                  className="absolute text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center"
                  style={{ 
                    bottom: -60, 
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  Time Required
                </div>

                {/* Grid */}
                <svg width={MATRIX_SIZE} height={MATRIX_SIZE} className="absolute top-0 left-0">
                  {/* Vertical lines */}
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <line 
                      key={`v${i}`}
                      x1={i * CELL_SIZE} 
                      y1={0} 
                      x2={i * CELL_SIZE} 
                      y2={MATRIX_SIZE}
                      stroke="#27272a"
                      strokeWidth="1"
                    />
                  ))}
                  {/* Horizontal lines */}
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <line 
                      key={`h${i}`}
                      x1={0} 
                      y1={i * CELL_SIZE} 
                      x2={MATRIX_SIZE} 
                      y2={i * CELL_SIZE}
                      stroke="#27272a"
                      strokeWidth="1"
                    />
                  ))}
                  {/* Center lines (bold) */}
                  <line 
                    x1={MATRIX_SIZE / 2} 
                    y1={0} 
                    x2={MATRIX_SIZE / 2} 
                    y2={MATRIX_SIZE}
                    stroke="#52525b"
                    strokeWidth="2"
                  />
                  <line 
                    x1={0} 
                    y1={MATRIX_SIZE / 2} 
                    x2={MATRIX_SIZE} 
                    y2={MATRIX_SIZE / 2}
                    stroke="#52525b"
                    strokeWidth="2"
                  />
                </svg>

                {/* Tasks */}
                {tasks?.map(task => {
                  const pos = getTaskPosition(task);
                  return (
                    <button
                      key={task.id}
                      onClick={() => completeMutation.mutate(task.id)}
                      className={`absolute group`}
                      style={{
                        left: pos.x - 30,
                        top: pos.y - 12,
                        width: 60,
                        height: 24
                      }}
                      title={task.title}
                    >
                      <div className={`px-2 py-1 rounded-lg border ${getImportanceColor(task.importance_level)} text-white text-xs font-medium shadow-lg hover:shadow-xl transition-all truncate group-hover:scale-110`}>
                        {task.title}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-12 pt-6 border-t border-zinc-800">
                <div className="text-xs text-zinc-500 mb-3 font-semibold uppercase tracking-wider">Priority Zones</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-600" />
                    <span className="text-zinc-400">Top Right: Quick Wins (High Impact, Low Time)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-orange-600" />
                    <span className="text-zinc-400">Top Left: Major Projects (High Impact, High Time)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-yellow-600" />
                    <span className="text-zinc-400">Bottom Right: Fill-ins (Low Impact, Low Time)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-zinc-600" />
                    <span className="text-zinc-400">Bottom Left: Time Wasters (Low Impact, High Time)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {(!tasks || tasks.length === 0) && !showForm && (
          <div className="text-center py-12 text-zinc-600">
            No tasks yet. Add your first action to see it on the matrix!
          </div>
        )}
      </div>
    </div>
  );
}