import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Pareto() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    time_duration: '1_hour',
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

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const user = await base44.auth.me();
      return await base44.entities.ParetoTask.create({
        ...taskData,
        created_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['paretoTasks']);
      queryClient.invalidateQueries(['topTasks']);
      setShowAddForm(false);
      setNewTask({ title: '', time_duration: '1_hour', importance_level: 'average' });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      await base44.entities.ParetoTask.delete(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['paretoTasks']);
      queryClient.invalidateQueries(['topTasks']);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTask.title.trim()) {
      createTaskMutation.mutate(newTask);
    }
  };

  // Calculate position on matrix (0-100 for both x and y)
  const getMatrixPosition = (task) => {
    // X-axis: Time (less time = more right, more time = more left)
    const timePositions = {
      less_than_30min: 85,
      '1_hour': 70,
      '2_hours': 55,
      half_day: 40,
      '1_day': 25,
      several_days: 10
    };

    // Y-axis: Importance (more important = higher)
    const importancePositions = {
      crucial: 85,
      essential: 60,
      average: 35,
      low: 10
    };

    return {
      x: timePositions[task.time_duration] || 50,
      y: importancePositions[task.importance_level] || 50
    };
  };

  const getTaskColor = (importance) => {
    const colors = {
      crucial: 'bg-red-500',
      essential: 'bg-yellow-500',
      average: 'bg-blue-500',
      low: 'bg-zinc-500'
    };
    return colors[importance] || 'bg-zinc-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Home</span>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Pareto Matrix
            </h1>
            <p className="text-sm text-zinc-500 font-medium">80/20 Task Prioritization</p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-white text-black hover:bg-zinc-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Add Task Form */}
        {showAddForm && (
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl" />
            <form onSubmit={handleSubmit} className="relative p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">New Task</h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Task Name</label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter action/task..."
                    className="bg-zinc-900 border-zinc-700"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Time Duration</label>
                  <Select
                    value={newTask.time_duration}
                    onValueChange={(value) => setNewTask({ ...newTask, time_duration: value })}
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="less_than_30min">Less than 30 minutes</SelectItem>
                      <SelectItem value="1_hour">1 hour</SelectItem>
                      <SelectItem value="2_hours">2 hours</SelectItem>
                      <SelectItem value="half_day">Half a day</SelectItem>
                      <SelectItem value="1_day">1 day</SelectItem>
                      <SelectItem value="several_days">Several days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Importance Level</label>
                  <Select
                    value={newTask.importance_level}
                    onValueChange={(value) => setNewTask({ ...newTask, importance_level: value })}
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-700">
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
                  disabled={!newTask.title.trim() || createTaskMutation.isPending}
                  className="w-full bg-white text-black hover:bg-zinc-200"
                >
                  {createTaskMutation.isPending ? 'Adding...' : 'Add to Matrix'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Matrix Visualization */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-zinc-900/20 rounded-3xl blur-2xl" />
          <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 p-8 overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-8 border-l-2 border-b-2 border-zinc-700">
              {/* Vertical center line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-700/50" />
              {/* Horizontal center line */}
              <div className="absolute left-0 right-0 top-1/2 h-px bg-zinc-700/50" />
            </div>

            {/* Axis Labels */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-zinc-500 font-medium">
              TIME REQUIRED →
            </div>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-zinc-500 font-medium">
              IMPORTANCE →
            </div>

            {/* Corner Labels */}
            <div className="absolute top-10 right-10 text-xs text-emerald-400 font-semibold">
              HIGH PRIORITY
            </div>
            <div className="absolute bottom-10 left-10 text-xs text-red-400 font-semibold">
              LOW PRIORITY
            </div>

            {/* Tasks */}
            <div className="absolute inset-8">
              {tasks?.map(task => {
                const pos = getMatrixPosition(task);
                return (
                  <div
                    key={task.id}
                    className="absolute group"
                    style={{
                      left: `${pos.x}%`,
                      bottom: `${pos.y}%`,
                      transform: 'translate(-50%, 50%)'
                    }}
                  >
                    <div className="relative">
                      {/* Glow effect */}
                      <div className={`absolute inset-0 ${getTaskColor(task.importance_level)} rounded-full blur-lg opacity-50`} />
                      
                      {/* Task dot */}
                      <div className={`relative w-4 h-4 ${getTaskColor(task.importance_level)} rounded-full border-2 border-white/20 cursor-pointer transition-transform hover:scale-150`} />
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="bg-black border border-zinc-700 rounded-lg p-3 min-w-[200px] shadow-xl">
                          <div className="font-semibold text-sm mb-2">{task.title}</div>
                          <div className="space-y-1 text-xs text-zinc-400">
                            <div>Time: {task.time_duration.replace(/_/g, ' ')}</div>
                            <div>Importance: {task.importance_level}</div>
                          </div>
                          <button
                            onClick={() => deleteTaskMutation.mutate(task.id)}
                            className="mt-2 text-xs text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {!tasks || tasks.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-zinc-600">
                  <div className="text-lg font-semibold mb-2">No tasks yet</div>
                  <div className="text-sm">Add your first task to visualize priorities</div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-xs text-zinc-500">Crucial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-xs text-zinc-500">Essential</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-xs text-zinc-500">Average</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-zinc-500 rounded-full" />
            <span className="text-xs text-zinc-500">Low</span>
          </div>
        </div>
      </div>
    </div>
  );
}