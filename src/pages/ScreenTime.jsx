import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { getTodayScreenTime, getAverageScreenTime } from '../functions/businessLogic';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Ban, Smartphone, Globe, Plus, Trash2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ScreenTime() {
  const [activeTab, setActiveTab] = useState('apps');

  const { data: todayMinutes } = useQuery({
    queryKey: ['todayScreenTime'],
    queryFn: getTodayScreenTime
  });

  const { data: avgMinutes } = useQuery({
    queryKey: ['avgScreenTime'],
    queryFn: () => getAverageScreenTime(7)
  });

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

  const dailyLimit = 480; // 8 hours
  const progress = todayMinutes ? Math.min((todayMinutes / dailyLimit) * 100, 100) : 0;

  const formatTime = (mins) => {
    const hours = Math.floor(mins / 60);
    const minutes = Math.round(mins % 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-gray-400 mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Home</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Screen Time Manager</h1>
        </div>

        {/* Today's Usage */}
        <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-gray-800">
          <div className="text-sm text-gray-500 mb-2">TODAY'S USAGE</div>
          <div className="text-4xl font-bold mb-4">{formatTime(todayMinutes || 0)}</div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full transition-all ${
                progress > 80 ? 'bg-red-600' : progress > 60 ? 'bg-yellow-600' : 'bg-green-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTime(todayMinutes || 0)}</span>
            <span>{formatTime(dailyLimit)} limit</span>
          </div>
        </div>

        {/* 7-Day Average */}
        <div className="mb-8 flex justify-between items-center p-4 rounded-lg bg-gray-900">
          <span className="text-sm text-gray-400">7-day average</span>
          <span className="text-lg font-semibold">{formatTime(avgMinutes || 0)}</span>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-gray-900 w-full">
            <TabsTrigger value="apps" className="flex-1">Apps</TabsTrigger>
            <TabsTrigger value="websites" className="flex-1">Websites</TabsTrigger>
          </TabsList>

          <TabsContent value="apps" className="mt-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Ban className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-semibold text-gray-300">BLOCKED APPS</h2>
              </div>
            </div>
            
            <div className="space-y-2 mb-6">
              {blockedApps?.map(app => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-900 border border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{app.app_name}</div>
                      {app.time_limit_minutes > 0 && (
                        <div className="text-xs text-gray-500">
                          {app.time_limit_minutes}min limit
                        </div>
                      )}
                      {app.is_social_media && (
                        <div className="text-xs text-orange-500 flex items-center gap-1 mt-1">
                          <Bell className="w-3 h-3" />
                          Awareness mode
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="text-red-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!blockedApps || blockedApps.length === 0) && (
                <div className="text-center py-8 text-gray-600 text-sm">
                  No blocked apps
                </div>
              )}
            </div>

            <Button className="w-full bg-gray-900 border border-gray-800 hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              Add Blocked App
            </Button>
          </TabsContent>

          <TabsContent value="websites" className="mt-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Ban className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-semibold text-gray-300">BLOCKED WEBSITES</h2>
              </div>
            </div>
            
            <div className="space-y-2 mb-6">
              {blockedWebsites?.map(site => (
                <div
                  key={site.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-900 border border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{site.url_domain}</div>
                      {site.time_limit_minutes > 0 && (
                        <div className="text-xs text-gray-500">
                          {site.time_limit_minutes}min limit
                        </div>
                      )}
                      {site.is_social_media && (
                        <div className="text-xs text-orange-500 flex items-center gap-1 mt-1">
                          <Bell className="w-3 h-3" />
                          Awareness mode
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="text-red-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!blockedWebsites || blockedWebsites.length === 0) && (
                <div className="text-center py-8 text-gray-600 text-sm">
                  No blocked websites
                </div>
              )}
            </div>

            <Button className="w-full bg-gray-900 border border-gray-800 hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              Add Blocked Website
            </Button>
          </TabsContent>
        </Tabs>

        {/* Platform Limitation Notice */}
        <div className="p-4 rounded-lg bg-yellow-950 border border-yellow-900">
          <div className="text-sm text-yellow-400">
            ⚠️ Full blocking requires native OS permissions. This tracks your usage intentions.
          </div>
        </div>
      </div>
    </div>
  );
}