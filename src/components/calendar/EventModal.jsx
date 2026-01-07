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
import { useLanguage } from '../LanguageProvider';

export default function EventModal({ open, onClose, onSubmit, initialData }) {
  const { t } = useLanguage();
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
          <DialogTitle>{t('createNewEvent')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, is_birthday: !formData.is_birthday })}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
              formData.is_birthday
                ? 'bg-gradient-to-br from-pink-950/60 to-purple-950/60 border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.3)]'
                : 'bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-600/50'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              formData.is_birthday
                ? 'bg-gradient-to-br from-pink-500 to-purple-500 shadow-lg'
                : 'bg-zinc-700/50'
            }`}>
              <Cake className={`w-5 h-5 ${formData.is_birthday ? 'text-white' : 'text-zinc-400'}`} />
            </div>
            <div className="flex-1 text-left">
              <div className={`font-bold text-sm ${formData.is_birthday ? 'text-pink-200' : 'text-zinc-400'}`}>
                🎂 {t('birthday')}
              </div>
              <div className="text-xs text-zinc-500">
                {formData.is_birthday ? t('modeActivated') : t('clickToActivate')}
              </div>
            </div>
          </button>

          {formData.is_birthday ? (
            <>
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">{t('personName')}</label>
                <Input
                  value={formData.birthday_person_name}
                  onChange={(e) => setFormData({ ...formData, birthday_person_name: e.target.value })}
                  placeholder="e.g., Marie"
                  className="bg-zinc-800 border-zinc-700"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-2 block">{t('relationship')}</label>
                <Input
                  value={formData.birthday_relationship}
                  onChange={(e) => setFormData({ ...formData, birthday_relationship: e.target.value })}
                  placeholder="e.g., Amie, Collègue, Famille"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-2 block">{t('notesOptional')}</label>
                <Textarea
                  value={formData.birthday_notes}
                  onChange={(e) => setFormData({ ...formData, birthday_notes: e.target.value })}
                  placeholder={t('giftPreferences')}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">{t('titleEvent')}</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('teamMeeting')}
                  className="bg-zinc-800 border-zinc-700"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-2 block">{t('descriptionOptional')}</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('addEventDetails')}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </>
          )}

          <div className={formData.is_birthday ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 gap-4"}>
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">{t('date')}</label>
              <Input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="bg-zinc-800 border-zinc-700"
                required
              />
            </div>

            {!formData.is_birthday && (
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">{t('time')}</label>
                <Input
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                  required
                />
              </div>
            )}
          </div>

          {!formData.is_birthday && (
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">{t('durationMinutes')}</label>
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
              {t('cancel')}
            </Button>
            <Button type="submit" className="flex-1 bg-white text-black hover:bg-zinc-200">
              {formData.is_birthday ? t('createBirthday') : t('createEvent')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}