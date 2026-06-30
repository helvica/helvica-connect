import React from 'react';
import { Mail, Settings, Inbox, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmailChat() {
  return (
    <div className="flex h-full bg-white dark:bg-black transition-colors">
      {/* Left Sidebar - Chat List */}
      <div className="w-80 border-r border-neutral-200 dark:border-neutral-800 flex flex-col bg-neutral-50 dark:bg-neutral-900/30">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center">
            <Mail className="h-5 w-5 mr-2 text-indigo-500" />
            Email Chat
          </h2>
          <Link 
            to="/email-chat/settings" 
            className="p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
            title="Email Integration Settings"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
        
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-neutral-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-500">
          <div className="h-12 w-12 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <Inbox className="h-6 w-6 text-neutral-400" />
          </div>
          <p className="text-sm">No active email chats right now.</p>
          <p className="text-xs mt-2">Waiting for new messages from your website widget...</p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-neutral-900">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-6">
            <Mail className="h-8 w-8 text-indigo-500" />
          </div>
          <h3 className="text-xl font-medium text-neutral-900 dark:text-white mb-2">Email Chat Central</h3>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mb-6">
            Connect with your website visitors in real-time through email or live chat widget integration.
          </p>
          <Link 
            to="/email-chat/settings"
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm inline-flex items-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            Setup Website Integration
          </Link>
        </div>
      </div>
    </div>
  );
}
