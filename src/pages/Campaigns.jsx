import React, { useState } from 'react';
import { Plus, Play, Pause, BarChart2, ArrowLeft, Send, X, Users, CheckCircle2, Eye, Reply } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import clsx from 'clsx';

export default function Campaigns() {
  const { API_URL } = useAuth();
  const queryClient = useQueryClient();
  const [isBuilding, setIsBuilding] = useState(false);
  const [analyticsCampaign, setAnalyticsCampaign] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [audience, setAudience] = useState('All Contacts');
  const [template, setTemplate] = useState('');

  // Fetch Campaigns
  const { data: campaigns = [], isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/campaigns`);
      return res.data;
    },
    refetchInterval: 3000 // Poll every 3 seconds to update the progress bar live
  });

  // Fetch Templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/templates`);
      return res.data;
    }
  });

  // Fetch Contacts for audience counts
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/contacts`);
      return res.data;
    }
  });

  // Launch Campaign Mutation
  const launchMutation = useMutation({
    mutationFn: async (campaignData) => {
      const res = await axios.post(`${API_URL}/campaigns/launch`, campaignData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['campaigns']);
      toast.success('Campaign launched successfully! Messages are being sent.');
      setIsBuilding(false);
      setName('');
      setTemplate('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to launch campaign');
    }
  });

  const handleLaunch = () => {
    if (!name || !template) {
      toast.error('Please fill in all fields');
      return;
    }
    launchMutation.mutate({
      name,
      templateName: template,
      audience
    });
  };

  // Derive unique tags for the audience dropdown
  const uniqueTags = [...new Set(contacts.flatMap(c => c.tags || []))];

  if (isBuilding) {
    return (
      <div className="p-8 h-full overflow-y-auto bg-neutral-50 dark:bg-black">
        <Toaster position="top-right" />
        <div className="max-w-4xl mx-auto pb-24">
          <button 
            onClick={() => setIsBuilding(false)}
            className="flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </button>
          
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">Launch New Broadcast</h1>
          
          <div className="space-y-6">
            <div className="card p-6 bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">1. Campaign Details</h3>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Campaign Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Black Friday Blast"
                className="input-field w-full max-w-md bg-neutral-50 dark:bg-black"
              />
            </div>

            <div className="card p-6 bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">2. Select Audience</h3>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Target Segment</label>
              <select value={audience} onChange={(e) => setAudience(e.target.value)} className="input-field w-full max-w-md bg-neutral-50 dark:bg-black">
                <option value="All Contacts">All Contacts ({contacts.length} total)</option>
                <optgroup label="Filter by Tags">
                  {uniqueTags.map(tag => (
                    <option key={tag} value={tag}>Tag: {tag}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="card p-6 bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">3. Choose Template</h3>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Approved WhatsApp Template</label>
              <select value={template} onChange={(e) => setTemplate(e.target.value)} className="input-field w-full max-w-md bg-neutral-50 dark:bg-black">
                <option value="" disabled>Select a template...</option>
                {isLoadingTemplates ? (
                   <option disabled>Loading templates...</option>
                ) : (
                  templates.filter(t => t.status === 'APPROVED').map(t => (
                    <option key={t.id} value={t.name}>{t.name} ({t.category})</option>
                  ))
                )}
              </select>
              {templates.length === 0 && !isLoadingTemplates && (
                 <p className="text-xs text-rose-500 mt-2">No templates found. Go to Templates to sync from Meta.</p>
              )}
            </div>

            <div className="pt-4">
              <button 
                onClick={handleLaunch} 
                disabled={!name || !template || launchMutation.isPending} 
                className="btn-primary px-8 py-4 text-lg w-full max-w-md flex items-center justify-center shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none bg-indigo-600 hover:bg-indigo-700 border-none"
              >
                <Send className="w-5 h-5 mr-3" />
                {launchMutation.isPending ? 'Launching Engine...' : 'Launch Broadcast Now'}
              </button>
              <p className="text-sm text-neutral-500 mt-4 max-w-md text-center">
                Messages will begin sending immediately and appear in your dashboard metrics.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="p-8 h-full overflow-y-auto bg-neutral-50 dark:bg-black">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Broadcast Campaigns</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Manage and track your live bulk messaging campaigns.</p>
        </div>
        <button onClick={() => setIsBuilding(true)} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Campaign
        </button>
      </div>

      <div className="card overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
            <thead className="bg-neutral-50 dark:bg-neutral-900 sticky top-0">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-[13px] font-medium text-neutral-500 dark:text-neutral-400">Campaign Name</th>
                <th scope="col" className="px-6 py-4 text-left text-[13px] font-medium text-neutral-500 dark:text-neutral-400">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-[13px] font-medium text-neutral-500 dark:text-neutral-400">Audience Target</th>
                <th scope="col" className="px-6 py-4 text-left text-[13px] font-medium text-neutral-500 dark:text-neutral-400">Total Sent</th>
                <th scope="col" className="px-6 py-4 text-left text-[13px] font-medium text-neutral-500 dark:text-neutral-400">Date Launched</th>
                <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100 dark:bg-neutral-900 dark:divide-neutral-800/50">
              {isLoadingCampaigns ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-neutral-500">Loading campaigns...</td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-neutral-500">No campaigns launched yet.</td>
                </tr>
              ) : campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-900 dark:text-white">{campaign.name}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">{campaign.template_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={clsx(
                      "px-2.5 py-1 inline-flex items-center gap-1.5 text-xs font-medium rounded-full border",
                      campaign.status === 'Completed' ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50" :
                      campaign.status === 'Running' ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/50" :
                      "bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700"
                    )}>
                      {campaign.status === 'Running' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>}
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      {campaign.audience_target}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900 dark:text-white font-semibold">
                      {campaign.total_sent.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                     {new Date(campaign.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                       <button 
                         onClick={() => setAnalyticsCampaign(campaign)}
                         className="p-2 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 rounded dark:hover:bg-indigo-900/30 transition-colors"
                         title="View Funnel Analytics"
                       >
                         <BarChart2 className="h-4 w-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Analytics Panel */}
      {analyticsCampaign && (
        <div className="fixed inset-0 z-50 overflow-hidden flex">
          <div className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm transition-opacity" onClick={() => setAnalyticsCampaign(null)} />
          <div className="ml-auto w-full max-w-md bg-white dark:bg-neutral-900 h-full shadow-2xl relative flex flex-col border-l border-neutral-200 dark:border-neutral-800 transform transition-transform animate-in slide-in-from-right-full duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Campaign Analytics</h2>
              <button onClick={() => setAnalyticsCampaign(null)} className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{analyticsCampaign.name}</h3>
                <p className="text-sm text-neutral-500 mt-1">Status: <span className={analyticsCampaign.status === 'Running' ? 'text-indigo-600 font-semibold' : 'text-neutral-600 font-semibold'}>{analyticsCampaign.status}</span></p>
              </div>

              <h4 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">Conversion Funnel</h4>
              
              <div className="space-y-4">
                {/* 1. Sent */}
                <div className="relative">
                   <div className="flex justify-between items-end mb-1">
                     <span className="text-sm font-medium flex items-center text-neutral-700 dark:text-neutral-300"><Users className="w-4 h-4 mr-2 text-indigo-500"/> Total Sent</span>
                     <span className="text-lg font-bold text-neutral-900 dark:text-white">{analyticsCampaign.total_sent?.toLocaleString() || 0}</span>
                   </div>
                   <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-3">
                     <div className="bg-indigo-500 h-3 rounded-full" style={{ width: '100%' }}></div>
                   </div>
                </div>

                {/* 2. Delivered */}
                <div className="relative pl-4">
                   <div className="absolute left-0 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800"></div>
                   <div className="flex justify-between items-end mb-1">
                     <span className="text-sm font-medium flex items-center text-neutral-700 dark:text-neutral-300"><CheckCircle2 className="w-4 h-4 mr-2 text-blue-500"/> Delivered</span>
                     <div className="text-right">
                       <span className="text-lg font-bold text-neutral-900 dark:text-white">{analyticsCampaign.delivered_count?.toLocaleString() || 0}</span>
                       <span className="text-xs text-neutral-500 ml-2">({analyticsCampaign.total_sent > 0 ? Math.round((analyticsCampaign.delivered_count / analyticsCampaign.total_sent) * 100) : 0}%)</span>
                     </div>
                   </div>
                   <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-3">
                     <div className="bg-blue-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${analyticsCampaign.total_sent > 0 ? (analyticsCampaign.delivered_count / analyticsCampaign.total_sent) * 100 : 0}%` }}></div>
                   </div>
                </div>

                {/* 3. Read */}
                <div className="relative pl-8">
                   <div className="absolute left-0 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800"></div>
                   <div className="flex justify-between items-end mb-1">
                     <span className="text-sm font-medium flex items-center text-neutral-700 dark:text-neutral-300"><Eye className="w-4 h-4 mr-2 text-emerald-500"/> Read (Opened)</span>
                     <div className="text-right">
                       <span className="text-lg font-bold text-neutral-900 dark:text-white">{analyticsCampaign.total_read?.toLocaleString() || 0}</span>
                       <span className="text-xs text-neutral-500 ml-2">({analyticsCampaign.delivered_count > 0 ? Math.round((analyticsCampaign.total_read / analyticsCampaign.delivered_count) * 100) : 0}%)</span>
                     </div>
                   </div>
                   <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-3">
                     <div className="bg-emerald-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${analyticsCampaign.delivered_count > 0 ? (analyticsCampaign.total_read / analyticsCampaign.delivered_count) * 100 : 0}%` }}></div>
                   </div>
                </div>

                {/* 4. Replied */}
                <div className="relative pl-12">
                   <div className="absolute left-0 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800"></div>
                   <div className="flex justify-between items-end mb-1">
                     <span className="text-sm font-medium flex items-center text-neutral-700 dark:text-neutral-300"><Reply className="w-4 h-4 mr-2 text-rose-500"/> Replied</span>
                     <div className="text-right">
                       <span className="text-lg font-bold text-neutral-900 dark:text-white">{analyticsCampaign.replied_count?.toLocaleString() || 0}</span>
                       <span className="text-xs text-neutral-500 ml-2">({analyticsCampaign.total_read > 0 ? Math.round((analyticsCampaign.replied_count / analyticsCampaign.total_read) * 100) : 0}%)</span>
                     </div>
                   </div>
                   <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-3">
                     <div className="bg-rose-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${analyticsCampaign.total_read > 0 ? (analyticsCampaign.replied_count / analyticsCampaign.total_read) * 100 : 0}%` }}></div>
                   </div>
                </div>
              </div>
              
              {/* Failed Stat Box */}
              <div className="mt-8 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-400">Failed to Deliver</h4>
                  <p className="text-xs text-rose-700 dark:text-rose-500">Numbers invalid or opted out</p>
                </div>
                <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
                  {analyticsCampaign.failed_count?.toLocaleString() || 0}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
