import React, { useState, useEffect } from 'react';
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
import { Cake } from 'lucide-react';

export default function EventModal({ open, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: format(new Date(), 'yyyy-MM-dd'),
    event_time: '09:00',
    duration_minutes: 60,
    is_birthday: false,
    birthday_person_name: '',
    birthday_relationship: '',
    birthday_notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = { ...formData };
    if (formData.is_birthday) {
      const year = new Date(formData.event_date).getFullYear();
      dataToSubmit.birthday_base_year = year;
    }
    onSubmit(dataToSubmit);
    setFormData({
      title: '',
      description: '',
      event_date: format(new Date(), 'yyyy-MM-dd'),
      event_time: '09:00',
      duration_minutes: 60,
      is_birthday: false,
      birthday_person_name: '',
      birthday_relationship: '',
      birthday_notes: ''
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
          <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
            <input
              type="checkbox"
              id="is_birthday"
              checked={formData.is_birthday}
              onChange={(e) => setFormData({ ...formData, is_birthday: e.target.checked })}
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-pink-500 focus:ring-pink-500"
            />
            <label htmlFor="is_birthday" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
              <Cake className="w-4 h-4 text-pink-400" />
              Anniversaire
            </label>
          </div>

          {formData.is_birthday ? (
            <>
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Nom de la personne</label>
                <Input
                  value={formData.birthday_person_name}
                  onChange={(e) => setFormData({ ...formData, birthday_person_name: e.target.value })}
                  placeholder="e.g., Marie"
                  className="bg-zinc-800 border-zinc-700"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Relation</label>
                <Input
                  value={formData.birthday_relationship}
                  onChange={(e) => setFormData({ ...formData, birthday_relationship: e.target.value })}
                  placeholder="e.g., Amie, Collègue, Famille"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Notes (Optionnel)</label>
                <Textarea
                  value={formData.birthday_notes}
                  onChange={(e) => setFormData({ ...formData, birthday_notes: e.target.value })}
                  placeholder="Cadeaux, préférences, etc."
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </>
          ) : (
            <>
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
            </>
          )}

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

          {!formData.is_birthday && (
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
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-white text-black hover:bg-zinc-200">
              {formData.is_birthday ? 'Créer Anniversaire' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}