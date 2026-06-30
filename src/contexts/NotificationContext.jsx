import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([
    {
      id: 'sys-1',
      title: 'System Online',
      message: 'Helvica Connect backend is running properly.',
      category: 'System',
      isRead: false,
      timestamp: Date.now() - 60000,
    }
  ]);

  // Preferences state
  const [soundEnabled, setSoundEnabled] = useState(() => JSON.parse(localStorage.getItem('helvica_sound_enabled') ?? 'true'));
  const [soundType, setSoundType] = useState(() => localStorage.getItem('helvica_sound_type') || 'pop');

  useEffect(() => {
    localStorage.setItem('helvica_sound_enabled', JSON.stringify(soundEnabled));
    localStorage.setItem('helvica_sound_type', soundType);
  }, [soundEnabled, soundType]);

  const playSound = useCallback(() => {
    if (!soundEnabled) return;
    
    // Using open source mixkit SFX URLs for immediate setup
    let url = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'; // pop
    if (soundType === 'chime') url = 'https://assets.mixkit.co/active_storage/sfx/2867/2867-preview.mp3';
    if (soundType === 'bell') url = 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3';
    
    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed (browser policy):', e));
  }, [soundEnabled, soundType]);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [
      {
        ...notification,
        id: `notif-${Date.now()}-${Math.random()}`,
        isRead: false,
        timestamp: Date.now()
      },
      ...prev
    ]);
    playSound();
  }, [playSound]);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      soundEnabled,
      setSoundEnabled,
      soundType,
      setSoundType,
      playSound // expose for testing in settings
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
