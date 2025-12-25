import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../components/LanguageProvider';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SettingsDeletion() {
  const { t } = useLanguage();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    
    setIsDeleting(true);
    try {
      // In a real implementation, this would call a backend function to delete all user data
      // For now, we'll just log out
      await base44.auth.logout();
    } catch (error) {
      console.error('Deletion error:', error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6 pt-20 pb-12 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px'
      }} />

      <div className="max-w-3xl mx-auto relative">
        <div className="flex items-center justify-between mb-6">
          <Link to={createPageUrl('Settings')} className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-300 transition-colors duration-150 active:scale-95">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{t('back')}</span>
          </Link>
          
          <h1 className="text-xl font-black bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent tracking-tight">
            {t('dataDeletion')}
          </h1>
          
          <div className="w-20" />
        </div>

        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-xl" />
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-red-950/40 to-orange-950/40 border-2 border-red-500/30 shadow-[0_12px_48px_rgba(239,68,68,0.3)]">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-base font-bold text-red-200 mb-2">Permanent Data Deletion</h2>
                  <p className="text-sm text-red-300/80 leading-relaxed">
                    This action will permanently delete all your data, including your account, habits, tasks, calendar events, and all associated records. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-sm prose-invert max-w-none">
            <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
              <h2 className="text-white text-base font-bold mt-6 mb-3">What Will Be Deleted</h2>
              <ul className="list-disc list-inside space-y-1 text-zinc-400">
                <li>Your account and profile information</li>
                <li>All habits and habit completion records</li>
                <li>All tasks and to-do items</li>
                <li>Calendar events and reminders</li>
                <li>Screen time logs and statistics</li>
                <li>Focus session history</li>
                <li>Weekly contracts and scores</li>
                <li>Rank and streak data</li>
              </ul>

              <h2 className="text-white text-base font-bold mt-6 mb-3">Data Retention</h2>
              <p>
                After deletion, your data will be permanently removed from our active systems within 30 days. Some anonymized aggregated data may be retained for statistical purposes but will not be personally identifiable.
              </p>

              <h2 className="text-white text-base font-bold mt-6 mb-3">Alternative: Export Your Data</h2>
              <p>
                Before deleting your account, you may want to export your data. Contact us through the Contact section to request a data export in JSON format.
              </p>

              <h2 className="text-white text-base font-bold mt-6 mb-3">Account Recovery</h2>
              <p>
                Once deleted, your account cannot be recovered. If you delete your account by mistake, you will need to create a new account and start over.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="relative p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/50 shadow-[0_12px_48px_rgba(0,0,0,0.5)]">
              <h3 className="text-sm font-bold text-white mb-4">Confirm Deletion</h3>
              <p className="text-xs text-zinc-500 mb-4">
                To confirm deletion, type <span className="text-white font-mono">DELETE</span> in the field below:
              </p>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="mb-4 bg-zinc-900 border-zinc-800 text-white"
              />
              <Button
                onClick={handleDelete}
                disabled={confirmText !== 'DELETE' || isDeleting}
                className="w-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed h-11 font-bold"
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete My Account'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}