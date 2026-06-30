import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Bell, MessageCircle, AlertCircle, Info, Check, Trash2, Search, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function Notifications() {
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotifications = notifications.filter(n => {
    const matchCategory = filter === 'All' || n.category === filter;
    const matchSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const getIcon = (category) => {
    switch(category) {
      case 'Messages': return <MessageCircle className="h-5 w-5 text-emerald-500" />;
      case 'System': return <Info className="h-5 w-5 text-blue-500" />;
      case 'Alerts': return <AlertCircle className="h-5 w-5 text-rose-500" />;
      default: return <Bell className="h-5 w-5 text-indigo-500" />;
    }
  };

  const handleActionClick = (notification) => {
    markAsRead(notification.id);
    if (notification.category === 'Messages') {
      navigate('/inbox');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Bell className="h-6 w-6 text-indigo-500" /> Notification Center
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">View and manage all your recent alerts and messages.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={markAllAsRead} 
            className="btn-secondary flex items-center gap-2"
          >
            <Check className="h-4 w-4" /> Mark All Read
          </button>
          <button 
            onClick={clearAll} 
            className="px-4 py-2 text-sm font-medium rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-900/20 transition-colors flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" /> Clear All
          </button>
        </div>
      </div>

      <div className="card flex-1 flex flex-col overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-xl">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {['All', 'Messages', 'System', 'Alerts'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  "px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors",
                  filter === f 
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                    : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -tranneutral-y-1/2 h-4 w-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search notifications..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9 bg-white dark:bg-black w-full"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500 dark:text-neutral-400 py-12">
              <div className="h-16 w-16 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white">All Caught Up!</h3>
              <p className="mt-1 text-sm max-w-sm text-center">You have no notifications matching this criteria.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotifications.map(notification => (
                <div 
                  key={notification.id}
                  className={clsx(
                    "flex flex-col sm:flex-row gap-4 p-4 rounded-lg transition-colors group",
                    !notification.isRead 
                      ? "bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30" 
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50 border border-transparent hover:border-neutral-100 dark:hover:border-neutral-800"
                  )}
                >
                  <div className={clsx(
                    "flex-shrink-0 p-3 rounded-full self-start",
                    !notification.isRead ? "bg-white dark:bg-neutral-800 shadow-sm" : "bg-neutral-100 dark:bg-neutral-800"
                  )}>
                    {getIcon(notification.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={clsx("text-base font-semibold truncate pr-4", !notification.isRead ? "text-neutral-900 dark:text-white" : "text-neutral-700 dark:text-neutral-300")}>
                        {notification.title}
                      </h3>
                      <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 mb-3">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-3 mt-auto">
                      <span className={clsx(
                        "px-2 py-0.5 rounded text-xs font-medium",
                        notification.category === 'System' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                        notification.category === 'Messages' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                      )}>
                        {notification.category}
                      </span>
                      
                      {!notification.isRead && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end sm:ml-4 sm:pl-4 sm:border-l border-neutral-100 dark:border-neutral-800 mt-4 sm:mt-0">
                    <button 
                      onClick={() => handleActionClick(notification)}
                      className="w-full sm:w-auto px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium text-sm hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      {notification.category === 'Messages' ? 'Reply in Inbox' : 'View Details'} 
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
