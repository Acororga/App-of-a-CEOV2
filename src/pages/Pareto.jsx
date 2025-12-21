import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Plus, Circle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Pareto() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  const { data: tasks } = useQuery({
    queryKey: ['paretoTasks'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.ParetoTask.filter({ created_by: user.email }, 'sort_order');
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ taskId, completed }) => {
      await base44.entities.ParetoTask.update(taskId, {
        completed,
        completed_date: completed ? new Date().toISOString() : null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['paretoTasks']);
      queryClient.invalidateQueries(['topTasks']);
    }
  });

  const filteredTasks = tasks?.filter(task => {
    if (filter === 'all') return true;
    return task.impact_level === filter;
  });

  const getImpactColor = (level) => {
    switch(level) {
      case 'high': return { bg: 'bg-red-950', border: 'border-red-900', text: 'text-red-400', icon: '⭐' };
      case 'medium': return { bg: 'bg-yellow-950', border: 'border-yellow-900', text: 'text-yellow-400', icon: '🔶' };
      case 'low': return { bg: 'bg-gray-900', border: 'border-gray-800', text: 'text-gray-400', icon: '⚪' };
      default: return { bg: 'bg-gray-900', border: 'border-gray-800', text: 'text-gray-400', icon: '⚪' };
    }
  };

  const highTasks = filteredTasks?.filter(t => t.impact_level === 'high' && !t.completed) || [];
  const mediumTasks = filteredTasks?.filter(t => t.impact_level === 'medium' && !t.completed) || [];
  const lowTasks = filteredTasks?.filter(t => t.impact_level === 'low' && !t.completed) || [];
  const completedTasks = filteredTasks?.filter(t => t.completed) || [];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-gray-400 mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Home</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Pareto Matrix</h1>
          <p className="text-sm text-gray-500">80/20 Task Prioritization</p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'high', 'medium', 'low'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-white text-black'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {highTasks.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-red-500">⭐</span>
              <h2 className="text-lg font-semibold text-gray-300">HIGH IMPACT</h2>
            </div>
            <div className="space-y-2">
              {highTasks.map(task => {
                const colors = getImpactColor(task.impact_level);
                return (
                  <button
                    key={task.id}
                    onClick={() => toggleMutation.mutate({ taskId: task.id, completed: !task.completed })}
                    className={`w-full flex items-start gap-3 p-4 rounded-lg ${colors.bg} border ${colors.border} hover:opacity-80 transition-all text-left`}
                  >
                    <Circle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-gray-500 mt-1">{task.description}</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mediumTasks.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-yellow-500">🔶</span>
              <h2 className="text-lg font-semibold text-gray-300">MEDIUM IMPACT</h2>
            </div>
            <div className="space-y-2">
              {mediumTasks.map(task => {
                const colors = getImpactColor(task.impact_level);
                return (
                  <button
                    key={task.id}
                    onClick={() => toggleMutation.mutate({ taskId: task.id, completed: !task.completed })}
                    className={`w-full flex items-start gap-3 p-4 rounded-lg ${colors.bg} border ${colors.border} hover:opacity-80 transition-all text-left`}
                  >
                    <Circle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-gray-500 mt-1">{task.description}</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {lowTasks.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gray-500">⚪</span>
              <h2 className="text-lg font-semibold text-gray-300">LOW IMPACT</h2>
            </div>
            <div className="space-y-2">
              {lowTasks.map(task => {
                const colors = getImpactColor(task.impact_level);
                return (
                  <button
                    key={task.id}
                    onClick={() => toggleMutation.mutate({ taskId: task.id, completed: !task.completed })}
                    className={`w-full flex items-start gap-3 p-4 rounded-lg ${colors.bg} border ${colors.border} hover:opacity-80 transition-all text-left`}
                  >
                    <Circle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-gray-500 mt-1">{task.description}</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold text-gray-300">COMPLETED</h2>
            </div>
            <div className="space-y-2">
              {completedTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => toggleMutation.mutate({ taskId: task.id, completed: false })}
                  className="w-full flex items-start gap-3 p-4 rounded-lg bg-gray-900 border border-gray-800 opacity-50 hover:opacity-70 transition-all text-left"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium line-through">{task.title}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {(!tasks || tasks.length === 0) && (
          <div className="text-center py-12 text-gray-600">
            No tasks yet. Add your first task!
          </div>
        )}

        <Button className="w-full bg-gray-900 border border-gray-800 hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>
    </div>
  );
}