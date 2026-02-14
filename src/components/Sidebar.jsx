import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, ClipboardList, CheckSquare, Calendar as CalendarIcon, Shield, FileText, User } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import AnimatedIcon from './ui/AnimatedIcon';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ isOpen, onClose, user }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: appSettings } = useQuery({
    queryKey: ['appSettings'],
    queryFn: async () => {
        try {
            const user = await base44.auth.me();
            const settings = await base44.entities.AppSettings.filter({ created_by: user.id });
            if (settings.length === 0) {
              const newSettings = await base44.entities.AppSettings.create({
                active_apps: ['Pareto', 'Habits', 'Calendar', 'ScreenTimeManager']
              });
              return newSettings;
            }
            return settings[0];
        } catch (e) {
            console.error("Failed to fetch settings", e);
            return { active_apps: [] };
        }
    },
    staleTime: 0,
    cacheTime: 0
  });

  const toggleAppMutation = useMutation({
    mutationFn: async (appName) => {
      if (!appSettings) return;
      const currentApps = appSettings.active_apps || [];
      const newApps = currentApps.includes(appName)
        ? currentApps.filter(a => a !== appName)
        : [...currentApps, appName];
      await base44.entities.AppSettings.update(appSettings.id, { active_apps: newApps });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['appSettings']);
    }
  });

  const availableApps = [
    { id: 'Pareto', name: t('todo'), icon: ClipboardList },
    { id: 'Habits', name: t('habits'), icon: CheckSquare },
    { id: 'Calendar', name: t('schedule'), icon: CalendarIcon },
    { id: 'ScreenTimeManager', name: t('screenTime'), icon: Shield }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-sidebar border-r border-sidebar-border z-50 p-6 overflow-y-auto shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-sidebar-accent rounded-lg transition-colors text-sidebar-foreground"
            >
              <AnimatedIcon icon={X} size={20} />
            </button>

            <div className="mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sidebar-accent via-sidebar-accent/80 to-sidebar-accent flex items-center justify-center shadow-lg border border-sidebar-border mb-4">
                <span className="text-2xl font-bold text-sidebar-foreground">
                  {user?.full_name?.charAt(0) || '?'}
                </span>
              </div>
              <div className="text-xl font-bold mb-1 text-sidebar-foreground">{user?.full_name || 'User'}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
            </div>

            <div className="space-y-3">
              <Link
                to={createPageUrl('Notes')}
                onClick={onClose}
                className="group flex items-center gap-3 p-4 rounded-xl bg-sidebar-accent/50 border border-sidebar-border hover:border-primary/30 hover:bg-sidebar-accent active:scale-[0.98] transition-all duration-150 relative overflow-hidden"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-background rounded-lg border border-sidebar-border shadow-sm group-hover:shadow-md transition-shadow">
                     <AnimatedIcon icon={FileText} className="text-primary" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-sidebar-foreground">Notes</div>
                  <div className="text-xs text-muted-foreground">Your quick notes</div>
                </div>
              </Link>

              <Link
                to={createPageUrl('BiannualReport')}
                onClick={onClose}
                className="group flex items-center gap-3 p-4 rounded-xl bg-sidebar-accent/50 border border-sidebar-border hover:border-primary/30 hover:bg-sidebar-accent active:scale-[0.98] transition-all duration-150 relative overflow-hidden"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-background rounded-lg border border-sidebar-border shadow-sm group-hover:shadow-md transition-shadow">
                    <AnimatedIcon icon={BarChart3} className="text-primary" />
                </div>
                <div className="text-left flex-1">
                    <div className="font-semibold text-sidebar-foreground">{t('sixMonthReport')}</div>
                    <div className="text-xs text-muted-foreground">{t('yourProgressOverview')}</div>
                </div>
              </Link>
            </div>

            <div className="space-y-2 mt-6">
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2 px-2">{t('activeApps')}</div>
              {availableApps.map(app => {
                const currentApps = appSettings?.active_apps || [];
                const isActive = currentApps.includes(app.id);
                const Icon = app.icon;
                return (
                  <button
                    key={app.id}
                    onClick={() => toggleAppMutation.mutate(app.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isActive
                        ? 'bg-sidebar-accent border-sidebar-border shadow-sm'
                        : 'bg-transparent border-transparent opacity-70 hover:opacity-100 hover:bg-sidebar-accent/30'
                    }`}
                  >
                    <AnimatedIcon icon={Icon} className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="text-left flex-1">
                      <div className={`text-sm font-medium ${isActive ? 'text-sidebar-foreground' : 'text-muted-foreground'}`}>
                        {app.name}
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isActive ? 'border-green-500 bg-green-500' : 'border-sidebar-border'
                    }`}>
                      {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 mt-6">
              <Link
                to={createPageUrl('Settings')}
                onClick={onClose}
                className="w-full flex items-center gap-3 p-4 rounded-lg bg-sidebar-accent/50 border border-sidebar-border hover:border-primary/30 hover:bg-sidebar-accent transition-all"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-background rounded-lg border border-sidebar-border shadow-sm">
                    <AnimatedIcon icon={User} className="text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sidebar-foreground">{t('settingsAndLegal')}</div>
                  <div className="text-xs text-muted-foreground">{t('termsAndConditions')}</div>
                </div>
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-sidebar-border">
              <button
                onClick={() => base44.auth.logout()}
                className="w-full p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-colors"
              >
                {t('logout')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
