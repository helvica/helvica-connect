import React, { useState } from 'react';
import { Plug, Zap, ShoppingCart, CreditCard, Mail, Database, Settings2, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import toast, { Toaster } from 'react-hot-toast';

const INTEGRATIONS = [
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Sync your products, customers, and orders automatically.',
    icon: ShoppingCart,
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    status: 'connected'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Generate payment links directly inside your WhatsApp chats.',
    icon: CreditCard,
    color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    status: 'disconnected'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect Helvica with 5000+ apps using automated workflows.',
    icon: Zap,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    status: 'disconnected'
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Sync your CRM contacts directly to your email marketing lists.',
    icon: Mail,
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    status: 'disconnected'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Two-way sync for deals, tickets, and customer profiles.',
    icon: Database,
    color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    status: 'disconnected'
  },
];

export default function Integrations() {
  const [connections, setConnections] = useState(
    INTEGRATIONS.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.status === 'connected' }), {})
  );
  const [configModal, setConfigModal] = useState(null); // holds the id of the integration being configured
  const [isConnecting, setIsConnecting] = useState(false);

  const handleToggle = (id) => {
    if (connections[id]) {
      // Disconnect immediately
      setConnections(prev => ({ ...prev, [id]: false }));
      toast.success('Integration disconnected');
    } else {
      // Open config modal to connect
      setConfigModal(id);
    }
  };

  const confirmConnection = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setConnections(prev => ({ ...prev, [configModal]: true }));
      setIsConnecting(false);
      setConfigModal(null);
      toast.success('Successfully connected integration!');
    }, 1500);
  };

  const selectedIntegration = INTEGRATIONS.find(i => i.id === configModal);

  return (
    <div className="p-8 h-full flex flex-col bg-neutral-50 dark:bg-black overflow-y-auto">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Plug className="h-6 w-6 text-indigo-500" />
            Integrations
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Connect Helvica to the tools you use every day.</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INTEGRATIONS.map(integration => {
          const isConnected = connections[integration.id];
          const Icon = integration.icon;
          
          return (
            <div key={integration.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden">
              
              {isConnected && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-bl-full flex items-start justify-end p-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              )}

              <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center mb-4", integration.color)}>
                <Icon className="h-6 w-6" />
              </div>
              
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">{integration.name}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 flex-1">
                {integration.description}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800/50">
                <span className={clsx("text-xs font-semibold uppercase tracking-wider", isConnected ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-400")}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
                
                <button 
                  onClick={() => handleToggle(integration.id)}
                  className={clsx(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                    isConnected 
                      ? "bg-neutral-100 text-neutral-600 hover:bg-rose-50 hover:text-rose-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  )}
                >
                  {isConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Config Modal */}
      {configModal && selectedIntegration && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center", selectedIntegration.color)}>
                  <selectedIntegration.icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Connect {selectedIntegration.name}</h2>
                  <p className="text-sm text-neutral-500">Authorize Helvica Connect</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">API Key / Access Token</label>
                  <input type="password" placeholder="••••••••••••••••" className="w-full px-3 py-2 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                </div>
                {selectedIntegration.id === 'shopify' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Store URL</label>
                    <input type="text" placeholder="your-store.myshopify.com" className="w-full px-3 py-2 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                  </div>
                )}
                <div className="flex items-start gap-2 pt-2 text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg">
                  <Settings2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>By connecting, you agree to allow Helvica Connect to read and write data to your {selectedIntegration.name} account based on our terms of service.</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setConfigModal(null)}
                  disabled={isConnecting}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmConnection}
                  disabled={isConnecting}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Authorize Connection'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
