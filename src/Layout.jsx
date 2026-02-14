import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { User, LayoutGrid, BarChart3, Settings, LogOut, Bell, Zap, Menu, X } from 'lucide-react';
import { LanguageProvider, useLanguage } from './components/LanguageProvider';
import { RankAmbientProvider, useRankAmbient } from './components/RankAmbientProvider';
import { PremiumProvider } from './components/PremiumProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from './utils';

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <RankAmbientProvider>
        <PremiumProvider>
          <LayoutContent currentPageName={currentPageName}>{children}</LayoutContent>
        </PremiumProvider>
      </RankAmbientProvider>
    </LanguageProvider>
  );
}

function LayoutContent({ children, currentPageName }) {
  const { t } = useLanguage();
  const { ambientStyles } = useRankAmbient();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const navItems = [
    { id: 'Home', name: t('home'), icon: LayoutGrid, path: '/' },
    { id: 'Dashboard', name: t('dashboard'), icon: BarChart3, path: createPageUrl('Dashboard') },
    { id: 'Settings', name: t('settings'), icon: Settings, path: createPageUrl('Settings') },
  ];

  return (
    <div className="min-h-screen bg-mesh text-foreground selection:bg-primary/30 relative overflow-x-hidden">
      {/* Dynamic Rank Frame */}
      {ambientStyles.frame}

      {/* Modern Header */}
      <header className="fixed top-0 left-0 right-0 z-40 px-4 h-16 sm:h-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-2xl glass flex items-center justify-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <span className="text-lg font-black text-glow">CEO</span>
          </motion.div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl glass text-xs font-bold">
            <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="opacity-70 uppercase tracking-widest">Focus Mode</span>
          </div>
          
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="w-10 h-10 rounded-2xl glass flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Command Center Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-md z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm glass-dark border-l border-white/10 z-50 p-8 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-2xl font-black tracking-tight">{t('menu')}</h2>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Profile Card */}
              <div className="p-6 rounded-[2rem] glass-dark mb-8 border border-white/5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-xl font-bold">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{user?.full_name || 'User'}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl glass text-center">
                    <div className="text-xs text-muted-foreground uppercase mb-1">Rank</div>
                    <div className="font-black text-primary">SIGMA</div>
                  </div>
                  <div className="p-3 rounded-2xl glass text-center">
                    <div className="text-xs text-muted-foreground uppercase mb-1">Streak</div>
                    <div className="font-black text-orange-400">12</div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      location.pathname === item.path 
                        ? 'glass text-primary' 
                        : 'hover:bg-white/5 text-muted-foreground'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-bold tracking-tight">{item.name}</span>
                  </button>
                ))}
              </nav>

              <button
                onClick={() => base44.auth.logout()}
                className="mt-auto flex items-center gap-4 p-4 rounded-2xl text-destructive hover:bg-destructive/10 transition-all font-bold"
              >
                <LogOut className="w-5 h-5" />
                <span>{t('logout')}</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Container */}
      <main className="relative z-10 pt-20 sm:pt-24 pb-8 px-4 sm:px-6">
        <div className="max-w-screen-xl mx-auto">
          {children}
        </div>
      </main>

      {/* App Feedback Toaster Container could go here */}
    </div>
  );
}
