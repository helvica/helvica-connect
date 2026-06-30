import React, { useState } from 'react';
import { Plus, RefreshCw, Smartphone, Search, Image as ImageIcon, MessageSquare, ExternalLink, Activity, ArrowRight, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';
import toast, { Toaster } from 'react-hot-toast';

export default function Templates() {
  const { API_URL } = useAuth();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isBuilding, setIsBuilding] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('MARKETING');
  const [language, setLanguage] = useState('en_US');
  const [body, setBody] = useState('');

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

  // 3. Create Template
  const createMutation = useMutation({
    mutationFn: async () => {
      // Mock components for Meta format
      const components = [{ type: 'BODY', text: body }];
      const res = await axios.post(`${API_URL}/templates`, {
        name: name.toLowerCase().replace(/\s+/g, '_'),
        category,
        language,
        components
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template submitted to Meta for review!');
      setIsBuilding(false);
      setName('');
      setBody('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to submit template');
    }
  });

  const handleSave = () => {
    if (!name || !body) return;
    createMutation.mutate();
  };

  const renderPreview = () => {
    let previewText = body;
    previewText = previewText.replace(/\{\{1\}\}/g, '[Name]');
    previewText = previewText.replace(/\{\{2\}\}/g, '[Variable 2]');
    return previewText || 'Start typing to see preview...';
  };

  // Filtering Logic
  const filteredTemplates = templates.filter(tpl => {
    const matchTab = activeTab === 'All' || tpl.status === activeTab;
    const matchCat = activeCategory === 'All' || tpl.category === activeCategory;
    const matchSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchCat && matchSearch;
  });

  if (isBuilding) {
    return (
      <div className="flex h-full bg-neutral-50 dark:bg-black overflow-hidden">
        <Toaster position="top-right" />
        <div className="flex-1 p-8 overflow-y-auto">
          <button 
            onClick={() => setIsBuilding(false)}
            className="flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-6 transition-colors"
          >
            <X className="w-5 h-5 mr-2" />
            Cancel
          </button>
          
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Create AI-Flow Template</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8">Design and submit a new WhatsApp template to Meta for instant review.</p>
          
          <div className="space-y-6 max-w-2xl">
            <div className="card p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <label className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Template Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. summer_sale_alert"
                className="input-field w-full bg-neutral-50 dark:bg-black"
                disabled={createMutation.isPending}
              />
              <p className="text-xs text-neutral-500 mt-2">Lowercase letters and underscores only.</p>
            </div>

            <div className="card p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field w-full bg-neutral-50 dark:bg-black" disabled={createMutation.isPending}>
                  <option value="MARKETING">Marketing</option>
                  <option value="UTILITY">Utility</option>
                  <option value="AUTHENTICATION">Authentication</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input-field w-full bg-neutral-50 dark:bg-black" disabled={createMutation.isPending}>
                  <option value="en_US">English (US)</option>
                  <option value="es_ES">Spanish (Spain)</option>
                </select>
              </div>
            </div>

            <div className="card p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <label className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Message Body</label>
              <textarea 
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Hi {{1}}, thanks for your order! Your total is {{2}}."
                className="input-field w-full resize-none bg-neutral-50 dark:bg-black"
                disabled={createMutation.isPending}
              ></textarea>
            </div>

            <button onClick={handleSave} disabled={!name || !body || createMutation.isPending} className="btn-primary w-full py-3 flex items-center justify-center disabled:opacity-50 text-base font-semibold shadow-lg shadow-indigo-500/30">
              {createMutation.isPending ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <ArrowRight className="w-5 h-5 mr-2" />}
              Submit to Meta
            </button>
          </div>
        </div>

        {/* Live Preview Side */}
        <div className="w-[450px] bg-neutral-100 dark:bg-neutral-900/50 border-l border-neutral-200 dark:border-neutral-800 p-8 flex flex-col items-center justify-center overflow-y-auto shrink-0">
          <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-medium mb-6">
            <Smartphone className="w-5 h-5" /> Live Preview
          </div>
          
          <div className="w-[320px] h-[650px] bg-black rounded-[40px] shadow-2xl p-3 relative border-4 border-neutral-800 shrink-0">
            <div className="w-full h-full bg-[#EFEAE2] dark:bg-[#111B21] rounded-[28px] overflow-hidden flex flex-col relative">
              <div className="h-16 bg-[#008069] dark:bg-[#202C33] flex items-center px-4 shrink-0 shadow-sm z-10">
                <div className="w-8 h-8 rounded-full bg-neutral-300 dark:bg-neutral-600"></div>
                <div className="ml-3">
                  <div className="text-white font-semibold text-sm">Business Account</div>
                  <div className="text-white/80 text-[10px]">online</div>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto relative bg-[#EFEAE2] dark:bg-[#111B21]">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png")', backgroundSize: '400px' }}></div>
                {body && (
                  <div className="bg-white dark:bg-[#202C33] p-3 rounded-lg rounded-tl-none shadow-sm max-w-[90%] relative z-10 border border-neutral-100 dark:border-transparent">
                    <p className="text-sm text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap leading-relaxed">
                      {renderPreview()}
                    </p>
                    <div className="text-[10px] text-neutral-400 text-right mt-1">12:00 PM</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD VIEW ---
  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-black">
      <Toaster position="top-right" />
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 px-8 py-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400 border border-emerald-500/30 font-bold text-xs uppercase tracking-wider">
            Try AI
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" /> Introducing AI-Flows.
            </h2>
            <p className="text-emerald-100/80 text-sm mt-0.5">Instantly create smart, high-converting WhatsApp flows with AI.</p>
          </div>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-emerald-500/20 transition-all">
          Generate flow with AI
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Filters */}
        <div className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-6 flex flex-col shrink-0 overflow-y-auto">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Category</h3>
          <div className="space-y-1">
            {['All', 'MARKETING', 'UTILITY', 'AUTHENTICATION'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={clsx(
                  "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
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
          <div className="p-8 pb-4">
            {/* Header & Search */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -tranneutral-y-1/2 h-4 w-4 text-neutral-400" />
                <input 
                  type="text" 
                  placeholder="Search templates (status, name etc.)" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-9 bg-white dark:bg-neutral-900 shadow-sm border-neutral-200 dark:border-neutral-800"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => syncMutation.mutate()} 
                  disabled={syncMutation.isPending}
                  className="btn-secondary flex items-center bg-white dark:bg-neutral-900 shadow-sm"
                >
                  <RefreshCw className={clsx("w-4 h-4 mr-2", syncMutation.isPending && "animate-spin")} /> 
                  Sync Status
                </button>
                <button onClick={() => setIsBuilding(true)} className="btn-primary shadow-lg shadow-indigo-500/20">
                  <Plus className="w-4 h-4 mr-2" /> New Template
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
          <div className="flex-1 overflow-y-auto p-8 pt-4">
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
