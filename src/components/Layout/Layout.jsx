import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { io } from 'socket.io-client';

export default function Layout() {
  const { currentUser, loading } = useAuth();
  
  // Global Notifications (Sound + Browser Push + Context)
  const { API_URL } = useAuth();
  const { addNotification } = useNotifications();
  
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    if (!API_URL) return;
    const baseUrl = API_URL.replace('/api', '');
    const socket = io(baseUrl);

    socket.on('newMessage', (data) => {
      if (data.sender === 'contact') {
        // 1. Add to React Context
        addNotification({
          title: `New Message from ${data.contactName || 'Customer'}`,
          message: data.text,
          category: 'Messages'
        });

        // 2. Play Sound (Catch error if browser blocks autoplay before user interaction)
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // simple pop sound
          audio.volume = 0.5;
          audio.play().catch(e => console.log('Audio blocked by browser', e));
        } catch (e) {
          console.error('Audio error', e);
        }

        // 2. Show Push Notification
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(`Message from ${data.contactName || 'Customer'}`, {
            body: data.text,
            icon: 'https://cdn-icons-png.flaticon.com/512/3670/3670151.png'
          });
        }
      }
    });

    return () => socket.disconnect();
  }, [API_URL]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-900 transition-colors">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 w-full">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
