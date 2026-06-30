import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart2, Users, CheckCircle2, TrendingUp, 
  MessageSquare, DollarSign, Zap, Clock, User
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
export default function Dashboard() {
  const { API_URL, currentUser } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analyticsDashboard'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/analytics/dashboard`);
      return res.data;
    }
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const baseUrl = API_URL.replace('/api', '');
    const socket = io(baseUrl);

    // Listen for new messages or updates and refresh the dashboard data
    const refreshDashboard = () => {
      queryClient.invalidateQueries({ queryKey: ['analyticsDashboard'] });
    };

    socket.on('newMessage', refreshDashboard);
    socket.on('chatsUpdated', refreshDashboard);

    return () => {
      socket.disconnect();
    };
  }, [API_URL, queryClient]);

  if (isLoading || !analytics) {
    return (
      <div className="p-8 h-full flex flex-col justify-center items-center bg-neutral-50 dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-neutral-500">Loading your dashboard...</p>
      </div>
    );
  }

  const { topline, revenueChart, agentPerformance, recentActivity } = analytics;

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col overflow-y-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Good morning, {currentUser?.name?.split(' ')[0]} 👋</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Here is what's happening with your business today.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Live Data Sync</span>
        </div>
      </div>

      {/* Topline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
              <TrendingUp className="h-3 w-3 mr-1" /> +5.2%
            </span>
          </div>
          <h3 className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mb-1">Messages Sent</h3>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">{topline.messagesSent.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <h3 className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mb-1">Active Automations</h3>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">{topline.activeAutomations}</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
              <TrendingUp className="h-3 w-3 mr-1" /> +22.1%
            </span>
          </div>
          <h3 className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mb-1">New Customers</h3>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">{topline.newCustomers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Revenue Overview</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#818cf8' }}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {recentActivity.map((activity, i) => (
              <div key={activity.id} className="flex relative">
                {i !== recentActivity.length - 1 && (
                   <div className="absolute top-8 left-4 bottom-[-24px] w-0.5 bg-neutral-200 dark:bg-neutral-800"></div>
                )}
                <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mr-4 border-2 border-white dark:border-neutral-900">
                  {activity.type === 'order' && <DollarSign className="w-3.5 h-3.5 text-emerald-500" />}
                  {activity.type === 'campaign' && <Zap className="w-3.5 h-3.5 text-amber-500" />}
                  {activity.type === 'support' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
                  {activity.type === 'automation' && <User className="w-3.5 h-3.5 text-indigo-500" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-200">{activity.message}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
            View All Activity
          </button>
        </div>
      </div>

      {/* Agent Performance */}
      <div className="mt-8 bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
         <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Team Performance Leaderboard</h2>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-xs uppercase text-neutral-500 dark:text-neutral-400">
                     <th className="pb-3 font-medium">Agent</th>
                     <th className="pb-3 font-medium text-right">Avg Resolution Time</th>
                     <th className="pb-3 font-medium text-right">Tickets Resolved</th>
                     <th className="pb-3 font-medium text-right">Efficiency Score</th>
                  </tr>
               </thead>
               <tbody className="text-sm">
                  {agentPerformance.map((agent, index) => (
                     <tr key={index} className="border-b border-neutral-100 dark:border-neutral-800/50 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                        <td className="py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                                 {agent.name.charAt(0)}
                              </div>
                              <span className="font-medium text-neutral-900 dark:text-neutral-200">{agent.name}</span>
                           </div>
                        </td>
                        <td className="py-4 text-right font-medium text-neutral-600 dark:text-neutral-300">
                           <div className="flex items-center justify-end gap-1">
                              <Clock className="w-3.5 h-3.5 text-neutral-400" />
                              {agent.resolutionTime}
                           </div>
                        </td>
                        <td className="py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                           {agent.ticketsResolved}
                        </td>
                        <td className="py-4 text-right">
                           <div className="w-full max-w-[120px] ml-auto h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                              <div 
                                 className="h-full bg-indigo-500 rounded-full" 
                                 style={{ width: `${(agent.ticketsResolved / 150) * 100}%` }}
                              ></div>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
