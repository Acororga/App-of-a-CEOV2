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
                  className="group flex items-center gap-3 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all active:scale-[0.98]"
                >
                  <div className="relative w-10 h-10 group/icon">
                    {/* Ambient shadow */}
                    <div className="absolute inset-0 rounded-[10px] bg-black/40 blur-sm" style={{ transform: 'translateY(1.5px)' }} />
                    
                    {/* Container */}
                    <div className="absolute inset-0 rounded-[10px] bg-gradient-to-br from-[#6b21a8] to-[#581c87] shadow-[0_0.5px_1px_rgba(0,0,0,0.4),0_2px_6px_rgba(0,0,0,0.2)] group-active/icon:shadow-[0_0.5px_1px_rgba(0,0,0,0.3),0_1px_3px_rgba(0,0,0,0.15)] transition-shadow duration-100"
                         style={{
                           backgroundImage: `
                             linear-gradient(135deg, rgba(107, 33, 168, 0.95) 0%, rgba(88, 28, 135, 0.95) 100%),
                             url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")
                           `,
                           backgroundBlendMode: 'normal, overlay'
                         }}>
                      <div className="absolute inset-0 rounded-[10px] bg-gradient-to-br from-white/12 via-transparent to-transparent" />
                      <div className="absolute inset-[0.5px] rounded-[9.5px] bg-gradient-to-b from-white/7 to-transparent" style={{ height: '40%' }} />
                      <div className="absolute inset-0 rounded-[10px] bg-gradient-to-t from-black/12 via-transparent to-transparent" />
                    </div>
                    
                    {/* Icon */}
                    <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translate(0px, -0.5px)' }}>
                      <svg className="w-[52%] h-[52%]" viewBox="0 0 24 24" fill="none" stroke="#f5f5f4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.92">
                        <line x1="12" y1="20" x2="12" y2="10" />
                        <line x1="18" y1="20" x2="18" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="16" />
                      </svg>
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
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          isActive
                            ? 'bg-zinc-900/50 border-zinc-700 hover:border-zinc-600'
                            : 'bg-zinc-950/50 border-zinc-800 opacity-50 hover:opacity-100'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-600'}`} />
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
                  className="group w-full flex items-center gap-3 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all active:scale-[0.98]"
                >
                  <div className="relative w-10 h-10 group/icon">
                    {/* Ambient shadow */}
                    <div className="absolute inset-0 rounded-[10px] bg-black/40 blur-sm" style={{ transform: 'translateY(1.5px)' }} />
                    
                    {/* Container */}
                    <div className="absolute inset-0 rounded-[10px] bg-gradient-to-br from-[#475569] to-[#334155] shadow-[0_0.5px_1px_rgba(0,0,0,0.4),0_2px_6px_rgba(0,0,0,0.2)] group-active/icon:shadow-[0_0.5px_1px_rgba(0,0,0,0.3),0_1px_3px_rgba(0,0,0,0.15)] transition-shadow duration-100"
                         style={{
                           backgroundImage: `
                             linear-gradient(135deg, rgba(71, 85, 105, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%),
                             url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulature type='fractalNoise' baseFrequency='0.95' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")
                           `,
                           backgroundBlendMode: 'normal, overlay'
                         }}>
                      <div className="absolute inset-0 rounded-[10px] bg-gradient-to-br from-white/12 via-transparent to-transparent" />
                      <div className="absolute inset-[0.5px] rounded-[9.5px] bg-gradient-to-b from-white/7 to-transparent" style={{ height: '40%' }} />
                      <div className="absolute inset-0 rounded-[10px] bg-gradient-to-t from-black/12 via-transparent to-transparent" />
                    </div>
                    
                    {/* Icon */}
                    <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translate(0.5px, 0px)' }}>
                      <svg className="w-[54%] h-[54%]" viewBox="0 0 24 24" fill="none" stroke="#f5f5f4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.92">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2" strokeWidth="1.8" />
                      </svg>
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