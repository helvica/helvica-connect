import React, { useState } from 'react';
import { Plus, RefreshCw, Smartphone, Search, Image as ImageIcon, MessageSquare, ExternalLink, Activity, ArrowRight, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';
import toast, { Toaster } from 'react-hot-toast';
import TemplateBuilder from '../components/Templates/TemplateBuilder';

export default function Templates() {
  const { API_URL } = useAuth();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isBuilding, setIsBuilding] = useState(false);

  // 1. Fetch Local Templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/templates`);
      return res.data;
    }
  });

  // 2. Sync with Meta
  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`${API_URL}/templates/sync`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Successfully synced with Meta!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to sync with Meta');
    }
  });

  if (isBuilding) {
    return (
      <TemplateBuilder 
        onCancel={() => setIsBuilding(false)} 
        onSuccess={() => {
          setIsBuilding(false);
          queryClient.invalidateQueries({ queryKey: ['templates'] });
        }} 
      />
    );
  }

  // --- MAIN DASHBOARD VIEW ---
  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-black">
      <Toaster position="top-right" />
      

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left Sidebar Filters */}
        <div className="w-full md:w-56 bg-white dark:bg-neutral-900 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 p-3 md:p-6 flex flex-col shrink-0 overflow-x-auto md:overflow-y-auto">
          <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 md:mb-4 shrink-0">Category</h3>
          <div className="flex flex-row md:flex-col space-x-1.5 md:space-x-0 md:space-y-1 min-w-max pb-1 md:pb-0">
            {['All', 'MARKETING', 'UTILITY', 'AUTHENTICATION'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={clsx(
                  "w-full text-left px-3 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium transition-colors",
                  activeCategory === cat 
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                    : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800/50"
                )}
              >
                {cat === 'All' ? 'Explore All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 md:p-8 pb-4">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-5">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input 
                  type="text" 
                  placeholder="Search templates..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-9 bg-white dark:bg-neutral-900 shadow-sm border-neutral-200 dark:border-neutral-800 text-sm py-1.5"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={() => syncMutation.mutate()} 
                  disabled={syncMutation.isPending}
                  className="btn-secondary flex-1 md:flex-none items-center bg-white dark:bg-neutral-900 shadow-sm text-xs px-3 py-1.5"
                >
                  <RefreshCw className={clsx("w-3.5 h-3.5 mr-1.5", syncMutation.isPending && "animate-spin")} /> 
                  Sync
                </button>
                <button onClick={() => setIsBuilding(true)} className="btn-primary flex-1 md:flex-none shadow-lg shadow-indigo-500/20 text-xs px-3 py-1.5">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> New
                </button>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex border-b border-neutral-200 dark:border-neutral-800">
              {['All', 'APPROVED', 'PENDING', 'REJECTED'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    "px-6 py-3 text-sm font-semibold border-b-2 transition-colors",
                    activeTab === tab 
                      ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" 
                      : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  )}
                >
                  {tab === 'All' ? 'All Templates' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Grid View */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-20 text-neutral-500">No templates found matching this criteria.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map(tpl => {
                  let parsedBody = "No text content";
                  try {
                    const comps = typeof tpl.components === 'string' ? JSON.parse(tpl.components) : tpl.components;
                    const bodyComp = comps?.find(c => c.type === 'BODY');
                    if (bodyComp && bodyComp.text) parsedBody = bodyComp.text;
                  } catch (e) {}

                  return (
                    <div key={tpl.id} className="card bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors shadow-sm group">
                      
                      {/* Card Header */}
                      <div className="p-4 border-b border-neutral-100 dark:border-neutral-800/50 flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className={clsx(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                            tpl.status === 'APPROVED' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                            tpl.status === 'PENDING' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                            "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                          )}>
                            {tpl.status}
                          </span>
                        </div>
                        <div className="p-1.5 bg-neutral-50 dark:bg-neutral-800 rounded text-neutral-400">
                          {tpl.category === 'MARKETING' ? <ImageIcon className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 mb-4">
                          <MessageSquare className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-neutral-900 dark:text-white mb-2 line-clamp-1">{tpl.name}</h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 line-clamp-3 flex-1 leading-relaxed">
                          {parsedBody}
                        </p>
                        
                        <div className="flex gap-2 mt-auto">
                          <button className="flex-1 py-2 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex justify-center items-center">
                            Preview
                          </button>
                          <button className="flex-1 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors flex justify-center items-center">
                            Submit <ExternalLink className="w-3 h-3 ml-1" />
                          </button>
                        </div>
                      </div>
                      
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
