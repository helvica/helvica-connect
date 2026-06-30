import React, { useState, useEffect } from 'react';
import { User, MessageCircle, CreditCard, Save, Shield, Key, Bell, Volume2, VolumeX, Play, Loader2, Wand2 } from 'lucide-react';
import clsx from 'clsx';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const { API_URL } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('api');

  // Form States
  const [apiToken, setApiToken] = useState('EAAI... (Mock Token)');
  const [phoneId, setPhoneId] = useState('123456789012345');
  const [verifyToken, setVerifyToken] = useState('helvica_secure_2026');

  const { soundEnabled, setSoundEnabled, soundType, setSoundType, playSound } = useNotifications();

  // Profile Form States
  const [isProfileInitialized, setIsProfileInitialized] = useState(false);
  const [profileForm, setProfileForm] = useState({
    display_name: '',
    category: 'Other',
    description: '',
    address: '',
    email: '',
    website1: '',
    website2: ''
  });

  // Fetch Profile
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['companyProfile'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/profile`);
      return res.data;
    }
  });

  useEffect(() => {
    if (profileData && !isProfileInitialized) {
      setProfileForm({
        display_name: profileData.display_name || '',
        category: profileData.category || 'Other',
        description: profileData.description || '',
        address: profileData.address || '',
        email: profileData.email || '',
        website1: profileData.website1 || '',
        website2: profileData.website2 || ''
      });
      setIsProfileInitialized(true);
    }
  }, [profileData, isProfileInitialized]);

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      await axios.post(`${API_URL}/profile`, data);
    },
    onSuccess: () => {
      toast.success('Profile saved to Meta successfully!');
      queryClient.invalidateQueries(['companyProfile']);
    },
    onError: () => {
      toast.error('Failed to save profile.');
    }
  });

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  // AI Form States
  const [isAiInitialized, setIsAiInitialized] = useState(false);
  const [aiForm, setAiForm] = useState({
    api_key: '',
    system_prompt: ''
  });

  // Fetch AI Settings
  const { data: aiData, isLoading: aiLoading } = useQuery({
    queryKey: ['aiSettings'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/ai/settings`);
      return res.data;
    }
  });

  useEffect(() => {
    if (aiData && !isAiInitialized) {
      setAiForm({
        api_key: aiData.api_key || '',
        system_prompt: aiData.system_prompt || ''
      });
      setIsAiInitialized(true);
    }
  }, [aiData, isAiInitialized]);

  // Update AI Settings Mutation
  const updateAiMutation = useMutation({
    mutationFn: async (data) => {
      await axios.post(`${API_URL}/ai/settings`, data);
    },
    onSuccess: () => {
      toast.success('AI Settings saved successfully!');
      queryClient.invalidateQueries(['aiSettings']);
    },
    onError: () => {
      toast.error('Failed to save AI settings.');
    }
  });

  const handleAiChange = (e) => {
    setAiForm({ ...aiForm, [e.target.name]: e.target.value });
  };

  const tabs = [
    { id: 'profile', name: 'Business Profile', icon: User },
    { id: 'api', name: 'WhatsApp API', icon: MessageCircle },
    { id: 'ai', name: 'AI Assistant', icon: Wand2 },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'billing', name: 'Billing & Plan', icon: CreditCard },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Manage your account and platform configurations.</p>
      </div>

      <div className="flex flex-1 overflow-hidden bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
        
        {/* Settings Sidebar */}
        <div className="w-64 border-r border-neutral-200 dark:border-neutral-800 p-6 bg-neutral-50/50 dark:bg-neutral-900/50">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
                )}
              >
                <tab.icon className={clsx(
                  'mr-3 h-5 w-5 shrink-0',
                  activeTab === tab.id ? 'text-indigo-700 dark:text-indigo-400' : 'text-neutral-400 dark:text-neutral-500'
                )} />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'api' && (
            <div className="max-w-2xl">
              <div className="flex items-center mb-6">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 mr-4">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Meta API Configuration</h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Connect Helvica to your official WhatsApp Business Account.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Permanent Access Token</label>
                  <p className="text-xs text-neutral-500 mb-2">Generated from the Meta App Dashboard under System Users.</p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-4 w-4 text-neutral-400" />
                    </div>
                    <input 
                      type="password" 
                      value={apiToken}
                      onChange={(e) => setApiToken(e.target.value)}
                      className="input-field pl-10 w-full font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Phone Number ID</label>
                  <p className="text-xs text-neutral-500 mb-2">The unique ID of the phone number sending messages.</p>
                  <input 
                    type="text" 
                    value={phoneId}
                    onChange={(e) => setPhoneId(e.target.value)}
                    className="input-field w-full font-mono text-sm"
                  />
                </div>

                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <h3 className="text-md font-bold text-neutral-900 dark:text-white mb-4">Webhook Configuration</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Callback URL</label>
                    <p className="text-xs text-neutral-500 mb-2">Paste this URL into the Meta Developer Dashboard.</p>
                    <div className="flex">
                      <input 
                        type="text" 
                        readOnly
                        value="https://api.helvicaconnect.com/webhooks/meta"
                        className="input-field w-full font-mono text-sm bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Verify Token</label>
                    <p className="text-xs text-neutral-500 mb-2">A custom secret string used to verify the webhook connection.</p>
                    <input 
                      type="text" 
                      value={verifyToken}
                      onChange={(e) => setVerifyToken(e.target.value)}
                      className="input-field w-full font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button className="btn-primary flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="max-w-2xl">
              <div className="flex items-center mb-6">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 mr-4">
                  <Wand2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">AI Assistant Settings</h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Configure AI auto-replies and suggestions powered by OpenAI.</p>
                </div>
              </div>

              {aiLoading ? (
                <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">OpenAI API Key</label>
                    <p className="text-xs text-neutral-500 mb-2">Leave blank to use mock responses for testing.</p>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-4 w-4 text-neutral-400" />
                      </div>
                      <input 
                        type="password" 
                        name="api_key"
                        value={aiForm.api_key}
                        onChange={handleAiChange}
                        placeholder="sk-..."
                        className="input-field w-full font-mono text-sm pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">System Prompt</label>
                    <p className="text-xs text-neutral-500 mb-2">Instructions defining the personality and behavior of the AI assistant.</p>
                    <textarea 
                      name="system_prompt"
                      value={aiForm.system_prompt}
                      onChange={handleAiChange}
                      rows="4"
                      className="input-field w-full text-sm resize-none"
                    />
                  </div>

                  <div className="pt-6">
                    <button 
                      onClick={() => updateAiMutation.mutate(aiForm)}
                      disabled={updateAiMutation.isPending}
                      className="btn-primary flex items-center"
                    >
                      {updateAiMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save AI Settings
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">WhatsApp Business Profile</h2>
              <p className="text-neutral-500 dark:text-neutral-400 mb-8">Update the photo, name, and details that people will see when they get a message from you.</p>
              
              <div className="space-y-6">
                
                {/* Profile Picture & Display Name */}
                <div className="flex items-start gap-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 rounded-full bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden">
                       <User className="w-8 h-8 text-neutral-400" />
                    </div>
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">Choose file</button>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Display name</label>
                    <div className="flex items-center gap-2 mb-2">
                       <input type="text" name="display_name" value={profileForm.display_name} onChange={handleProfileChange} className="input-field w-full max-w-xs" />
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Approved</span>
                    </div>
                    <p className="text-xs text-neutral-500 max-w-sm">This shows that WhatsApp has confirmed that an authentic and notable brand owns this account.</p>
                  </div>
                </div>

                {/* Business Information */}
                <div>
                   <h3 className="text-md font-bold text-neutral-900 dark:text-white mb-4">Business information</h3>
                   
                   <div className="space-y-5">
                       <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Category</label>
                        <select name="category" value={profileForm.category} onChange={handleProfileChange} className="input-field w-full">
                           <option value="Medical and health">Medical and health</option>
                           <option value="Education">Education</option>
                           <option value="Retail">Retail</option>
                           <option value="Finance">Finance</option>
                           <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Description <span className="text-neutral-400 font-normal">• Optional</span></label>
                        <textarea 
                           rows={3} 
                           name="description"
                           value={profileForm.description}
                           onChange={handleProfileChange}
                           className="input-field w-full"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Address <span className="text-neutral-400 font-normal">• Optional</span></label>
                        <input type="text" name="address" value={profileForm.address} onChange={handleProfileChange} placeholder="Enter business address" className="input-field w-full" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email <span className="text-neutral-400 font-normal">• Optional</span></label>
                        <input type="email" name="email" value={profileForm.email} onChange={handleProfileChange} className="input-field w-full" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Website <span className="text-neutral-400 font-normal">• Optional</span></label>
                        <input type="url" name="website1" value={profileForm.website1} onChange={handleProfileChange} placeholder="https://www.example.com" className="input-field w-full mb-2" />
                        <input type="url" name="website2" value={profileForm.website2} onChange={handleProfileChange} placeholder="https://www.example.com" className="input-field w-full" />
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
                  <button 
                    onClick={() => updateProfileMutation.mutate(profileForm)}
                    disabled={updateProfileMutation.isPending || profileLoading}
                    className="btn-primary flex items-center disabled:opacity-50"
                  >
                    {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Profile to Meta
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-2xl">
              <div className="flex items-center mb-6">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 mr-4">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Notification Preferences</h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Control how and when you are notified of new messages.</p>
                </div>
              </div>

              <div className="space-y-8 mt-8">
                {/* Sound Toggle */}
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-6">
                  <div>
                    <h3 className="text-md font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
                      In-App Sound Alerts
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Play a sound when you receive a new WhatsApp message.</p>
                  </div>
                  <button 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={clsx(
                      "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                      soundEnabled ? 'bg-indigo-600' : 'bg-neutral-200 dark:bg-neutral-700'
                    )}
                  >
                    <span 
                      className={clsx(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        soundEnabled ? 'tranneutral-x-5' : 'tranneutral-x-0'
                      )}
                    />
                  </button>
                </div>

                {/* Sound Type Selection */}
                <div className={clsx("transition-opacity", !soundEnabled && "opacity-50 pointer-events-none")}>
                  <h3 className="text-md font-bold text-neutral-900 dark:text-white mb-4">Notification Sound</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {['pop', 'chime', 'bell'].map((type) => (
                      <div 
                        key={type}
                        onClick={() => { setSoundType(type); if(soundEnabled) playSound(); }}
                        className={clsx(
                          "relative flex cursor-pointer rounded-lg border bg-white dark:bg-neutral-900 p-4 shadow-sm focus:outline-none",
                          soundType === type 
                            ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/30 dark:bg-indigo-500/10' 
                            : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        )}
                      >
                        <span className="flex flex-1">
                          <span className="flex flex-col">
                            <span className="block text-sm font-medium text-neutral-900 dark:text-white capitalize">
                              {type} Sound
                            </span>
                          </span>
                        </span>
                        {soundType === type && (
                          <Play className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4">
                     <button onClick={playSound} disabled={!soundEnabled} className="btn-secondary text-xs">
                        <Play className="w-3 h-3 mr-1" /> Test Sound
                     </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Billing & Subscription</h2>
              
              <div className="border-2 border-indigo-500 rounded-xl p-6 bg-indigo-50 dark:bg-indigo-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  Active Plan
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">Pro Tier</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mt-2">Unlimited conversations, advanced automation, and priority support.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-neutral-900 dark:text-white">$49</span>
                  <span className="text-neutral-500 ml-2">/ month</span>
                </div>
                <div className="mt-8 flex gap-3">
                  <button className="btn-primary">Manage Subscription</button>
                  <button className="btn-secondary">View Invoices</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
