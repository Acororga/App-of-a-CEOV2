import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, AlertCircle } from 'lucide-react';
import { format, addHours, addMinutes } from 'date-fns';

export default function RestPeriodModal({ open, onClose, onSchedule, isInFocusMode }) {
  const [duration, setDuration] = useState(30);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSchedule = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for your break');
      return;
    }

    if (isInFocusMode) {
      setError('Cannot schedule breaks while in Focus Mode');
      return;
    }

    // Calculate earliest possible start time (2 hours from now)
    const now = new Date();
    const earliestStart = addHours(now, 2);

    onSchedule({
      scheduled_start_time: earliestStart.toISOString(),
      duration_minutes: duration,
      reason: reason.trim()
    });

    setReason('');
    setDuration(30);
    setError('');
  };

  const now = new Date();
  const earliestStart = addHours(now, 2);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <Clock className="w-5 h-5 text-blue-400" />
            Schedule Rest Period
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {isInFocusMode && (
            <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/40 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-300">
                You cannot schedule breaks while in Focus Mode. Exit Focus Mode first.
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2 block">
              Break Duration
            </label>
            <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="180">3 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2 block">
              Reason for Break
            </label>
            <Textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder="E.g., Lunch break, Family time, Important call..."
              className="bg-zinc-800 border-zinc-700 h-24 resize-none"
            />
          </div>

          <div className="p-3 rounded-lg bg-zinc-850/60 border border-zinc-800/60">
            <div className="text-xs text-zinc-500 mb-1">Break will start at:</div>
            <div className="text-sm font-bold text-blue-400">
              {format(earliestStart, 'h:mm a')} (2 hours minimum advance)
            </div>
            <div className="text-xs text-zinc-600 mt-1">
              Restrictions paused for {duration} minutes
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/40 text-xs text-red-300">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-zinc-700 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={isInFocusMode}
              className="flex-1 bg-white text-black hover:bg-zinc-200 font-bold"
            >
              Schedule Break
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}