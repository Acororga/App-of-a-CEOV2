import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from 'date-fns';

export default function EventModal({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: format(new Date(), 'yyyy-MM-dd'),
    event_time: '09:00',
    duration_minutes: 60
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      event_date: format(new Date(), 'yyyy-MM-dd'),
      event_time: '09:00',
      duration_minutes: 60
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Team meeting"
              className="bg-zinc-800 border-zinc-700"
              required
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Description (Optional)</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add event details"
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Date</label>
              <Input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="bg-zinc-800 border-zinc-700"
                required
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Time</label>
              <Input
                type="time"
                value={formData.event_time}
                onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                className="bg-zinc-800 border-zinc-700"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Duration (minutes)</label>
            <Input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              min="15"
              step="15"
              className="bg-zinc-800 border-zinc-700"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-white text-black hover:bg-zinc-200">
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}