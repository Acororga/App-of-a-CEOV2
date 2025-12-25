import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Plus, Trash2, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '../components/LanguageProvider';
import AddTimeModal from '../components/blocking/AddTimeModal';

export default function ScreenTime() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [showAddApp, setShowAddApp] = useState(false);
  const [showAddWebsite, setShowAddWebsite] = useState(false);
  const [showAddTimeModal, setShowAddTimeModal] = useState(null);
  const [newAppName, setNewAppName] = useState('');
  const [newWebsiteUrl, setNewWebsiteUrl] = useState('');

  const { data: blockedApps } = useQuery({
    queryKey: ['blockedApps'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.BlockedApp.filter({ created_by: user.email });
    }
  });

  const { data: blockedWebsites } = useQuery({
    queryKey: ['blockedWebsites'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.BlockedWebsite.filter({ created_by: user.email });
    }
  });

  const createAppMutation = useMutation({
    mutationFn: async (appName) => {
      const user = await base44.auth.me();
      return await base44.entities.BlockedApp.create({
        app_name: appName,
        time_limit_minutes: 0,
        created_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['blockedApps']);
      setNewAppName('');
      setShowAddApp(false);
    }
  });

  const createWebsiteMutation = useMutation({
    mutationFn: async (url) => {
      const user = await base44.auth.me();
      return await base44.entities.BlockedWebsite.create({
        url_domain: url,
        time_limit_minutes: 0,
        created_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['blockedWebsites']);
      setNewWebsiteUrl('');
      setShowAddWebsite(false);
    }
  });

  const deleteAppMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.BlockedApp.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['blockedApps']);
    }
  });

  const deleteWebsiteMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.BlockedWebsite.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['blockedWebsites']);
    }
  });

  const updateTimeLimitMutation = useMutation({
    mutationFn: async ({ id, minutes, type }) => {
      if (type === 'app') {
        const app = blockedApps.find(a => a.id === id);
        await base44.entities.BlockedApp.update(id, {
          time_limit_minutes: (app.time_limit_minutes || 0) + minutes
        });
      } else {
        const site = blockedWebsites.find(s => s.id === id);
        await base44.entities.BlockedWebsite.update(id, {
          time_limit_minutes: (site.time_limit_minutes || 0) + minutes
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['blockedApps']);
      queryClient.invalidateQueries(['blockedWebsites']);
    }
  });

  const handleAddTime = (minutes) => {
    if (showAddTimeModal) {
      updateTimeLimitMutation.mutate({
        id: showAddTimeModal.id,
        minutes: minutes,
        type: showAddTimeModal.type
      });
      setShowAddTimeModal(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6 pt-20 pb-12 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px'
      }} />

      <div className="max-w-2xl mx-auto relative">
        <div className="flex items-center justify-between mb-6">
          <Link to={createPageUrl('ScreenTimeManager')} className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-300 transition-colors duration-150 active:scale-95">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{t('back')}</span>
          </Link>
          
          <h1 className="text-xl font-black bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent tracking-tight">
            {t('blockApps')} & {t('blockWebsites')}
          </h1>
          
          <div className="w-20" />
        </div>

        {/* Blocked Apps Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-zinc-300 tracking-tight flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-400" />
              {t('blockApps')}
            </h2>
            <button
              onClick={() => setShowAddApp(true)}
              className="px-3 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-zinc-200 active:scale-95 transition-all duration-150 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('add')}
            </button>
          </div>

          {showAddApp && (
            <div className="mb-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/50">
              <Input
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
                placeholder="App name (e.g., Instagram, TikTok)"
                className="mb-3 bg-zinc-900 border-zinc-800"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newAppName.trim()) {
                    createAppMutation.mutate(newAppName.trim());
                  }
                }}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => createAppMutation.mutate(newAppName.trim())}
                  disabled={!newAppName.trim() || createAppMutation.isPending}
                  className="flex-1 bg-white text-black hover:bg-zinc-200 h-9 text-xs font-bold"
                >
                  {t('add')}
                </Button>
                <Button
                  onClick={() => {
                    setShowAddApp(false);
                    setNewAppName('');
                  }}
                  variant="outline"
                  className="px-4 h-9 text-xs"
                >
                  {t('cancel')}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {blockedApps?.map(app => (
              <div key={app.id} className="group flex items-center gap-3 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/40 hover:border-zinc-700/50 transition-all">
                <div className="w-10 h-10 rounded-lg bg-red-950/40 border border-red-900/40 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
                  <Shield className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{app.app_name}</div>
                  <div className="text-xs text-zinc-600">
                    {app.time_limit_minutes > 0 ? `${app.time_limit_minutes} min remaining` : 'Fully blocked'}
                  </div>
                </div>
                <button
                  onClick={() => setShowAddTimeModal({ id: app.id, name: app.app_name, type: 'app' })}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/60 text-xs font-bold text-zinc-400 hover:text-zinc-300 transition-all active:scale-95"
                >
                  + Time
                </button>
                <button
                  onClick={() => deleteAppMutation.mutate(app.id)}
                  className="p-2 hover:bg-red-950/30 rounded-lg transition-all active:scale-95 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4 text-red-500/70" />
                </button>
              </div>
            ))}
            {(!blockedApps || blockedApps.length === 0) && !showAddApp && (
              <div className="text-center py-8 text-zinc-600 text-sm">
                No blocked apps yet
              </div>
            )}
          </div>
        </div>

        {/* Blocked Websites Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-zinc-300 tracking-tight flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-400" />
              {t('blockWebsites')}
            </h2>
            <button
              onClick={() => setShowAddWebsite(true)}
              className="px-3 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-zinc-200 active:scale-95 transition-all duration-150 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('add')}
            </button>
          </div>

          {showAddWebsite && (
            <div className="mb-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/50">
              <Input
                value={newWebsiteUrl}
                onChange={(e) => setNewWebsiteUrl(e.target.value)}
                placeholder="Domain (e.g., twitter.com, youtube.com)"
                className="mb-3 bg-zinc-900 border-zinc-800"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newWebsiteUrl.trim()) {
                    createWebsiteMutation.mutate(newWebsiteUrl.trim());
                  }
                }}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => createWebsiteMutation.mutate(newWebsiteUrl.trim())}
                  disabled={!newWebsiteUrl.trim() || createWebsiteMutation.isPending}
                  className="flex-1 bg-white text-black hover:bg-zinc-200 h-9 text-xs font-bold"
                >
                  {t('add')}
                </Button>
                <Button
                  onClick={() => {
                    setShowAddWebsite(false);
                    setNewWebsiteUrl('');
                  }}
                  variant="outline"
                  className="px-4 h-9 text-xs"
                >
                  {t('cancel')}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {blockedWebsites?.map(site => (
              <div key={site.id} className="group flex items-center gap-3 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/40 hover:border-zinc-700/50 transition-all">
                <div className="w-10 h-10 rounded-lg bg-orange-950/40 border border-orange-900/40 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
                  <Globe className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{site.url_domain}</div>
                  <div className="text-xs text-zinc-600">
                    {site.time_limit_minutes > 0 ? `${site.time_limit_minutes} min remaining` : 'Fully blocked'}
                  </div>
                </div>
                <button
                  onClick={() => setShowAddTimeModal({ id: site.id, name: site.url_domain, type: 'website' })}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/60 text-xs font-bold text-zinc-400 hover:text-zinc-300 transition-all active:scale-95"
                >
                  + Time
                </button>
                <button
                  onClick={() => deleteWebsiteMutation.mutate(site.id)}
                  className="p-2 hover:bg-red-950/30 rounded-lg transition-all active:scale-95 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4 text-red-500/70" />
                </button>
              </div>
            ))}
            {(!blockedWebsites || blockedWebsites.length === 0) && !showAddWebsite && (
              <div className="text-center py-8 text-zinc-600 text-sm">
                No blocked websites yet
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddTimeModal && (
        <AddTimeModal
          entityName={showAddTimeModal.name}
          entityType={showAddTimeModal.type}
          onAddTime={handleAddTime}
          onClose={() => setShowAddTimeModal(null)}
        />
      )}
    </div>
  );
}