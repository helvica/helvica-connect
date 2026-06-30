import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Bell, MessageCircle, AlertCircle, Info, Check, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    return n.category === activeTab;
  });

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setIsOpen(false);
    if (notification.category === 'Messages') {
      navigate('/inbox');
    }
  };

  const getIcon = (category) => {
    switch(category) {
      case 'Messages': return <MessageCircle className="h-4 w-4 text-emerald-500" />;
      case 'System': return <Info className="h-4 w-4 text-blue-500" />;
      case 'Alerts': return <AlertCircle className="h-4 w-4 text-rose-500" />;
      default: return <Bell className="h-4 w-4 text-indigo-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "p-2 rounded-full transition-colors relative",
          isOpen ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-neutral-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-neutral-900 shadow-xl ring-1 ring-black ring-opacity-5 dark:ring-neutral-700/50 z-50 overflow-hidden flex flex-col max-h-[32rem]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/50">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Notifications</h3>
            <div className="flex gap-2">
              <button onClick={markAllAsRead} className="p-1 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Mark all as read">
                <Check className="h-4 w-4" />
              </button>
              <button onClick={clearAll} className="p-1 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors" title="Clear all">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-2 pt-2">
            {['All', 'Messages', 'System'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                  activeTab === tab 
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" 
                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-neutral-900 p-2 space-y-1">
            {filteredNotifications.length === 0 ? (
              <div className="px-4 py-12 text-center flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center mb-3">
                  <Bell className="h-6 w-6 text-neutral-300 dark:text-neutral-600" />
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">No notifications yet</p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">When you get updates, they'll show up here.</p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={clsx(
                    "relative flex items-start gap-4 p-3 rounded-lg cursor-pointer transition-colors group",
                    !notification.isRead 
                      ? "bg-indigo-50/50 dark:bg-indigo-900/10" 
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  )}
                >
                  <div className={clsx(
                    "flex-shrink-0 mt-1 p-2 rounded-full",
                    !notification.isRead ? "bg-white dark:bg-neutral-800 shadow-sm" : "bg-neutral-100 dark:bg-neutral-800"
                  )}>
                    {getIcon(notification.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={clsx("text-sm font-medium truncate", !notification.isRead ? "text-neutral-900 dark:text-white" : "text-neutral-700 dark:text-neutral-300")}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 font-medium">
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="absolute right-4 top-1/2 -tranneutral-y-1/2 w-2 h-2 rounded-full bg-indigo-500"></div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-center">
            <button 
              onClick={() => { setIsOpen(false); navigate('/notifications'); }}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
