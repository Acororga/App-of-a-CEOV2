import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { RANK_TIERS } from '../functions/businessLogic';
import { ArrowLeft, Trophy, Users, Flame } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('global');

  const { data: myEntry } = useQuery({
    queryKey: ['myLeaderboardEntry'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const entries = await base44.entities.LeaderboardEntry.filter({ created_by: user.email });
      return entries[0];
    }
  });

  const { data: globalEntries } = useQuery({
    queryKey: ['globalLeaderboard'],
    queryFn: async () => {
      const entries = await base44.entities.LeaderboardEntry.filter({ opted_in: true }, '-rank_level');
      return entries.slice(0, 10);
    }
  });

  const { data: friends } = useQuery({
    queryKey: ['friendsLeaderboard'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const connections = await base44.entities.FriendConnection.filter({ 
        created_by: user.email,
        status: 'accepted'
      });
      return connections.sort((a, b) => (b.friend_rank_level || 0) - (a.friend_rank_level || 0));
    }
  });

  const getRankIcon = (rankName) => {
    const tier = RANK_TIERS.find(t => t.name === rankName);
    return tier?.icon || '🐼';
  };

  const getMedalEmoji = (position) => {
    if (position === 0) return '🥇';
    if (position === 1) return '🥈';
    if (position === 2) return '🥉';
    return `${position + 1}.`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-gray-400 mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Home</span>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-2xl font-bold">Leaderboards</h1>
          </div>
        </div>

        {myEntry && (
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-yellow-950 to-black border border-yellow-900">
            <div className="text-sm text-yellow-400 mb-2">YOUR POSITION</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getRankIcon(myEntry.rank_name)}</span>
                <div>
                  <div className="text-xl font-bold">{myEntry.rank_name}</div>
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    {myEntry.win_streak}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">Top {100 - (myEntry.percentile || 50)}%</div>
                <div className="text-xs text-gray-500">Global</div>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-gray-900 w-full">
            <TabsTrigger value="global" className="flex-1">Global</TabsTrigger>
            <TabsTrigger value="friends" className="flex-1">Friends</TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="mt-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-300">TOP PERFORMERS</h2>
            </div>
            
            <div className="space-y-2">
              {globalEntries?.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-lg border transition-all ${
                    entry.id === myEntry?.id
                      ? 'bg-yellow-950 border-yellow-900'
                      : 'bg-gray-900 border-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl w-8 text-center">
                      {getMedalEmoji(index)}
                    </div>
                    <div className="text-2xl">{getRankIcon(entry.rank_name)}</div>
                    <div className="flex-1">
                      <div className="font-semibold">
                        {entry.id === myEntry?.id ? 'You' : `User ${entry.id.slice(0, 6)}`}
                      </div>
                      <div className="text-sm text-gray-500">{entry.rank_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-orange-500">
                        <Flame className="w-4 h-4" />
                        <span className="font-semibold">{entry.win_streak}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!globalEntries || globalEntries.length === 0) && (
                <div className="text-center py-12 text-gray-600">
                  No leaderboard data yet
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="friends" className="mt-6">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-500" />
                <h2 className="text-lg font-semibold text-gray-300">YOUR FRIENDS ({friends?.length || 0})</h2>
              </div>
            </div>
            
            <div className="space-y-2 mb-6">
              {friends?.map((friend, index) => (
                <div
                  key={friend.id}
                  className="p-4 rounded-lg bg-gray-900 border border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg w-6 text-gray-500">{index + 1}.</div>
                    <div className="text-2xl">{getRankIcon(friend.friend_rank_name)}</div>
                    <div className="flex-1">
                      <div className="font-semibold">{friend.friend_name || friend.friend_email}</div>
                      <div className="text-sm text-gray-500">{friend.friend_rank_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-orange-500">
                        <Flame className="w-4 h-4" />
                        <span className="font-semibold">{friend.friend_win_streak || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!friends || friends.length === 0) && (
                <div className="text-center py-12 text-gray-600">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-800" />
                  <div className="text-sm mb-2">No friends added yet</div>
                  <div className="text-xs text-gray-700">Add friends to compare progress!</div>
                </div>
              )}
            </div>

            <Button className="w-full bg-gray-900 border border-gray-800 hover:bg-gray-800">
              + Add Friend by Email
            </Button>
          </TabsContent>
        </Tabs>

        {myEntry && !myEntry.opted_in && (
          <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
            <div className="text-sm text-gray-400 text-center">
              You're currently not participating in leaderboards
            </div>
          </div>
        )}
      </div>
    </div>
  );
}