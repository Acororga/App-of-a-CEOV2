import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, FileText, Shield, BarChart3, X, ClipboardList, CheckSquare, Calendar as CalendarIcon } from 'lucide-react';
import { LanguageProvider, useLanguage } from './components/LanguageProvider';
import { RankAmbientProvider, useRankAmbient } from './components/RankAmbientProvider';

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <RankAmbientProvider>
        <LayoutContent children={children} currentPageName={currentPageName} />
      </RankAmbientProvider>
    </LanguageProvider>
  );
}

function LayoutContent({ children, currentPageName }) {
  const { t } = useLanguage();
  const { ambientStyles } = useRankAmbient();
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  const { data: appSettings } = useQuery({
    queryKey: ['appSettings'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const settings = await base44.entities.AppSettings.filter({ created_by: user.email });
      if (settings.length === 0) {
        const newSettings = await base44.entities.AppSettings.create({
          active_apps: ['Pareto', 'Habits', 'Calendar', 'ScreenTimeManager']
        });
        return newSettings;
      }
      return settings[0];
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

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  if (currentPageName === 'Home') {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {ambientStyles.ceoGlow ? (
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 border-[3px] border-yellow-500/25 rounded-none shadow-[inset_0_0_60px_rgba(234,179,8,0.15)]" />
          </div>
        ) : (
          <>
            {ambientStyles.topRightOrnament}
            {ambientStyles.bottomLeftOrnament}
          </>
        )}
        
        {/* User Icon - Top Left */}
        <button
          onClick={() => setShowMenu(true)}
          className="fixed top-6 left-6 z-50 w-11 h-11 rounded-full bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-800 flex items-center justify-center shadow-lg border border-zinc-700/50 hover:scale-105 transition-transform"
        >
          <span className="text-sm font-bold bg-gradient-to-br from-white to-zinc-300 bg-clip-text text-transparent">
            {user?.full_name?.charAt(0) || '?'}
          </span>
        </button>

        {/* Slide-in Menu */}
        {showMenu && (
          <>
            <div
              className="fixed inset-0 bg-black/80 z-50"
              onClick={() => setShowMenu(false)}
            />
            <div className="fixed left-0 top-0 bottom-0 w-80 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-r border-zinc-800 z-50 p-6 overflow-y-auto">
              <button
                onClick={() => setShowMenu(false)}
                className="absolute top-6 right-6 p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-800 flex items-center justify-center shadow-lg border border-zinc-700/50 mb-4">
                  <span className="text-2xl font-bold bg-gradient-to-br from-white to-zinc-300 bg-clip-text text-transparent">
                    {user?.full_name?.charAt(0) || '?'}
                  </span>
                </div>
                <div className="text-xl font-bold mb-1">{user?.full_name || 'User'}</div>
                <div className="text-sm text-zinc-500">{user?.email}</div>
              </div>

              <div className="space-y-2">
                <Link
                  to={createPageUrl('BiannualReport')}
                  onClick={() => setShowMenu(false)}
                  className="group flex items-center gap-3 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 active:scale-[0.98] transition-all"
                >
                  <div className="w-10 h-10 rounded-lg group-active:scale-[0.96] transition-transform duration-100">
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#a855f7] to-[#7c3aed] shadow-[0_1px_2px_rgba(0,0,0,0.3),0_4px_12px_rgba(168,85,247,0.3)]" 
                           style={{
                             backgroundImage: `
                               linear-gradient(135deg, #a855f7 0%, #7c3aed 100%),
                               url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")
                             `,
                             backgroundBlendMode: 'overlay, normal'
                           }}>
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-tl from-black/15 via-transparent to-transparent" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translate(-0.5px, 0.5px)' }}>
                        <svg className="w-[55%] h-[55%] opacity-95" viewBox="0 0 24 24" fill="none" stroke="#f8f8f8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 21H4.6c-.56 0-.84 0-1.054-.109a1 1 0 01-.437-.437C3 20.24 3 19.96 3 19.4V3" opacity="0.88"/>
                          <path d="M7 16l3.5-5.5L14 14l5-8" opacity="0.92" strokeWidth="2.8"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">{t('sixMonthReport')}</div>
                    <div className="text-xs text-zinc-500">{t('yourProgressOverview')}</div>
                  </div>
                </Link>

                <div className="space-y-2">
                  <div className="text-xs text-zinc-500 uppercase tracking-wide font-semibold mb-2 px-2">{t('activeApps')}</div>
                  {availableApps.map(app => {
                    const currentApps = appSettings?.active_apps || [];
                    const isActive = currentApps.includes(app.id);
                    const Icon = app.icon;
                    return (
                      <button
                        key={app.id}
                        onClick={() => toggleAppMutation.mutate(app.id)}
                        className={`group w-full flex items-center gap-3 p-3 rounded-lg border transition-all active:scale-[0.98] ${
                          isActive
                            ? 'bg-zinc-900/50 border-zinc-700 hover:border-zinc-600'
                            : 'bg-zinc-950/50 border-zinc-800 opacity-50 hover:opacity-100'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg group-active:scale-[0.96] transition-transform duration-100 ${!isActive && 'opacity-40'}`}>
                          {/* Render app custom icons based on app.id */}
                          {app.id === 'Pareto' && (
                            <div className="relative w-full h-full">
                              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#5b4fb8] to-[#7c3aed] shadow-[0_1px_2px_rgba(0,0,0,0.3),0_3px_8px_rgba(91,79,184,0.25)]" 
                                   style={{
                                     backgroundImage: `linear-gradient(135deg, #5b4fb8 0%, #7c3aed 100%), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`,
                                     backgroundBlendMode: 'overlay, normal'
                                   }}>
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-tl from-black/15 via-transparent to-transparent" />
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translate(0.5px, -0.5px)' }}>
                                <svg className="w-[50%] h-[50%] opacity-95" viewBox="0 0 24 24" fill="none" stroke="#f8f8f8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" opacity="0.85"/>
                                  <path d="M9 14l2 2 4-4" opacity="0.90" strokeWidth="2.8"/>
                                </svg>
                              </div>
                            </div>
                          )}
                          {app.id === 'Habits' && (
                            <div className="relative w-full h-full">
                              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#10b981] to-[#14b8a6] shadow-[0_1px_2px_rgba(0,0,0,0.3),0_3px_8px_rgba(16,185,129,0.25)]" 
                                   style={{
                                     backgroundImage: `linear-gradient(135deg, #10b981 0%, #14b8a6 100%), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`,
                                     backgroundBlendMode: 'overlay, normal'
                                   }}>
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-tl from-black/15 via-transparent to-transparent" />
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translate(-0.5px, 0.5px)' }}>
                                <svg className="w-[50%] h-[50%] opacity-95" viewBox="0 0 24 24" fill="none">
                                  <circle cx="12" cy="12" r="8.5" stroke="#f8f8f8" strokeWidth="2.2" strokeDasharray="2.5 3" opacity="0.85"/>
                                  <path d="M8 12.5l2.5 2.5L16.5 9" stroke="#f8f8f8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
                                </svg>
                              </div>
                            </div>
                          )}
                          {app.id === 'Calendar' && (
                            <div className="relative w-full h-full">
                              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#ec4899] to-[#f43f5e] shadow-[0_1px_2px_rgba(0,0,0,0.3),0_3px_8px_rgba(236,72,153,0.25)]" 
                                   style={{
                                     backgroundImage: `linear-gradient(135deg, #ec4899 0%, #f43f5e 100%), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`,
                                     backgroundBlendMode: 'overlay, normal'
                                   }}>
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-tl from-black/15 via-transparent to-transparent" />
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translate(0.5px, 0px)' }}>
                                <svg className="w-[52%] h-[52%] opacity-95" viewBox="0 0 24 24" fill="none">
                                  <rect x="4" y="6" width="16" height="15" rx="2" stroke="#f8f8f8" strokeWidth="2.2" opacity="0.88"/>
                                  <line x1="4" y1="10" x2="20" y2="10" stroke="#f8f8f8" strokeWidth="2.2" opacity="0.88"/>
                                  <line x1="8" y1="3" x2="8" y2="7" stroke="#f8f8f8" strokeWidth="2.5" strokeLinecap="round" opacity="0.88"/>
                                  <line x1="16" y1="3" x2="16" y2="7" stroke="#f8f8f8" strokeWidth="2.5" strokeLinecap="round" opacity="0.88"/>
                                  <circle cx="8.5" cy="13.5" r="1.2" fill="#f8f8f8" opacity="0.75"/>
                                  <circle cx="12" cy="13.5" r="1.2" fill="#f8f8f8" opacity="0.85"/>
                                  <circle cx="15.5" cy="13.5" r="1.2" fill="#f8f8f8" opacity="0.75"/>
                                </svg>
                              </div>
                            </div>
                          )}
                          {app.id === 'ScreenTimeManager' && (
                            <div className="relative w-full h-full">
                              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#ef4444] to-[#f97316] shadow-[0_1px_2px_rgba(0,0,0,0.3),0_3px_8px_rgba(239,68,68,0.25)]" 
                                   style={{
                                     backgroundImage: `linear-gradient(135deg, #ef4444 0%, #f97316 100%), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`,
                                     backgroundBlendMode: 'overlay, normal'
                                   }}>
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-tl from-black/15 via-transparent to-transparent" />
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translate(-0.5px, -0.5px)' }}>
                                <svg className="w-[54%] h-[54%] opacity-95" viewBox="0 0 24 24" fill="none">
                                  <path d="M12 2.5L4.5 6.5v5.5c0 5.2 3.6 10.1 7.5 11.5 3.9-1.4 7.5-6.3 7.5-11.5V6.5L12 2.5z" stroke="#f8f8f8" strokeWidth="2.2" strokeLinejoin="round" opacity="0.88"/>
                                  <circle cx="12" cy="12.5" r="3" stroke="#f8f8f8" strokeWidth="2" opacity="0.82"/>
                                  <path d="M12 9.5v3.5l2 2" stroke="#f8f8f8" strokeWidth="2.2" strokeLinecap="round" opacity="0.85"/>
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-left flex-1">
                          <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                            {app.name}
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isActive ? 'border-green-500 bg-green-500' : 'border-zinc-700'
                        }`}>
                          {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <Link
                  to={createPageUrl('Settings')}
                  onClick={() => setShowMenu(false)}
                  className="group w-full flex items-center gap-3 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 active:scale-[0.98] transition-all"
                >
                  <div className="w-10 h-10 rounded-lg group-active:scale-[0.96] transition-transform duration-100">
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#2563eb] shadow-[0_1px_2px_rgba(0,0,0,0.3),0_4px_12px_rgba(59,130,246,0.3)]" 
                           style={{
                             backgroundImage: `
                               linear-gradient(135deg, #3b82f6 0%, #2563eb 100%),
                               url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")
                             `,
                             backgroundBlendMode: 'overlay, normal'
                           }}>
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-tl from-black/15 via-transparent to-transparent" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translate(0.5px, 0px)' }}>
                        <svg className="w-[58%] h-[58%] opacity-95" viewBox="0 0 24 24" fill="none" stroke="#f8f8f8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" opacity="0.88"/>
                          <path d="M12 1v6m0 6v6M1 12h6m6 0h6" opacity="0.85" strokeWidth="2.5"/>
                          <path d="M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M19.78 4.22l-4.24 4.24m-5.08 5.08l-4.24 4.24" opacity="0.82" strokeWidth="2"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{t('settingsAndLegal')}</div>
                    <div className="text-xs text-zinc-500">{t('termsAndConditions')}</div>
                  </div>
                </Link>
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-800">
                <button
                  onClick={() => base44.auth.logout()}
                  className="w-full p-3 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400 hover:bg-red-950/50 transition-colors"
                >
                  {t('logout')}
                </button>
              </div>
            </div>
          </>
        )}

        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {ambientStyles.ceoGlow ? (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 border-[3px] border-yellow-500/25 rounded-none shadow-[inset_0_0_60px_rgba(234,179,8,0.15)]" />
        </div>
      ) : (
        <>
          {ambientStyles.topRightOrnament}
          {ambientStyles.bottomLeftOrnament}
        </>
      )}
      {children}
    </div>
  );
}